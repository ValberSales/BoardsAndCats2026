package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.model.User;
import br.edu.utfpr.pb.pw44s.server.repository.UserRepository;
import br.edu.utfpr.pb.pw44s.server.service.LogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminUserController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminUserControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private LogService logService;

    private User normalUser;

    @BeforeEach
    void setUp() {
        normalUser = new User();
        normalUser.setId(1L);
        normalUser.setUsername("user@email.com");
        normalUser.setDisplayName("Normal User");
        normalUser.setActive(true);
        normalUser.setRole("USER");
        normalUser.setCpf("111.111.111-11");
        normalUser.setPhone("46999998888");
    }

    @Test
    @DisplayName("Listar Usuários - Deve retornar lista com todos os usuários")
    void getAllUsers_ShouldReturnList() throws Exception {
        when(userRepository.findAll()).thenReturn(Collections.singletonList(normalUser));

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("user@email.com"))
                .andExpect(jsonPath("$[0].role").value("USER"));
    }

    @Test
    @DisplayName("Alternar Ativo - Deve alterar o status ativo e retornar DTO atualizado")
    void toggleUserActive_ShouldToggleAndReturnUpdated() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(normalUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/admin/users/1/toggle-active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        verify(logService, times(1)).log(eq("TOGGLE_USER_ACTIVE"), anyString());
    }

    @Test
    @DisplayName("Atualizar Função - Deve atualizar a role e retornar DTO atualizado")
    void updateUserRole_ShouldUpdateRoleAndReturnUpdated() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(normalUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/admin/users/1/role").param("role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        verify(logService, times(1)).log(eq("UPDATE_USER_ROLE"), anyString());
    }
}
