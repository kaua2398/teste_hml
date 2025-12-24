package com.valeshop.timesheet.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;


    @Value("${app.mail.from:documentos@valeshop.com.br}")
    private String fromEmail;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Async
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);
            System.out.println("✅ E-mail enviado com sucesso para: " + to);

        } catch (MailException | MessagingException e) {
            System.err.println("⚠️ Falha ao enviar e-mail para " + to + ": " + e.getMessage());
        }
    }

    public void sendVerificationEmail(String to, String token) {
        String subject = "Validação de E-mail - Controle de Demandas ValeShop";
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String resendUrl = frontendUrl + "/resend-verification";

        String htmlBody = """
                <h1>Bem-vindo ao Controle de Demandas ValeShop!</h1>
                <p>Por favor, clique no botão abaixo para validar o seu e-mail:</p>
                <a href="%s" style="background-color:#007bff;color:#ffffff;padding:10px 15px;text-decoration:none;border-radius:5px;">Validar Meu E-mail</a>
                <br><br>
                <p>O seu token expirou? Clique <a href="%s">aqui</a> para solicitar um novo.</p>
                """.formatted(verificationUrl, resendUrl);

        sendHtmlEmail(to, subject, htmlBody);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Redefinição de Senha - Controle de Demandas ValeShop";
        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        String htmlBody = """
                <h1>Redefinição de Senha</h1>
                <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>
                <a href="%s" style="background-color:#28a745;color:#ffffff;padding:10px 15px;text-decoration:none;border-radius:5px;">Redefinir Senha</a>
                <br><br>
                <p>Se você não solicitou esta alteração, pode ignorar este e-mail.</p>
                """.formatted(resetUrl);

        sendHtmlEmail(to, subject, htmlBody);
    }
}
