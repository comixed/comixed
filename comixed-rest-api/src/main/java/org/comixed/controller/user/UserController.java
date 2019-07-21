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

package org.comixed.controller.user;

import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.views.View.UserDetails;
import org.comixed.views.View.UserList;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.Preference;
import org.comixed.model.user.Role;
import org.comixed.service.user.ComiXedUserException;
import org.comixed.service.user.UserService;
import org.comixed.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(value = "/api")
public class UserController
        implements InitializingBean {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    Role readerRole;
    Role adminRole;

    @Autowired private UserService userService;
    @Autowired private Utils utils;

    @Override
    public void afterPropertiesSet()
            throws
            Exception {
        try {
            this.readerRole = this.userService.findRoleByName("READER");
            this.adminRole = this.userService.findRoleByName("ADMIN");
        }
        catch (ComiXedUserException error) {
            error.printStackTrace();
        }
    }

    @RequestMapping(value = "/admin/users/{id}",
                    method = RequestMethod.DELETE)
    public void deleteUser(
            @PathVariable("id")
                    long userId)
            throws
            ComiXedUserException {
        this.logger.info("Deleting user: id={}",
                         userId);

        this.userService.delete(userId);
    }

    @RequestMapping(value = "/admin/users/list",
                    method = RequestMethod.GET)
    @JsonView(UserList.class)
    public List<ComiXedUser> getAllUsers() {
        this.logger.debug("Getting the list of all users");

        List<ComiXedUser> result = this.userService.findAll();
        this.logger.debug("Found {} users",
                          result.size());

        return result;
    }

    @RequestMapping(value = "/user",
                    method = RequestMethod.GET)
    @JsonView(UserDetails.class)
    public ComiXedUser getCurrentUser(Principal user)
            throws
            ComiXedUserException {
        this.logger.debug("Returning current user");

        if (user == null) {
            this.logger.debug("Not authenticated");
            return null;
        }

        this.logger.debug("Loading user: {}",
                          user.getName());
        ComiXedUser comiXedUser = this.userService.findByEmail(user.getName());

        if (comiXedUser != null) {
            this.logger.debug("Setting authenticated flag");
            comiXedUser.setAuthenticated(true);
        }

        return comiXedUser;
    }

    @RequestMapping(value = "/user/preferences",
                    method = RequestMethod.GET)
    public List<Preference> getUserPreferences(Authentication authentication)
            throws
            ComiXedUserException {
        this.logger.debug("Getting user preferences");

        if (authentication == null) {
            this.logger.debug("User is not authenticated");
            return null;
        }

        String email = authentication.getName();

        this.logger.debug("Loading user: email={}",
                          email);
        ComiXedUser user = this.userService.findByEmail(email);

        if (user == null) {
            this.logger.debug("No such user: {}",
                              email);
            return null;
        }

        return user.getPreferences();
    }

    @RequestMapping(value = "/admin/users",
                    method = RequestMethod.POST)
    public ComiXedUser saveNewUser(
            @RequestParam("email")
                    String email,
            @RequestParam("password")
                    String password,
            @RequestParam("is_admin")
                    boolean isAdmin)
            throws
            ComiXedUserException {
        this.logger.debug("Creating new user: email={}",
                          email);

        ComiXedUser user = this.userService.findByEmail(email);

        if (user == null) {
            user = new ComiXedUser();

            this.logger.debug("Giving user reader access");
            user.addRole(this.readerRole);

            if (isAdmin) {
                this.logger.debug("Giving user admin access");
                user.addRole(this.adminRole);
            }

            user.setEmail(email);
            user.setPasswordHash(this.utils.createHash(password.getBytes()));
            this.userService.save(user);
        } else {
            this.logger.error("Email already used: {}",
                              email);
            return null;
        }

        return user;
    }

    @RequestMapping(value = "/user/preferences",
                    method = RequestMethod.POST)
    public ComiXedUser setUserProperty(Authentication authentication,
                                       @RequestParam("name")
                                               String name,
                                       @RequestParam("value")
                                               String value)
            throws
            ComiXedUserException {
        final String email = authentication.getName();

        this.logger.info("Setting user property: email={} property[{}]={}",
                         email,
                         name,
                         value);

        return this.userService.setUserProperty(email,
                                                name,
                                                value);
    }

    @RequestMapping(value = "/user/email",
                    method = RequestMethod.POST)
    public ComiXedUser setUserEmail(Authentication authentication,
                                    @RequestParam("username")
                                            String username)
            throws
            ComiXedUserException {
        final String email = authentication.getName();

        this.logger.info("Updating email address for: email={} new={}",
                         email,
                         username);

        return this.userService.setUserEmail(email,
                                             username);
    }

    @RequestMapping(value = "/user/password",
                    method = RequestMethod.POST)
    public ComiXedUser updatePassword(Authentication authentication,
                                      @RequestParam("password")
                                              String password)
            throws
            ComiXedUserException {
        final String email = authentication.getName();

        this.logger.info("Updating password for: email={}",
                         email);

        return this.userService.setUserPassword(email,
                                                password);
    }

    @RequestMapping(value = "/admin/users/{id}",
                    method = RequestMethod.PUT)
    public ComiXedUser updateUser(
            @PathVariable("id")
                    long id,
            @RequestParam("email")
                    String email,
            @RequestParam("password")
                    String password,
            @RequestParam("is_admin")
                    boolean isAdmin)
            throws
            ComiXedUserException {
        this.logger.info("Updating user: id={}");

        ComiXedUser user = this.userService.findById(id);

        if (user == null) {
            this.logger.error("No such user: id={}",
                              id);
            return null;
        }

        user.setEmail(email);

        if ((password != null) && !password.isEmpty()) {
            this.logger.debug("Updating user's password");
            user.setPasswordHash(this.utils.createHash(password.getBytes()));
        }
        user.clearRoles();
        user.addRole(this.readerRole);
        if (isAdmin) {
            user.addRole(this.adminRole);
        }
        this.logger.debug("Updating user: id={} email={} is_admin={}",
                          id,
                          email,
                          isAdmin
                          ? "Yes"
                          : "No");
        this.userService.save(user);

        return user;

    }

    void setReaderRole(final Role role) {
        this.readerRole = role;
    }

    void setAdminRole(final Role role) {
        this.adminRole = role;
    }
}
