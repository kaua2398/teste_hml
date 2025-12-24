package com.valeshop.timesheet.controllers;

import com.valeshop.timesheet.entities.user.*;
import com.valeshop.timesheet.exceptions.InvalidPasswordException;
import com.valeshop.timesheet.exceptions.UserNotFoundException;
import com.valeshop.timesheet.infra.RestResponseMessage;
import com.valeshop.timesheet.infra.security.TokenService;
import com.valeshop.timesheet.schemas.PasswordResetRequestSchema;
import com.valeshop.timesheet.schemas.PasswordResetSchema;
import com.valeshop.timesheet.schemas.ResendVerificationSchema;
import com.valeshop.timesheet.schemas.UserSchema;
import com.valeshop.timesheet.services.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping(value = "/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserSchema userSchema) {
        UserRegisterDTO userRegisterDTO = new UserRegisterDTO(userSchema.getEmail(), userSchema.getPassword(), userSchema.getUserType());
        User user = userService.registerUser(userRegisterDTO);
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.CREATED, "Conta criada com sucesso, por favor verifique seu email!", 201);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<RestResponseMessage> verifyEmail(@RequestParam("token") String token) {
        boolean isVerified = userService.verifyUser(token);
        if (isVerified) {
            RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.OK, "E-mail verificado com sucesso! Já pode fazer login.", 200);
            return ResponseEntity.ok().body(responseMessage);
        } else {
            RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.BAD_REQUEST, "Token de verificação inválido ou expirado.", 400);
            return ResponseEntity.badRequest().body(responseMessage);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<RestResponseMessage> resendVerificationEmail(@Valid @RequestBody ResendVerificationSchema schema) {
        userService.resendVerificationEmail(schema.getEmail());
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.OK, "Um novo link de verificação foi enviado com sucesso!", 200);
        return ResponseEntity.ok().body(responseMessage);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AutenticationDTO data) {
        try {
            System.out.println("[APIDemandas][LOGIN]: Entrou no Logar ");
            UsernamePasswordAuthenticationToken usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
            Authentication auth = this.authenticationManager.authenticate(usernamePassword);
            User user = (User) auth.getPrincipal();
            String token = tokenService.generateToken(user);
            UserResponseDTO userResponse = new UserResponseDTO(user);
            System.out.println("[APIDemandas][LOGIN]: Logou - "+ user.getUsername());
            return ResponseEntity.ok(new UserLoginDTO(token, userResponse));
        } catch (BadCredentialsException e) {
            throw new InvalidPasswordException();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<RestResponseMessage> forgotPassword(@Valid @RequestBody PasswordResetRequestSchema schema) {
        UserForgotPasswordDTO userForgotPasswordDTO = new UserForgotPasswordDTO(schema.getEmail());
        userService.requestPasswordReset(userForgotPasswordDTO);
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.OK, "Um link para redefinição de senha foi enviado.", 200);
        return ResponseEntity.ok().body(responseMessage);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<RestResponseMessage> resetPassword(@Valid @RequestBody PasswordResetSchema schema) {
        boolean isReset = userService.resetPassword(schema.getToken(), schema.getNewPassword());
        if (isReset) {
            RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.OK, "Senha redefinida com sucesso.", 200);
            return ResponseEntity.ok().body(responseMessage);
        } else {
            RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.BAD_REQUEST, "Token de redefinição inválido ou expirado.", 400);
            return ResponseEntity.badRequest().body(responseMessage);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDTO> getAuthenticatedUserProfile() {
        UserResponseDTO userResponse = userService.getAuthenticatedUserProfile();
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok().body(users);
    }
}
