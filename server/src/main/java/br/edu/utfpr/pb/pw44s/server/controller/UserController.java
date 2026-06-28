package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.dto.UserCreateDTO;
import br.edu.utfpr.pb.pw44s.server.dto.UserDTO;
import br.edu.utfpr.pb.pw44s.server.dto.UserPasswordDTO;
import br.edu.utfpr.pb.pw44s.server.dto.UserProfileDTO;
import br.edu.utfpr.pb.pw44s.server.dto.UserConfirmationDTO;
import br.edu.utfpr.pb.pw44s.server.model.User;
import br.edu.utfpr.pb.pw44s.server.security.SecurityConstants;
import br.edu.utfpr.pb.pw44s.server.security.TokenService;
import br.edu.utfpr.pb.pw44s.server.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("users")
@Tag(name = "Usuários", description = "Endpoints para cadastro, perfil e segurança da conta do usuário")
public class UserController {

    private final IUserService userService;
    private final ModelMapper modelMapper;
    private final TokenService tokenService;

    public UserController(IUserService userService,
                          ModelMapper modelMapper,
                          TokenService tokenService) {
        this.userService = userService;
        this.modelMapper = modelMapper;
        this.tokenService = tokenService;
    }

    @PostMapping("register")
    @Operation(summary = "Registrar um novo usuário", description = "Cria uma nova conta de cliente com as informações fornecidas no corpo da requisição.")
    public ResponseEntity<UserDTO> register(@RequestBody @Valid UserCreateDTO userCreateDTO) {
        User userToSave = modelMapper.map(userCreateDTO, User.class);
        User savedUser = userService.save(userToSave);
        return ResponseEntity.status(HttpStatus.CREATED).body(modelMapper.map(savedUser, UserDTO.class));
    }

    @GetMapping("me")
    @Operation(summary = "Obter perfil do usuário autenticado", description = "Retorna os dados do perfil do usuário atualmente autenticado na sessão (via token JWT).")
    public ResponseEntity<UserDTO> getMyProfile(@Parameter(hidden = true) @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(modelMapper.map(user, UserDTO.class));
    }

    @PutMapping("me")
    @Operation(summary = "Atualizar informações do perfil", description = "Atualiza os dados cadastrais (nome, telefone, e-mail) do usuário autenticado e retorna um novo token JWT atualizado.")
    public ResponseEntity<UserDTO> updateMyProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal User user,
            @RequestBody @Valid UserProfileDTO userProfileDTO) {
        user.setDisplayName(userProfileDTO.getDisplayName());
        user.setPhone(userProfileDTO.getPhone());
        user.setUsername(userProfileDTO.getUsername());

        User updatedUser = userService.save(user);
        String newToken = tokenService.generateToken(updatedUser);

        HttpHeaders headers = new HttpHeaders();
        headers.add(SecurityConstants.HEADER_STRING, SecurityConstants.TOKEN_PREFIX + newToken);

        return ResponseEntity.ok()
                .headers(headers)
                .body(modelMapper.map(updatedUser, UserDTO.class));
    }

    @PatchMapping("me/password")
    @Operation(summary = "Alterar senha do usuário", description = "Altera a senha do usuário autenticado após validar a senha atual fornecida.")
    public ResponseEntity<Void> changePassword(
            @Parameter(hidden = true) @AuthenticationPrincipal User user,
            @RequestBody @Valid UserPasswordDTO passwordDTO) {
        userService.changePassword(user, passwordDTO.getCurrentPassword(), passwordDTO.getNewPassword());
        String newToken = tokenService.generateToken(user);

        HttpHeaders headers = new HttpHeaders();
        headers.add(SecurityConstants.HEADER_STRING, SecurityConstants.TOKEN_PREFIX + newToken);

        return ResponseEntity.noContent()
                .headers(headers)
                .build();
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir conta do usuário", description = "Remove permanentemente a conta do usuário autenticado do sistema após confirmação da senha.")
    public void deleteMe(@RequestBody @Valid UserConfirmationDTO confirmationDTO) {
        userService.deleteMe(confirmationDTO.getPassword());
    }
}