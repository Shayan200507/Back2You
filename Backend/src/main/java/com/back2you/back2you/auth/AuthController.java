package com.back2you.back2you.auth;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final authService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationDetails info){
        try {
            AuthResponse token = authService.RegisterRequest(info);
            return ResponseEntity.ok(token);

        } catch (Exception e) {
            return  ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDetails info){
        try {
            AuthResponse token =  authService.LoginRequest(info);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        }

    }





}
