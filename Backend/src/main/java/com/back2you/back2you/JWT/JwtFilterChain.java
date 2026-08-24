package com.back2you.back2you.JWT;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtFilterChain extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        final String Header = request.getHeader("Authorization");
        final String jwt;


        if (Header == null || !Header.startsWith("Bearer ")){

            filterChain.doFilter(request,response);
            return;


        }
        else {

            jwt = Header.substring(7);


        }






    }
}
