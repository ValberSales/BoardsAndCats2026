package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.model.OperationLog;
import br.edu.utfpr.pb.pw44s.server.repository.OperationLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Logs", description = "Endpoints para visualização de logs de auditoria do sistema")
public class AdminLogController {

    private final OperationLogRepository operationLogRepository;

    public AdminLogController(OperationLogRepository operationLogRepository) {
        this.operationLogRepository = operationLogRepository;
    }

    @GetMapping
    @Operation(summary = "Obter os logs de auditoria do sistema", description = "Retorna todos os logs de operações (atualizações de pedidos, envio de e-mails, etc.) salvos no banco de dados. Apenas para administradores.")
    public List<OperationLog> getLogs() {
        return operationLogRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }
}
