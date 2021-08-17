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

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * <code>ComiXedAuthenticationFilter</code> authenticates the user request.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComiXedAuthenticationFilter extends OncePerRequestFilter {
  static final String HEADER_STRING = "Authorization";
  static final String TOKEN_PREFIX = "Bearer ";
  public static final String BASIC_PREFIX = "Basic ";
  public static final String USER_PREFIX = "user";

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
    if (StringUtils.startsWith(header, TOKEN_PREFIX)) {
      authToken = header.replace(TOKEN_PREFIX, "").trim();
      try {
        username = this.jwtTokenUtil.getEmailFromToken(authToken);
      } catch (Exception error) {
        log.error("Unable to extract username from auth token", error);
      }
    } else if (StringUtils.startsWith(header, BASIC_PREFIX)) {
      String base64Credentials = header.substring(BASIC_PREFIX.length()).trim();
      byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
      var credentials = new String(credDecoded, StandardCharsets.UTF_8);

      String[] userDetails = credentials.split(":", 2);
      if (!userDetails[0].equals(USER_PREFIX)) {
        username = userDetails[0];
        password = this.utils.createHash(userDetails[1].getBytes());
      }
    } else {
      this.logger.warn("couldn't find bearer string, will ignore the header");
    }
    if (!StringUtils.isEmpty(username)
        && (SecurityContextHolder.getContext().getAuthentication() == null)) {

      var userDetails = this.userDetailsService.loadUserByUsername(username);

      if (userDetails.getPassword().equals(password)
          || this.jwtTokenUtil.validateToken(authToken, userDetails).booleanValue()) {
        var authentication =
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
