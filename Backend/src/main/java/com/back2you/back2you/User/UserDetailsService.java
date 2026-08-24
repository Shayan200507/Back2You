package com.back2you.back2you.User;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

@RequiredArgsConstructor

public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository ;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> details = userRepository.findByEmail(username);

        if (details.isEmpty()){
            throw  new UsernameNotFoundException("User with this email does not exist");
        }

        return  details.get();

    }
}
