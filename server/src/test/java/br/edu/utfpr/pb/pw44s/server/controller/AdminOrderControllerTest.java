package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.model.Order;
import br.edu.utfpr.pb.pw44s.server.model.OrderDocument;
import br.edu.utfpr.pb.pw44s.server.model.OrderStatus;
import br.edu.utfpr.pb.pw44s.server.model.OrderUserEmbeddable;
import br.edu.utfpr.pb.pw44s.server.repository.OrderDocumentRepository;
import br.edu.utfpr.pb.pw44s.server.repository.OrderRepository;
import br.edu.utfpr.pb.pw44s.server.repository.ProductRepository;
import br.edu.utfpr.pb.pw44s.server.service.EmailService;
import br.edu.utfpr.pb.pw44s.server.service.LogService;
import br.edu.utfpr.pb.pw44s.server.service.MinioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminOrderController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminOrderControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private OrderRepository orderRepository;
    @MockitoBean private OrderDocumentRepository orderDocumentRepository;
    @MockitoBean private ProductRepository productRepository;
    @MockitoBean private MinioService minioService;
    @MockitoBean private EmailService emailService;
    @MockitoBean private LogService logService;

    @TestConfiguration
    static class TestConfig {
        @Bean public ModelMapper modelMapper() { return new ModelMapper(); }
    }

    private Order order;

    @BeforeEach
    void setUp() {
        order = new Order();
        order.setId(1L);
        order.setDate(LocalDate.now());
        order.setStatus(OrderStatus.PENDING);
        order.setTotal(new BigDecimal("100.00"));
        order.setShipping(new BigDecimal("10.00"));
        order.setDiscount(BigDecimal.ZERO);

        OrderUserEmbeddable client = new OrderUserEmbeddable();
        client.setName("John Doe");
        client.setEmail("john@email.com");
        client.setCpf("111.222.333-44");
        client.setPhone("46999998888");
        order.setClientDetails(client);
    }

    @Test
    @DisplayName("Listar Pedidos - Deve retornar todos os pedidos")
    void getAllOrders_ShouldReturnList() throws Exception {
        when(orderRepository.findAll()).thenReturn(Collections.singletonList(order));

        mockMvc.perform(get("/admin/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @DisplayName("Atualizar Status do Pedido - Deve alterar status e enviar e-mail")
    void updateOrderStatus_ShouldUpdateAndSendEmail() throws Exception {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/admin/orders/1/status")
                        .param("status", "PAID")
                        .param("trackingCode", "TRK123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.trackingCode").value("TRK123"));

        verify(logService, times(1)).log(eq("UPDATE_ORDER_STATUS"), anyString());
        verify(emailService, times(1)).sendEmail(eq("john@email.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Upload de Documento - Deve fazer upload e salvar metadata")
    void uploadDocument_ShouldUploadAndSaveMetadata() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "invoice.pdf", "application/pdf", "dummy data".getBytes());

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(minioService.uploadFile(any())).thenReturn("unique-minio-key");

        OrderDocument doc = OrderDocument.builder()
                .id(10L)
                .order(order)
                .fileName("invoice.pdf")
                .minioPath("unique-minio-key")
                .contentType("application/pdf")
                .build();
        when(orderDocumentRepository.save(any(OrderDocument.class))).thenReturn(doc);

        mockMvc.perform(multipart("/admin/orders/1/documents")
                        .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.fileName").value("invoice.pdf"));

        verify(minioService, times(1)).uploadFile(any());
        verify(logService, times(1)).log(eq("UPLOAD_ORDER_DOCUMENT"), anyString());
    }

    @Test
    @DisplayName("Download de Documento - Deve retornar stream com dados do arquivo")
    void downloadDocument_ShouldReturnStream() throws Exception {
        OrderDocument doc = OrderDocument.builder()
                .id(10L)
                .fileName("invoice.pdf")
                .minioPath("unique-minio-key")
                .contentType("application/pdf")
                .build();

        when(orderDocumentRepository.findById(10L)).thenReturn(Optional.of(doc));
        when(minioService.downloadFile("unique-minio-key")).thenReturn(new ByteArrayInputStream("dummy data".getBytes()));

        mockMvc.perform(get("/admin/orders/documents/10/download"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"invoice.pdf\""));
    }

    @Test
    @DisplayName("Estatísticas do Dashboard - Deve calcular total de vendas e estoques")
    void getDashboardStats_ShouldCalculateMetrics() throws Exception {
        when(orderRepository.findAll()).thenReturn(Collections.singletonList(order));
        when(productRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/admin/orders/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(100.00))
                .andExpect(jsonPath("$.totalOrders").value(1))
                .andExpect(jsonPath("$.pendingOrders").value(1));
    }
}
