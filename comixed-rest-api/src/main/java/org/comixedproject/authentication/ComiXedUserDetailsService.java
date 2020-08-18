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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

/**
 * <code>ComiXedUserDetailsService</code> handles mapping instances of {@link ComiXedUser} to
 * instances of {@link UserDetails}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComiXedUserDetailsService implements UserDetailsService {
  @Autowired private UserService userService;

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    log.debug("Loading user: email={}", email);

    ComiXedUser user = null;

    try {
      user = userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      throw new UsernameNotFoundException("User not found", error);
    }

    UserBuilder result = User.withUsername(email);

    result.password(user.getPasswordHash());
    String[] roles = new String[user.getRoles().size()];
    for (int index = 0; index < user.getRoles().size(); index++) {
      roles[index] = user.getRoles().get(index).getName();
    }
    result.roles(roles);

    return result.build();
  }
}
