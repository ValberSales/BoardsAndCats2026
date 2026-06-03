package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.dto.CheckoutDTO;
import br.edu.utfpr.pb.pw44s.server.dto.OrderDTO;
import br.edu.utfpr.pb.pw44s.server.model.Order;
import br.edu.utfpr.pb.pw44s.server.model.User;
import br.edu.utfpr.pb.pw44s.server.service.IOrderService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import br.edu.utfpr.pb.pw44s.server.model.OrderDocument;
import br.edu.utfpr.pb.pw44s.server.repository.OrderDocumentRepository;
import br.edu.utfpr.pb.pw44s.server.service.MinioService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("orders")
public class OrderController {

    private final IOrderService orderService;
    private final ModelMapper modelMapper;
    private final OrderDocumentRepository orderDocumentRepository;
    private final MinioService minioService;
    private final br.edu.utfpr.pb.pw44s.server.service.ICartService cartService;

    public OrderController(IOrderService orderService,
                           ModelMapper modelMapper,
                           OrderDocumentRepository orderDocumentRepository,
                           MinioService minioService,
                           br.edu.utfpr.pb.pw44s.server.service.ICartService cartService) {
        this.orderService = orderService;
        this.modelMapper = modelMapper;
        this.orderDocumentRepository = orderDocumentRepository;
        this.minioService = minioService;
        this.cartService = cartService;
    }

    @PostMapping("checkout")
    public ResponseEntity<OrderDTO> checkout(@RequestBody @Valid CheckoutDTO checkoutDTO,
                                             @AuthenticationPrincipal User user) {
        Order finalizedOrder = orderService.checkoutFromCart(checkoutDTO, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(modelMapper.map(finalizedOrder, OrderDTO.class));
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> findMyOrders(@AuthenticationPrincipal User user) {
        List<Order> orders = orderService.findFinalizedByUserId(user.getId());
        List<OrderDTO> dtos = orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("{id}")
    public ResponseEntity<OrderDTO> findOne(@PathVariable Long id,
                                            @AuthenticationPrincipal User user) {
        Order order = findOrderAndCheckOwner(id, user);
        return ResponseEntity.ok(modelMapper.map(order, OrderDTO.class));
    }

    @PostMapping("{id}/cancel")
    public ResponseEntity<OrderDTO> cancel(@PathVariable Long id,
                                           @AuthenticationPrincipal User user) {
        findOrderAndCheckOwner(id, user);
        Order canceledOrder = orderService.cancel(id);
        return ResponseEntity.ok(modelMapper.map(canceledOrder, OrderDTO.class));
    }

    @GetMapping("{orderId}/documents/{docId}/download")
    public ResponseEntity<Resource> downloadMyDocument(@PathVariable Long orderId,
                                                       @PathVariable Long docId,
                                                       @AuthenticationPrincipal User user) {
        Order order = findOrderAndCheckOwner(orderId, user);
        OrderDocument doc = orderDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento não encontrado"));
        if (!doc.getOrder().getId().equals(order.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Documento não pertence a este pedido.");
        }

        InputStream stream = minioService.downloadFile(doc.getMinioPath());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(new InputStreamResource(stream));
    }

    @GetMapping("cart")
    public ResponseEntity<br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO> getCart(@AuthenticationPrincipal User user) {
        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = cartService.getAndValidateCart(user);
        if (cartDTO == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(cartDTO);
    }

    @PostMapping("cart/items")
    public ResponseEntity<br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO> addItemToCart(@RequestBody @Valid br.edu.utfpr.pb.pw44s.server.dto.CartItemDTO itemDTO,
                                                                                          @AuthenticationPrincipal User user) {
        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = cartService.addItemToCart(user, itemDTO.getProductId(), itemDTO.getQuantity());
        return ResponseEntity.ok(cartDTO);
    }

    @PutMapping("cart/items/{productId}")
    public ResponseEntity<br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO> updateItemQuantity(@PathVariable Long productId,
                                                                                               @RequestBody @Valid br.edu.utfpr.pb.pw44s.server.dto.CartItemDTO itemDTO,
                                                                                               @AuthenticationPrincipal User user) {
        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = cartService.updateItemQuantity(user, productId, itemDTO.getQuantity());
        return ResponseEntity.ok(cartDTO);
    }

    @DeleteMapping("cart/items/{productId}")
    public ResponseEntity<br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO> removeItem(@PathVariable Long productId,
                                                                                       @AuthenticationPrincipal User user) {
        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = cartService.removeItem(user, productId);
        if (cartDTO == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(cartDTO);
    }

    @DeleteMapping("cart")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("cart/checkout")
    public ResponseEntity<OrderDTO> cartCheckout(@RequestBody @Valid CheckoutDTO checkoutDTO,
                                                 @AuthenticationPrincipal User user) {
        Order finalizedOrder = orderService.checkoutFromCart(checkoutDTO, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(modelMapper.map(finalizedOrder, OrderDTO.class));
    }

    private Order findOrderAndCheckOwner(Long orderId, User loggedUser) {
        Order order = orderService.findById(orderId);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado.");
        }
        if (!order.getUser().getId().equals(loggedUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }
        return order;
    }
}