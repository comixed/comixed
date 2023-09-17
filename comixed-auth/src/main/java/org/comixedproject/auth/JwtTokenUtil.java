/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedRole;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * <code>JwtTokenUtil</code> provides utility functions used by the authentication codebase.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class JwtTokenUtil {
  private static final String ROLE_PREFIX = "ROLE_";
  private static final String SIGNING_KEY = "comixedproject";

  @Autowired private ComiXedUserRepository userRepository;

  public String getEmailFromToken(String token) {
    return getClaimFromToken(token, Claims::getSubject);
  }

  public Date getExpirationDateFromToken(String token) {
    return getClaimFromToken(token, Claims::getExpiration);
  }

  public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
    final var claims = getAllClaimsFromToken(token);
    return claimsResolver.apply(claims);
  }

  private Claims getAllClaimsFromToken(String token) {
    return Jwts.parser().setSigningKey(SIGNING_KEY).parseClaimsJws(token).getBody();
  }

  private Boolean isTokenExpired(String token) {
    final var expiration = getExpirationDateFromToken(token);
    return expiration.before(new Date());
  }

  public String generateToken(ComiXedUser user) {
    return doGenerateToken(user.getEmail());
  }

  String doGenerateToken(String email) {

    var claims = Jwts.claims().setSubject(email);
    List<GrantedAuthority> authorities = new ArrayList<>();

    ComiXedUser user = this.userRepository.findByEmail(email);
    if (user != null) {
      for (ComiXedRole role : user.getRoles()) {
        authorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + role.getName()));
      }
    }

    claims.put("scopes", authorities);

    return Jwts.builder()
        .setClaims(claims)
        .setIssuer("http://www.comixedproject.org")
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + (5 * 60 * 60) * 1000))
        .signWith(SignatureAlgorithm.HS256, SIGNING_KEY)
        .compact();
  }

  public Boolean validateToken(String token, UserDetails userDetails) {
    final String email = getEmailFromToken(token);
    return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
  }
}
