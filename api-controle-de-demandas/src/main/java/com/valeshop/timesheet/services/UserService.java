package com.valeshop.timesheet.services;

import com.valeshop.timesheet.entities.user.*;
import com.valeshop.timesheet.exceptions.UserAlreadyExistsException;
import com.valeshop.timesheet.exceptions.UserNotFoundException;
import com.valeshop.timesheet.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    /**
     * Registra um novo usuário com validação de duplicidade,
     * rollback automático em caso de erro e envio de e-mail seguro.
     */
    @Transactional
    public User registerUser(UserRegisterDTO dataUser) {
        // 1️⃣ Verifica se o e-mail já existe antes de salvar
        if (userRepository.findByEmail(dataUser.email()).isPresent()) {
            throw new UserAlreadyExistsException("O email fornecido já está em uso.");
        }

        // 2️⃣ Cria o objeto de usuário com senha criptografada
        String encryptedPassword = passwordEncoder.encode(dataUser.password());
        User newUser;

        String userType = dataUser.userType();
        if ("Administrador".equalsIgnoreCase(userType)) {
            newUser = new User(null, dataUser.email(), encryptedPassword, UserType.Administrador);
        } else {
            newUser = new User(null, dataUser.email(), encryptedPassword, UserType.Normal);
        }

        // 3️⃣ Gera token de verificação e salva o usuário
        String token = UUID.randomUUID().toString();
        newUser.setVerificationToken(token);
        userRepository.save(newUser);

        // 4️⃣ Envia o e-mail de verificação fora da transação principal
        try {
            emailService.sendVerificationEmail(newUser.getEmail(), token);
        } catch (Exception e) {
            System.err.println("⚠️ Falha ao enviar e-mail de verificação: " + e.getMessage());
            // Opcional: logar ou armazenar o erro, mas não lançar exceção para evitar rollback desnecessário
        }

        // 5️⃣ Retorna o usuário criado
        return newUser;
    }

    public boolean verifyUser(String token) {
        User user = userRepository.findByVerificationToken(token).orElse(null);

        if (user == null || user.isEnabled()) {
            return false;
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return true;
    }

    public void requestPasswordReset(UserForgotPasswordDTO dataUser) {
        User user = userRepository.findByEmail(dataUser.email())
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com o e-mail: " + dataUser.email()));

        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(20));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getPasswordResetToken());
    }

    public boolean resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token).orElse(null);

        if (user == null || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return true;
    }

    public UserResponseDTO getAuthenticatedUserProfile() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado no contexto de segurança."));
        return new UserResponseDTO(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com o e-mail: " + email));

        if (user.isEnabled()) {
            throw new IllegalStateException("O usuário já foi verificado.");
        }

        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(LocalDateTime.now().plusMinutes(20));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());
    }
}
