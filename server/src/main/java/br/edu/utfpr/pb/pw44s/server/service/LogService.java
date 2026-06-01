package br.edu.utfpr.pb.pw44s.server.service;

import br.edu.utfpr.pb.pw44s.server.model.OperationLog;
import br.edu.utfpr.pb.pw44s.server.repository.OperationLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.logging.Logger;

@Service
public class LogService {

    private static final Logger LOGGER = Logger.getLogger(LogService.class.getName());
    private final OperationLogRepository operationLogRepository;

    public LogService(OperationLogRepository operationLogRepository) {
        this.operationLogRepository = operationLogRepository;
    }

    public void log(String operation, String details) {
        String adminEmail = "SYSTEM";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            adminEmail = auth.getName();
        }

        // Print to console
        LOGGER.info(String.format("[ADMIN OPERATION] Admin: %s | Operation: %s | Details: %s", adminEmail, operation, details));

        // Save to DB
        try {
            OperationLog log = OperationLog.builder()
                    .adminEmail(adminEmail)
                    .operation(operation)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();
            operationLogRepository.save(log);
        } catch (Exception e) {
            LOGGER.severe("Falha ao salvar log de operacao no banco: " + e.getMessage());
        }
    }
}
