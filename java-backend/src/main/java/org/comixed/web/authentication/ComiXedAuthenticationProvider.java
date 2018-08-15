/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import java.util.ArrayList;
import java.util.List;

import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Role;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.util.Utils;
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
        this.logger.debug("Performing user authentication");

        String email = authentication.getName();
        Object password = authentication.getCredentials();

        if (password == null)
        {
            this.logger.debug("No password provided");
            return null;
        }

        this.logger.debug("Authenticating user: email={}", email);

        ComiXedUser dbuser = this.userRepository.findByEmail(email);

        if (dbuser != null)
        {
            String lihash = this.utils.createHash(password.toString().getBytes());

            if (lihash.toUpperCase().equals(dbuser.getPasswordHash().toUpperCase()))
            {
                List<GrantedAuthority> grantedAuths = new ArrayList<>();
                for (Role role : dbuser.getRoles())
                {
                    logger.debug("Granting role: {}", role.getName());
                    // we need to prepend "ROLE_" to the role for Tomcat to
                    // acknowledge it
                    grantedAuths.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                }
                this.logger.debug("Successful authentication");
                return new UsernamePasswordAuthenticationToken(email, password, grantedAuths);
            }
        }
        else
        {
            this.logger.debug("No such user");
        }

        this.logger.debug("Authentication failed");
        return null;
    }

    @Override
    public boolean supports(Class<?> clazz)
    {
        this.logger.debug("Checking for support of class: {}", clazz.getName());
        return clazz.equals(UsernamePasswordAuthenticationToken.class);
    }

}
