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

package org.comixed.web.controllers;

import java.security.Principal;
import java.util.List;

import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Preference;
import org.comixed.library.model.View.UserDetails;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.util.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonView;

@RestController
@RequestMapping(value = "/api")
public class UserController
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComiXedUserRepository userRepository;
    @Autowired
    private Utils utils;

    @RequestMapping(value = "/user",
                    method = RequestMethod.GET)
    @JsonView(UserDetails.class)
    public ComiXedUser getCurrentUser(Principal user)
    {
        this.logger.debug("Returning current user");

        if (user == null)
        {
            this.logger.debug("Not authenticated");
            return null;
        }

        this.logger.debug("Loading user: {}", user.getName());
        ComiXedUser comiXedUser = this.userRepository.findByEmail(user.getName());

        if (comiXedUser != null)
        {
            this.logger.debug("Setting authenticated flag");
            comiXedUser.setAuthenticated(true);
        }

        return comiXedUser;
    }

    @RequestMapping(value = "/user/preferences",
                    method = RequestMethod.GET)
    public List<Preference> getUserPreferences(Authentication authentication)
    {
        this.logger.debug("Getting user preferences");

        if (authentication == null)
        {
            this.logger.debug("User is not authenticated");
            return null;
        }

        String email = authentication.getName();

        this.logger.debug("Loading user: email={}", email);
        ComiXedUser user = this.userRepository.findByEmail(email);

        if (user == null)
        {
            this.logger.debug("No such user: {}", email);
            return null;
        }

        return user.getPreferences();
    }

    @RequestMapping(value = "/user/preferences",
                    method = RequestMethod.POST)
    public void setUserPreference(Authentication authentication,
                                  @RequestParam("name") String name,
                                  @RequestParam("value") String value)
    {
        this.logger.debug("Setting user property");

        if (authentication == null)
        {
            this.logger.debug("User is not authenticated");
            return;
        }
        String email = authentication.getName();

        this.logger.debug("Loading user: email={}", email);
        ComiXedUser user = this.userRepository.findByEmail(email);

        if (user == null)
        {
            this.logger.debug("No such user: {}", email);
            return;
        }

        this.logger.debug("Setting property: {}={}", name, value);
        user.setProperty(name, value);
        this.userRepository.save(user);
    }

    @RequestMapping(value = "/user/password",
                    method = RequestMethod.POST)
    public void updatePassword(Authentication authentication, @RequestParam("password") String password)
    {
        this.logger.debug("Updating password for: email={}", authentication.getName());
        ComiXedUser user = this.userRepository.findByEmail(authentication.getName());

        String hash = this.utils.createHash(password.getBytes());
        this.logger.debug("Setting password: hash={}", hash);
        user.setPasswordHash(hash);

        this.userRepository.save(user);
    }

    @RequestMapping(value = "/user/username",
                    method = RequestMethod.POST)
    public void updateUsername(Authentication authentication, @RequestParam("username") String username)
    {
        this.logger.debug("Updating username for: email={}", authentication.getName());
        ComiXedUser user = this.userRepository.findByEmail(authentication.getName());

        if (user != null)
        {
            this.logger.debug("Setting username: email={}", username);
            user.setEmail(username);

            this.userRepository.save(user);
        }
        else
        {
            this.logger.debug("User is no longer authenticated");
            authentication.setAuthenticated(false);
        }
    }
}
