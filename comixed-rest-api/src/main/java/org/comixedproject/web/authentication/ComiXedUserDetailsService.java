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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Role;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ComiXedUserDetailsService implements UserDetailsService {
  @Autowired private ComiXedUserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    log.debug("Loading user: email={}", email);

    ComiXedUser user = userRepository.findByEmail(email);

    if (user == null) {
      throw new UsernameNotFoundException("User not found");
    }

    UserBuilder result = User.withUsername(email);

    result.password(user.getPasswordHash());
    for (Role role : user.getRoles()) {
      result.roles(role.getName());
    }

    return result.build();
  }
}
