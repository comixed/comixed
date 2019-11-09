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

package org.comixed.web.authentication;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.Role;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class ComiXedAuthenticationProvider implements
                                           AuthenticationProvider
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComiXedUserRepository userRepository;

    @Autowired
    private Utils utils;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException
    {
        String email = authentication.getName();
        String password = authentication.getCredentials().toString();

        logger.debug("Attempting to authenticate: email={}", email);

        ComiXedUser user = userRepository.findByEmail(email);

        if (user == null)
        {
            logger.debug("No such user");
            return null;
        }

        if (utils.createHash(password.getBytes()).equals(user.getPasswordHash()))
        {
            logger.debug("Passwords match!");

            List<GrantedAuthority> roles = new ArrayList<>();

            for (Role role : user.getRoles())
            {
                logger.debug("Granting role: {}", role.getName());
                roles.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            }
            // update the last authenticated date
            user.setLastLoginDate(new Date());
            userRepository.save(user);
            return new UsernamePasswordAuthenticationToken(email, password, roles);
        }

        logger.debug("Passwords did not match!");

        return null;
    }

    @Override
    public boolean supports(Class<?> authentication)
    {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }

}
