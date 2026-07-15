package org.ssssy.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

  private final SecretKey secretKey;
  private final long expirationMs;
  private final long refreshExpirationMs;

  public JwtTokenProvider(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expirationMs,
      @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
    this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    this.expirationMs = expirationMs;
    this.refreshExpirationMs = refreshExpirationMs;
  }

  public String generateAccessToken(UUID userId, String username, String roleName) {
    Date now = new Date();
    return Jwts.builder()
        .subject(userId.toString())
        .claim("username", username)
        .claim("role", roleName)
        .issuedAt(now)
        .expiration(new Date(now.getTime() + expirationMs))
        .signWith(secretKey)
        .compact();
  }

  public String generateRefreshToken(UUID userId) {
    Date now = new Date();
    return Jwts.builder()
        .subject(userId.toString())
        .claim("type", "refresh")
        .issuedAt(now)
        .expiration(new Date(now.getTime() + refreshExpirationMs))
        .signWith(secretKey)
        .compact();
  }

  public UUID getUserIdFromToken(String token) {
    Claims claims = Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
    return UUID.fromString(claims.getSubject());
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }
}
