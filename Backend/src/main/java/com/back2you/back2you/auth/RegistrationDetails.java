package com.back2you.back2you.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@Builder
@Data
@NoArgsConstructor
public class RegistrationDetails {

    private String firstname;

    private String lastname;

    private String password;

    private String email;

    private String universityName;

    private LocalDate birthDate;
}
