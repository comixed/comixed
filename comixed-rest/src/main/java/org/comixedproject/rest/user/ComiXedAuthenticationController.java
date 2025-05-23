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

package org.comixedproject.rest.user;

import io.micrometer.core.annotation.Timed;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auth.AuthToken;
import org.comixedproject.auth.JwtTokenUtil;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ComiXedAuthenticationController</code> provides REST APIs for controller a user's session.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComiXedAuthenticationController {
  @Autowired private AuthenticationManager authenticationManager;
  @Autowired private JwtTokenUtil jwtTokenUtil;
  @Autowired private ComiXedUserRepository userRepository;

  /**
   * Authenticated the supplied credentials and generates an authentication token is they are
   * correct.
   *
   * @param email the email
   * @param password the password
   * @return the authentication token
   * @throws AuthenticationException if an error occurs
   */
  @PostMapping(value = "/api/token/generate", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.auth.generate-token")
  public AuthToken generateToken(
      @RequestParam("email") String email, @RequestParam("password") String password)
      throws AuthenticationException {
    log.debug("Attempting to authenticate user: {}", email);
    final Authentication authentication =
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password));

    SecurityContextHolder.getContext().setAuthentication(authentication);
    final ComiXedUser user = userRepository.findByEmail(email);
    final String token = jwtTokenUtil.generateToken(user);
    return new AuthToken(token, user.getEmail());
  }
}
