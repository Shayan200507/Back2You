package com.back2you.back2you.JWT;

import com.back2you.back2you.User.UserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@RequiredArgsConstructor
@Component
public class JwtFilterChain extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        final String Header = request.getHeader("Authorization");
        final String jwt;
        final String email;
        final UserDetails user;


        if (Header == null || !Header.startsWith("Bearer ")){

            filterChain.doFilter(request,response);
            return;


        }
        else {

            jwt = Header.substring(7);
            email = jwtService.getEmail(jwt);
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                if (jwtService.verifyToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(token);

                }


            } catch (UsernameNotFoundException e) {
                System.out.println(e);
                throw e;

            }


        }
    }
}
