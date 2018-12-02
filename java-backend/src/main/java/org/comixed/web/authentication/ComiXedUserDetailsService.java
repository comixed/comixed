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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.authentication;

import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Role;
import org.comixed.repositories.ComiXedUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class ComiXedUserDetailsService implements
                                       UserDetailsService
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComiXedUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException
    {
        logger.debug("Loading user: email={}", email);

        ComiXedUser user = userRepository.findByEmail(email);

        if (user == null) { throw new UsernameNotFoundException("User not found"); }

        UserBuilder result = User.withUsername(email);

        result.password(user.getPasswordHash());
        for (Role role : user.getRoles())
        {
            result.roles(role.getName());
        }

        return result.build();
    }
}
