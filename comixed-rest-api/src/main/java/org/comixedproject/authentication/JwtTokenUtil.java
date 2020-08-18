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

package org.comixedproject.authentication;

import static org.comixedproject.authentication.AuthenticationConstants.ROLE_PREFIX;
import static org.comixedproject.authentication.AuthenticationConstants.SIGNING_KEY;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Role;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
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
  @Autowired private UserService userService;

  public String getEmailFromToken(String token) {
    return getClaimFromToken(token, Claims::getSubject);
  }

  public Date getExpirationDateFromToken(String token) {
    return getClaimFromToken(token, Claims::getExpiration);
  }

  public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = getAllClaimsFromToken(token);
    return claimsResolver.apply(claims);
  }

  private Claims getAllClaimsFromToken(String token) {
    return Jwts.parser().setSigningKey(SIGNING_KEY).parseClaimsJws(token).getBody();
  }

  private Boolean isTokenExpired(String token) {
    final Date expiration = getExpirationDateFromToken(token);
    return expiration.before(new Date());
  }

  public String generateToken(ComiXedUser user) {
    return doGenerateToken(user.getEmail());
  }

  String doGenerateToken(String email) {

    Claims claims = Jwts.claims().setSubject(email);
    List<GrantedAuthority> authorities = new ArrayList<>();
    try {
      ComiXedUser user = this.userService.findByEmail(email);
      for (Role role : user.getRoles()) {
        authorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + role.getName()));
      }
    } catch (ComiXedUserException error) {
      log.error("Setting user authorities", error);
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
