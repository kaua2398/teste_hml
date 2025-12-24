package com.valeshop.timesheet.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class AuthController {

    @GetMapping("/auth/microsoft")
    public ResponseEntity<Void> redirectToMicrosoft() {
        System.out.println("[APIDemandas][LOGIN][MICROSOFT]");
        // Delegates to Spring Security OAuth2 client (registrationId = azure)
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/oauth2/authorization/azure"))
                .build();
    }
}

