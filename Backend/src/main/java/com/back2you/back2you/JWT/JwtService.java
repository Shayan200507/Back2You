package com.back2you.back2you.JWT;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final long JWT_EXPIRATION_MS = 1000 * 60 * 60 * 24;

    private final Dotenv dotenv = Dotenv.configure()
            .ignoreIfMissing()
            .load();

    private final String secret = System.getenv("JWT_SECRET") != null
            ? System.getenv("JWT_SECRET")
            : dotenv.get("JWT_SECRET");



    public Key getSecretKeyObject(){

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is not configured");
        }

        byte[] key = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(key);

    }


    public Claims extractAllClaims(String token){
        return Jwts.parser().verifyWith((SecretKey) getSecretKeyObject()).build().parseSignedClaims(token).getPayload();

    }

    public <T> T getClaim(String Token, Function<Claims,T>getClaim){
        Claims claims = extractAllClaims(Token);
        return getClaim.apply(claims);


    }

    public String getEmail(String Token){
        return getClaim(Token,Claims->Claims.getSubject());
    }

    public String createToken(UserDetails user, Map<String,Object> extraclaims){
        return Jwts.builder().claims(extraclaims).subject(user.getUsername()).issuedAt(new Date(System.currentTimeMillis())).expiration(new Date(System.currentTimeMillis()+ JWT_EXPIRATION_MS)).signWith(getSecretKeyObject()).compact();
    }

    public String createToken(UserDetails user){
        return Jwts.builder().subject(user.getUsername()).issuedAt(new Date(System.currentTimeMillis())).expiration(new Date(System.currentTimeMillis()+ JWT_EXPIRATION_MS)).signWith(getSecretKeyObject()).compact();
    }

    public boolean verifyToken(String Token, UserDetails user){

        String username = getClaim(Token, Claims::getSubject);
        return  username.equals(user.getUsername()) && user.isEnabled() && TokenNotExpired(Token);

    }

    public boolean TokenNotExpired( String Token) {

        return getClaim(Token,Claims::getExpiration).after(new Date());
    }














}
