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
import java.util.Optional;

import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Preference;
import org.comixed.library.model.Role;
import org.comixed.library.model.View.UserDetails;
import org.comixed.library.model.View.UserList;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.RoleRepository;
import org.comixed.util.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonView;

@RestController
@RequestMapping(value = "/api")
public class UserController implements
                            InitializingBean
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComiXedUserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private Utils utils;

    Role readerRole;

    Role adminRole;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.readerRole = this.roleRepository.findByName("READER");
        this.adminRole = this.roleRepository.findByName("ADMIN");
    }

    @RequestMapping(value = "/admin/users/{id}",
                    method = RequestMethod.DELETE)
    public boolean deleteUser(@PathVariable("id") long userId)
    {
        this.logger.debug("Deleting user: id={}", userId);

        Optional<ComiXedUser> record = this.userRepository.findById(userId);

        if (!record.isPresent())
        {
            this.logger.debug("No such user");
            return false;
        }

        ComiXedUser user = record.get();

        this.logger.debug("Found account. Deleting {}", user.getEmail());
        this.userRepository.delete(user);

        return true;
    }

    @RequestMapping(value = "/admin/users/list",
                    method = RequestMethod.GET)
    @JsonView(UserList.class)
    public List<ComiXedUser> getAllUsers()
    {
        this.logger.debug("Getting the list of all users");

        List<ComiXedUser> result = this.userRepository.findAll();
        this.logger.debug("Found {} users", result.size());

        return result;
    }

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

    @RequestMapping(value = "/admin/users",
                    method = RequestMethod.POST)
    public ComiXedUser saveNewUser(@RequestParam("email") String email,
                                   @RequestParam("password") String password,
                                   @RequestParam("is_admin") boolean isAdmin)
    {
        this.logger.debug("Creating new user: email={}", email);

        ComiXedUser user = this.userRepository.findByEmail(email);

        if (user == null)
        {
            user = new ComiXedUser();

            this.logger.debug("Giving user reader access");
            user.addRole(this.readerRole);

            if (isAdmin)
            {
                this.logger.debug("Giving user admin access");
                user.addRole(this.adminRole);
            }

            user.setEmail(email);
            user.setPasswordHash(this.utils.createHash(password.getBytes()));
            this.userRepository.save(user);
        }
        else
        {
            this.logger.error("Email already used: {}", email);
            return null;
        }

        return user;
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

    @RequestMapping(value = "/user/email",
                    method = RequestMethod.POST)
    public void updateEmail(Authentication authentication, @RequestParam("username") String username)
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

    @RequestMapping(value = "/admin/users/{id}",
                    method = RequestMethod.PUT)
    public ComiXedUser updateUser(@PathVariable("id") long id,
                                  @RequestParam("email") String email,
                                  @RequestParam("password") String password,
                                  @RequestParam("is_admin") boolean isAdmin)
    {
        this.logger.debug("Updating user: id={}");

        Optional<ComiXedUser> record = this.userRepository.findById(id);

        if (!record.isPresent())
        {
            this.logger.error("No such user: id={}", id);
            return null;
        }

        ComiXedUser user = record.get();

        user.setEmail(email);

        if ((password != null) && !password.isEmpty())
        {
            this.logger.debug("Updating user's password");
            user.setPasswordHash(this.utils.createHash(password.getBytes()));
        }
        user.clearRoles();
        user.addRole(this.readerRole);
        if (isAdmin)
        {
            user.addRole(this.adminRole);
        }
        this.logger.debug("Updating user: id={} email={} is_admin={}", id, email, isAdmin ? "Yes" : "No");
        this.userRepository.save(user);

        return user;

    }
}
