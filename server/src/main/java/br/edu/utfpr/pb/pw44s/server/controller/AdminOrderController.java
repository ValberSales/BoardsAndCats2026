package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.dto.DashboardStatsDTO;
import br.edu.utfpr.pb.pw44s.server.dto.OrderDTO;
import br.edu.utfpr.pb.pw44s.server.model.Order;
import br.edu.utfpr.pb.pw44s.server.model.OrderDocument;
import br.edu.utfpr.pb.pw44s.server.model.OrderStatus;
import org.hibernate.Hibernate;
import br.edu.utfpr.pb.pw44s.server.repository.OrderDocumentRepository;
import br.edu.utfpr.pb.pw44s.server.repository.OrderRepository;
import br.edu.utfpr.pb.pw44s.server.repository.ProductRepository;
import br.edu.utfpr.pb.pw44s.server.service.EmailService;
import br.edu.utfpr.pb.pw44s.server.service.LogService;
import br.edu.utfpr.pb.pw44s.server.service.MinioService;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderDocumentRepository orderDocumentRepository;
    private final ProductRepository productRepository;
    private final MinioService minioService;
    private final EmailService emailService;
    private final LogService logService;
    private final ModelMapper modelMapper;

    public AdminOrderController(OrderRepository orderRepository,
                                OrderDocumentRepository orderDocumentRepository,
                                ProductRepository productRepository,
                                MinioService minioService,
                                EmailService emailService,
                                LogService logService,
                                ModelMapper modelMapper) {
        this.orderRepository = orderRepository;
        this.orderDocumentRepository = orderDocumentRepository;
        this.productRepository = productRepository;
        this.minioService = minioService;
        this.emailService = emailService;
        this.logService = logService;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        List<OrderDTO> dtos = orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        return ResponseEntity.ok(modelMapper.map(order, OrderDTO.class));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id,
                                                      @RequestParam OrderStatus status,
                                                      @RequestParam(required = false) String trackingCode) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        order.setStatusDate(java.time.LocalDateTime.now());
        if (trackingCode != null && !trackingCode.trim().isEmpty()) {
            order.setTrackingCode(trackingCode);
        }
        Order savedOrder = orderRepository.save(order);

        // Log operation
        logService.log("UPDATE_ORDER_STATUS",
                String.format("Order ID: %d | Old Status: %s | New Status: %s | Tracking: %s",
                        id, oldStatus, status, order.getTrackingCode()));

        // Send Notification Email
        if (savedOrder.getClientDetails() != null && savedOrder.getClientDetails().getEmail() != null) {
            // Eagerly load items and products within the open transaction context
            Hibernate.initialize(savedOrder.getItems());
            savedOrder.getItems().forEach(item -> Hibernate.initialize(item.getProduct()));

            byte[] attachmentBytes = null;
            String attachmentName = null;
            String contentType = null;

            if (status == OrderStatus.SHIPPED) {
                try {
                    List<OrderDocument> docs = orderDocumentRepository.findByOrderId(id);
                    if (docs != null && !docs.isEmpty()) {
                        // Use the latest document uploaded
                        OrderDocument doc = docs.get(docs.size() - 1);
                        InputStream docStream = minioService.downloadFile(doc.getMinioPath());
                        if (docStream != null) {
                            attachmentBytes = docStream.readAllBytes();
                            attachmentName = doc.getFileName();
                            contentType = doc.getContentType();
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Erro ao obter documento do Minio para o envio do email: " + e.getMessage());
                }
            }

            try {
                emailService.sendOrderStatusUpdateEmail(savedOrder, oldStatus, status, attachmentBytes, attachmentName, contentType);
            } catch (Exception e) {
                System.err.println("Erro ao disparar email de atualizacao do pedido: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(modelMapper.map(savedOrder, OrderDTO.class));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<OrderDocument> uploadDocument(@PathVariable Long id,
                                                        @RequestParam("file") MultipartFile file) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));

        String minioPath = minioService.uploadFile(file);

        OrderDocument doc = OrderDocument.builder()
                .order(order)
                .fileName(file.getOriginalFilename())
                .minioPath(minioPath)
                .contentType(file.getContentType())
                .build();

        OrderDocument savedDoc = orderDocumentRepository.save(doc);

        logService.log("UPLOAD_ORDER_DOCUMENT",
                String.format("Order ID: %d | Document ID: %d | File Name: %s | Minio Path: %s",
                        id, savedDoc.getId(), doc.getFileName(), minioPath));

        return ResponseEntity.status(HttpStatus.CREATED).body(savedDoc);
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<OrderDocument>> getOrderDocuments(@PathVariable Long id) {
        // Verify order exists
        if (!orderRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado");
        }
        List<OrderDocument> docs = orderDocumentRepository.findByOrderId(id);
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/documents/{docId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long docId) {
        OrderDocument doc = orderDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento não encontrado"));

        InputStream stream = minioService.downloadFile(doc.getMinioPath());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(new InputStreamResource(stream));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        List<Order> orders = orderRepository.findAll();

        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();
        long pending = orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long paid = orders.stream().filter(o -> o.getStatus() == OrderStatus.PAID).count();
        long shipped = orders.stream().filter(o -> o.getStatus() == OrderStatus.SHIPPED).count();
        long delivered = orders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        long canceled = orders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELED).count();

        long lowStock = productRepository.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 5)
                .count();

        DashboardStatsDTO stats = new DashboardStatsDTO(
                totalRevenue, totalOrders, pending, paid, shipped, delivered, canceled, lowStock
        );

        return ResponseEntity.ok(stats);
    }
}
