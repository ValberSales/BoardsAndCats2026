package br.edu.utfpr.pb.pw44s.server.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger LOGGER = Logger.getLogger(EmailService.class.getName());
    private final JavaMailSender mailSender;
    private final LogService logService;

    public EmailService(JavaMailSender mailSender, LogService logService) {
        this.mailSender = mailSender;
        this.logService = logService;
    }

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            LOGGER.info("E-mail enviado com sucesso para: " + to);
            logService.log("EMAIL_SENT_SUCCESS", String.format("Recipient: %s | Subject: %s", to, subject));
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Falha ao enviar e-mail para " + to + ". Motivo: " + e.getMessage());
            logService.log("EMAIL_SENT_FAILURE", String.format("Recipient: %s | Subject: %s | Error: %s", to, subject, e.getMessage()));
        }
    }
}
