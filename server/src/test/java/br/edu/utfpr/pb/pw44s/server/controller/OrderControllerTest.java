package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.dto.CheckoutDTO;
import br.edu.utfpr.pb.pw44s.server.dto.OrderDTO;
import br.edu.utfpr.pb.pw44s.server.model.Order;
import br.edu.utfpr.pb.pw44s.server.model.User;
import br.edu.utfpr.pb.pw44s.server.service.IOrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IOrderService orderService;

    @MockitoBean
    private br.edu.utfpr.pb.pw44s.server.repository.OrderDocumentRepository orderDocumentRepository;

    @MockitoBean
    private br.edu.utfpr.pb.pw44s.server.service.MinioService minioService;

    @MockitoBean
    private br.edu.utfpr.pb.pw44s.server.service.ICartService cartService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public ModelMapper modelMapper() {
            return new ModelMapper();
        }
    }

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("user_teste");
        user.setDisplayName("User Teste");

        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        SecurityContext securityContext = org.mockito.Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Checkout - Deve retornar 201 Created quando dados são válidos")
    void checkout_ShouldReturnCreated() throws Exception {
        CheckoutDTO checkoutDTO = new CheckoutDTO();
        checkoutDTO.setAddressId(10L);
        checkoutDTO.setPaymentMethodId(20L);

        Order order = new Order();
        order.setId(100L);
        order.setUser(user);
        order.setTotal(new BigDecimal("200.00"));

        when(orderService.checkoutFromCart(any(CheckoutDTO.class), any(User.class)))
                .thenReturn(order);

        mockMvc.perform(post("/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.total").value(200.00));
    }

    @Test
    @DisplayName("Meus Pedidos - Deve retornar lista de pedidos do usuário")
    void findMyOrders_ShouldReturnList() throws Exception {
        Order order = new Order();
        order.setId(100L);
        order.setUser(user);

        when(orderService.findFinalizedByUserId(user.getId())).thenReturn(List.of(order));

        mockMvc.perform(get("/orders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @DisplayName("Buscar Pedido - Deve retornar pedido se pertencer ao usuário logado")
    void findOne_ShouldReturnOrder_WhenOwner() throws Exception {
        Order order = new Order();
        order.setId(100L);
        order.setUser(user);

        when(orderService.findById(100L)).thenReturn(order);

        mockMvc.perform(get("/orders/{id}", 100L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    @DisplayName("Buscar Pedido - Deve retornar 403 Forbidden se pertencer a outro usuário")
    void findOne_ShouldReturnForbidden_WhenNotOwner() throws Exception {
        User otherUser = new User();
        otherUser.setId(99L);

        Order order = new Order();
        order.setId(100L);
        order.setUser(otherUser);

        when(orderService.findById(100L)).thenReturn(order);

        mockMvc.perform(get("/orders/{id}", 100L))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Buscar Pedido - Deve retornar 404 se não existir")
    void findOne_ShouldReturnNotFound() throws Exception {
        when(orderService.findById(999L)).thenReturn(null);

        mockMvc.perform(get("/orders/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Cancelar Pedido - Deve retornar 200 OK")
    void cancel_ShouldReturnOrder() throws Exception {
        Order order = new Order();
        order.setId(100L);
        order.setUser(user);

        when(orderService.findById(100L)).thenReturn(order);
        when(orderService.cancel(100L)).thenReturn(order);

        mockMvc.perform(post("/orders/{id}/cancel", 100L))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Get Cart - Deve retornar carrinho do usuario")
    void getCart_ShouldReturnCart() throws Exception {
        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = new br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO();
        cartDTO.setId(5L);
        when(cartService.getAndValidateCart(any(User.class))).thenReturn(cartDTO);

        mockMvc.perform(get("/orders/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L));
    }

    @Test
    @DisplayName("Get Cart - Deve retornar 204 se vazio")
    void getCart_ShouldReturnNoContent() throws Exception {
        when(cartService.getAndValidateCart(any(User.class))).thenReturn(null);

        mockMvc.perform(get("/orders/cart"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Add Item - Deve adicionar item e retornar carrinho")
    void addItem_ShouldReturnCart() throws Exception {
        br.edu.utfpr.pb.pw44s.server.dto.CartItemDTO itemDTO = new br.edu.utfpr.pb.pw44s.server.dto.CartItemDTO();
        itemDTO.setProductId(2L);
        itemDTO.setQuantity(1);

        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = new br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO();
        cartDTO.setId(5L);

        when(cartService.addItemToCart(any(User.class), eq(2L), eq(1))).thenReturn(cartDTO);

        mockMvc.perform(post("/orders/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L));
    }

    @Test
    @DisplayName("Update Item Qty - Deve atualizar quantidade e retornar carrinho")
    void updateItemQty_ShouldReturnCart() throws Exception {
        br.edu.utfpr.pb.pw44s.server.dto.CartItemDTO itemDTO = new br.edu.utfpr.pb.pw44s.server.dto.CartItemDTO();
        itemDTO.setProductId(1L);
        itemDTO.setQuantity(3);

        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = new br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO();
        cartDTO.setId(5L);

        when(cartService.updateItemQuantity(any(User.class), eq(1L), eq(3))).thenReturn(cartDTO);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/orders/cart/items/{productId}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L));
    }

    @Test
    @DisplayName("Remove Item - Deve remover item e retornar carrinho")
    void removeItem_ShouldReturnCart() throws Exception {
        br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO cartDTO = new br.edu.utfpr.pb.pw44s.server.dto.CartResponseDTO();
        cartDTO.setId(5L);

        when(cartService.removeItem(any(User.class), eq(5L))).thenReturn(cartDTO);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/orders/cart/items/{productId}", 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L));
    }

    @Test
    @DisplayName("Clear Cart - Deve limpar carrinho e retornar 204")
    void clearCart_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/orders/cart"))
                .andExpect(status().isNoContent());

        verify(cartService).clearCart(any(User.class));
    }

    @Test
    @DisplayName("Cart Checkout - Deve realizar checkout e retornar 201")
    void cartCheckout_ShouldReturnCreated() throws Exception {
        CheckoutDTO checkoutDTO = new CheckoutDTO();
        checkoutDTO.setAddressId(1L);
        checkoutDTO.setPaymentMethodId(1L);

        Order order = new Order();
        order.setId(100L);
        order.setUser(user);
        order.setTotal(new BigDecimal("150.00"));

        when(orderService.checkoutFromCart(any(CheckoutDTO.class), any(User.class)))
                .thenReturn(order);

        mockMvc.perform(post("/orders/cart/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L));
    }
}