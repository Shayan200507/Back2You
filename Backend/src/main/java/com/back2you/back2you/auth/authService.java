package com.back2you.back2you.auth;


import com.back2you.back2you.JWT.JwtService;
import com.back2you.back2you.User.Role;
import com.back2you.back2you.User.User;
import com.back2you.back2you.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service

public class authService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;


    public AuthResponse LoginRequest(LoginDetails loginDetails){

        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(loginDetails.getEmail(),loginDetails.getPassword());

        try {
            authenticationManager.authenticate(usernamePasswordAuthenticationToken);
            Optional<User> user = userRepository.findByEmail(loginDetails.getEmail());
            if (user.isEmpty()) throw new BadCredentialsException("Invalid email or password");

            return  AuthResponse.builder().token(jwtService.createToken((UserDetails) user.get())).build();




        } catch (AuthenticationException e) {
            throw new RuntimeException(e);
        }


    }


    public AuthResponse RegisterRequest(RegistrationDetails registrationDetails){


        if(userRepository.exists(registrationDetails.getEmail())){
            throw new RuntimeException("Account already exists");
        }
        else {
            User account =  User.builder().email(registrationDetails.getEmail()).firstname(registrationDetails.getFirstname())
                    .lastname(registrationDetails.getLastname()).password(passwordEncoder.encode(registrationDetails.getPassword())).role(Role.USER).build();

            userRepository.save(account);

            return  AuthResponse.builder().token(jwtService.createToken(account)).build();
        }


    }
}
