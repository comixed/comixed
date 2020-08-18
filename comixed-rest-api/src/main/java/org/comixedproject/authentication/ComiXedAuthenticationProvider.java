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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Role;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * <code>ComiXedAuthenticationProvider</code> performs the actual authentication of a user.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComiXedAuthenticationProvider implements AuthenticationProvider {
  @Autowired private UserService userService;
  @Autowired private Utils utils;

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    String email = authentication.getName();
    String password = authentication.getCredentials().toString();

    log.debug("Attempting to authenticate: email={}", email);

    ComiXedUser user = null;
    try {
      user = userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      log.error("Could not load user", error);
      return null;
    }

    if (user == null) {
      log.debug("No such user: {}", email);
      return null;
    }

    if (utils.createHash(password.getBytes()).equals(user.getPasswordHash())) {
      log.debug("Passwords match!");

      List<GrantedAuthority> roles = new ArrayList<>();

      for (Role role : user.getRoles()) {
        log.debug("Granting role: {}", role.getName());
        roles.add(new SimpleGrantedAuthority(ROLE_PREFIX + role.getName()));
      }
      // update the last authenticated date
      user.setLastLoginDate(new Date());
      try {
        userService.save(user);
      } catch (ComiXedUserException error) {
        log.error("Failed to update user", error);
      }
      return new UsernamePasswordAuthenticationToken(email, password, roles);
    }

    log.debug("Passwords did not match!");

    return null;
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.equals(UsernamePasswordAuthenticationToken.class);
  }
}
