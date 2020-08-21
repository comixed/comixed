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

package org.comixedproject.web.authentication;

import static org.comixedproject.web.authentication.AuthenticationConstants.HEADER_STRING;
import static org.comixedproject.web.authentication.AuthenticationConstants.TOKEN_PREFIX;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ComiXedAuthenticationFilter extends OncePerRequestFilter {
  @Autowired private ComiXedUserDetailsService userDetailsService;
  @Autowired private JwtTokenUtil jwtTokenUtil;
  @Autowired private Utils utils;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader(HEADER_STRING);
    String username = null;
    String password = null;
    String authToken = null;
    if ((header != null) && header.startsWith(TOKEN_PREFIX)) {
      authToken = header.replace(TOKEN_PREFIX, "");
      try {
        username = this.jwtTokenUtil.getEmailFromToken(authToken);
      } catch (IllegalArgumentException e) {
        this.logger.error("an error occured during getting username from token", e);
      } catch (ExpiredJwtException e) {
        this.logger.warn("the token is expired and not valid anymore", e);
      } catch (SignatureException e) {
        this.logger.error("Authentication Failed. Username or Password not valid.");
      }
    } else if ((header != null) && header.toLowerCase().startsWith("basic")) {

      String base64Credentials = header.substring("Basic".length()).trim();
      byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
      String credentials = new String(credDecoded, StandardCharsets.UTF_8);

      String[] userDetails = credentials.split(":", 2);
      if (!userDetails[0].equals("user")) {
        username = userDetails[0];
        password = this.utils.createHash(userDetails[1].getBytes());
      }
    } else {
      this.logger.warn("couldn't find bearer string, will ignore the header");
    }
    if ((username != null) && (SecurityContextHolder.getContext().getAuthentication() == null)) {

      UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

      if (userDetails.getPassword().equals(password)
          || this.jwtTokenUtil.validateToken(authToken, userDetails)) {
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        this.logger.debug("authenticated user " + username + ", setting security context");
        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
    }

    filterChain.doFilter(request, response);
  }
}
