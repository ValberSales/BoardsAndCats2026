package br.edu.utfpr.pb.pw44s.server.service;

import br.edu.utfpr.pb.pw44s.server.model.Order;
import br.edu.utfpr.pb.pw44s.server.model.OrderItems;
import br.edu.utfpr.pb.pw44s.server.model.OrderStatus;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
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

    private String translateStatus(OrderStatus status) {
        if (status == null) return "Desconhecido";
        switch (status) {
            case PENDING: return "Pendente de Pagamento";
            case PAID: return "Pago / Confirmado";
            case SHIPPED: return "Enviado / Em Transporte";
            case DELIVERED: return "Entregue";
            case CANCELED: return "Cancelado";
            default: return status.toString();
        }
    }

    private String formatCurrency(BigDecimal value) {
        if (value == null) return "R$ 0,00";
        return String.format("R$ %.2f", value).replace(".", ",");
    }

    private String buildCommonHtmlWrapper(String title, String innerContent) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='utf-8'>" +
                "<style>" +
                "  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f7; color: #333333; margin: 0; padding: 20px; }" +
                "  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }" +
                "  .header { background: #4f46e5; color: #ffffff; padding: 30px; text-align: center; }" +
                "  .header h1 { margin: 0; font-size: 24px; font-weight: 700; }" +
                "  .content { padding: 30px; }" +
                "  .order-info { background: #f8fafc; border-radius: 6px; padding: 15px; margin-bottom: 25px; border-left: 4px solid #4f46e5; }" +
                "  .order-info p { margin: 5px 0; font-size: 14px; }" +
                "  .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }" +
                "  .table th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }" +
                "  .table td { padding: 12px 10px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }" +
                "  .totals { width: 100%; margin-bottom: 25px; }" +
                "  .totals td { padding: 5px 0; font-size: 14px; }" +
                "  .totals .label { color: #64748b; }" +
                "  .totals .value { text-align: right; font-weight: 600; }" +
                "  .totals .grand-total { font-size: 18px; color: #4f46e5; border-top: 2px solid #e2e8f0; padding-top: 10px; }" +
                "  .address-card { background: #f8fafc; border-radius: 6px; padding: 15px; font-size: 14px; margin-bottom: 20px; border: 1px solid #e2e8f0; }" +
                "  .address-card h3 { margin: 0 0 10px 0; font-size: 15px; color: #1e293b; }" +
                "  .tracking-box { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; border-radius: 6px; padding: 15px; margin-bottom: 25px; text-align: center; font-weight: 600; font-size: 16px; }" +
                "  .footer { background: #f1f5f9; text-align: center; padding: 20px; font-size: 12px; color: #64748b; }" +
                "  .btn { display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #4f46e5; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>" + title + "</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                innerContent +
                "    </div>" +
                "    <div class='footer'>" +
                "      <p>Boards & Cats Ltda. - O seu e-commerce de Jogos de Tabuleiro</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    private String buildOrderSummaryHtml(Order order) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("<div class='order-info'>");
        sb.append("<p><strong>Número do Pedido:</strong> #").append(order.getId()).append("</p>");
        sb.append("<p><strong>Data:</strong> ").append(order.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("</p>");
        sb.append("<p><strong>Status Atual:</strong> ").append(translateStatus(order.getStatus())).append("</p>");
        sb.append("</div>");

        sb.append("<table class='table'>");
        sb.append("<thead><tr><th>Produto</th><th style='text-align: center;'>Qtd</th><th style='text-align: right;'>Preço</th><th style='text-align: right;'>Subtotal</th></tr></thead>");
        sb.append("<tbody>");
        for (OrderItems item : order.getItems()) {
            sb.append("<tr>");
            sb.append("<td>").append(item.getProduct().getName()).append("</td>");
            sb.append("<td style='text-align: center;'>").append(item.getQuantity()).append("</td>");
            sb.append("<td style='text-align: right;'>").append(formatCurrency(item.getUnitPrice())).append("</td>");
            sb.append("<td style='text-align: right;'>").append(formatCurrency(item.getSubtotal())).append("</td>");
            sb.append("</tr>");
        }
        sb.append("</tbody>");
        sb.append("</table>");

        sb.append("<table class='totals'>");
        sb.append("<tr><td class='label'>Subtotal dos itens:</td><td class='value'>").append(formatCurrency(order.getTotal().subtract(order.getShipping()).add(order.getDiscount()))).append("</td></tr>");
        sb.append("<tr><td class='label'>Frete:</td><td class='value'>").append(formatCurrency(order.getShipping())).append("</td></tr>");
        if (order.getDiscount() != null && order.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("<tr><td class='label'>Desconto:</td><td class='value' style='color: #10b981;'>- ").append(formatCurrency(order.getDiscount())).append("</td></tr>");
        }
        sb.append("<tr class='grand-total'><td class='label' style='font-weight: 700; color: #1e293b;'>Total Geral:</td><td class='value' style='font-size: 18px; color: #4f46e5;'>").append(formatCurrency(order.getTotal())).append("</td></tr>");
        sb.append("</table>");

        if (order.getShippingAddress() != null) {
            sb.append("<div class='address-card'>");
            sb.append("<h3>Endereço de Entrega</h3>");
            sb.append("<p>").append(order.getShippingAddress().getStreet()).append(", ").append(order.getShippingAddress().getNumber()).append("</p>");
            if (order.getShippingAddress().getNeighborhood() != null) {
                sb.append("<p>Bairro: ").append(order.getShippingAddress().getNeighborhood()).append("</p>");
            }
            sb.append("<p>").append(order.getShippingAddress().getCity()).append(" - ").append(order.getShippingAddress().getState()).append("</p>");
            sb.append("<p>CEP: ").append(order.getShippingAddress().getZip()).append("</p>");
            sb.append("</div>");
        }

        return sb.toString();
    }

    @Async
    public void sendOrderCreatedEmail(Order order) {
        String recipient = order.getClientDetails().getEmail();
        String subject = "Boards & Cats - Confirmamos seu Pedido #" + order.getId() + "!";
        
        String innerContent = "<p>Olá, <strong>" + order.getClientDetails().getName() + "</strong>!</p>" +
                "<p>Seu pedido foi registrado com sucesso em nosso sistema e já está em processo de processamento.</p>" +
                buildOrderSummaryHtml(order) +
                "<p>Você receberá um novo e-mail com atualizações assim que o pagamento for confirmado ou o pedido for despachado.</p>" +
                "<p>Se tiver alguma dúvida, sinta-se à vontade para responder a este e-mail.</p>";

        String htmlBody = buildCommonHtmlWrapper("Pedido Realizado com Sucesso!", innerContent);
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            LOGGER.info("E-mail de confirmação de pedido enviado para: " + recipient);
            logService.log("EMAIL_SENT_SUCCESS", String.format("Recipient: %s | Subject: %s (Order Created)", recipient, subject));
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Falha ao enviar e-mail de confirmação de pedido para " + recipient + ". Motivo: " + e.getMessage());
            logService.log("EMAIL_SENT_FAILURE", String.format("Recipient: %s | Subject: %s | Error: %s", recipient, subject, e.getMessage()));
        }
    }

    @Async
    public void sendOrderStatusUpdateEmail(Order order, OrderStatus oldStatus, OrderStatus newStatus, byte[] attachmentBytes, String attachmentName, String contentType) {
        String recipient = order.getClientDetails().getEmail();
        String subject = "Boards & Cats - Atualização do Pedido #" + order.getId();

        StringBuilder sb = new StringBuilder();
        sb.append("<p>Olá, <strong>").append(order.getClientDetails().getName()).append("</strong>!</p>");
        sb.append("<p>Temos novidades sobre o andamento do seu pedido.</p>");
        
        sb.append("<div class='order-info' style='border-left-color: #f59e0b;'>");
        sb.append("<p><strong>Status Anterior:</strong> <span style='text-decoration: line-through; color: #64748b;'>").append(translateStatus(oldStatus)).append("</span></p>");
        sb.append("<p><strong>Novo Status:</strong> <strong style='color: #4f46e5;'>").append(translateStatus(newStatus)).append("</strong></p>");
        sb.append("</div>");

        if (newStatus == OrderStatus.SHIPPED && order.getTrackingCode() != null && !order.getTrackingCode().trim().isEmpty()) {
            sb.append("<div class='tracking-box'>");
            sb.append("📦 Seu pedido foi enviado! Código de Rastreamento:<br/>");
            sb.append("<span style='font-size: 20px; letter-spacing: 1px; color: #b45309;'>").append(order.getTrackingCode()).append("</span>");
            sb.append("</div>");
        }

        if (attachmentBytes != null && attachmentName != null) {
            sb.append("<p style='background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 6px; padding: 12px; font-weight: 500;'>");
            sb.append("📎 A sua **Nota Fiscal** (" + attachmentName + ") foi anexada diretamente a este e-mail.");
            sb.append("</p>");
        }

        sb.append("<h2 style='font-size: 18px; margin-top: 30px; color: #1e293b;'>Resumo do Pedido</h2>");
        sb.append(buildOrderSummaryHtml(order));

        String htmlBody = buildCommonHtmlWrapper("Seu Pedido # " + order.getId() + " Atualizou!", sb.toString());

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            
            if (attachmentBytes != null && attachmentName != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(attachmentBytes), contentType != null ? contentType : "application/octet-stream");
            }
            
            mailSender.send(mimeMessage);
            LOGGER.info("E-mail de atualização de status de pedido enviado para: " + recipient);
            logService.log("EMAIL_SENT_SUCCESS", String.format("Recipient: %s | Subject: %s (Status: %s)", recipient, subject, newStatus));
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Falha ao enviar e-mail de atualização de status de pedido para " + recipient + ". Motivo: " + e.getMessage());
            logService.log("EMAIL_SENT_FAILURE", String.format("Recipient: %s | Subject: %s | Error: %s", recipient, subject, e.getMessage()));
        }
    }
}
