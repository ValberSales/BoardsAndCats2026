package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.dto.UserDTO;
import br.edu.utfpr.pb.pw44s.server.model.User;
import br.edu.utfpr.pb.pw44s.server.repository.UserRepository;
import br.edu.utfpr.pb.pw44s.server.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/users")
@Tag(name = "Admin - Usuários", description = "Endpoints administrativos para gerenciamento e auditoria de contas de usuários")
public class AdminUserController {

    private final UserRepository userRepository;
    private final LogService logService;

    public AdminUserController(UserRepository userRepository, LogService logService) {
        this.userRepository = userRepository;
        this.logService = logService;
    }

    @GetMapping
    @Operation(summary = "Listar todos os usuários cadastrados", description = "Retorna uma lista completa de todos os usuários cadastrados no sistema (clientes e administradores).")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> dtos = users.stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/toggle-active")
    @Operation(summary = "Ativar ou desativar usuário pelo ID", description = "Inverte o estado de ativação de uma conta de usuário (bloqueia ou desbloqueia o acesso).")
    public ResponseEntity<UserDTO> toggleUserActive(
            @Parameter(description = "ID do usuário", example = "1") @PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        user.setActive(!user.getActive());
        User savedUser = userRepository.save(user);

        logService.log("TOGGLE_USER_ACTIVE",
                String.format("User ID: %d | Username: %s | New Active Status: %b", id, user.getUsername(), user.getActive()));

        return ResponseEntity.ok(new UserDTO(savedUser));
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Alterar nível de acesso (ROLE) do usuário", description = "Altera a função/permissão do usuário (ex: USER para ADMIN ou vice-versa).")
    public ResponseEntity<UserDTO> updateUserRole(
            @Parameter(description = "ID do usuário", example = "1") @PathVariable Long id,
            @Parameter(description = "Nova ROLE (USER ou ADMIN)", example = "ADMIN") @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String oldRole = user.getRole();
        user.setRole(role.toUpperCase());
        User savedUser = userRepository.save(user);

        logService.log("UPDATE_USER_ROLE",
                String.format("User ID: %d | Username: %s | Old Role: %s | New Role: %s", id, user.getUsername(), oldRole, role));

        return ResponseEntity.ok(new UserDTO(savedUser));
    }
}
