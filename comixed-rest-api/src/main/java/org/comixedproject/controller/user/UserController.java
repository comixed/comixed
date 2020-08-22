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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.controller.user;

import com.fasterxml.jackson.annotation.JsonView;
import java.security.Principal;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.SaveUserRequest;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Preference;
import org.comixedproject.model.user.Role;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.utils.Utils;
import org.comixedproject.views.View.UserDetails;
import org.comixedproject.views.View.UserList;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api")
@Log4j2
public class UserController implements InitializingBean {
  Role readerRole;
  Role adminRole;

  @Autowired private UserService userService;
  @Autowired private Utils utils;

  @Override
  public void afterPropertiesSet() throws Exception {
    try {
      this.readerRole = this.userService.findRoleByName("READER");
      this.adminRole = this.userService.findRoleByName("ADMIN");
    } catch (ComiXedUserException error) {
      error.printStackTrace();
    }
  }

  @RequestMapping(value = "/admin/users/{id}", method = RequestMethod.DELETE)
  public void deleteUser(@PathVariable("id") long userId) throws ComiXedUserException {
    log.info("Deleting user: id={}", userId);

    this.userService.delete(userId);
  }

  @GetMapping(value = "/admin/users", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(UserList.class)
  public List<ComiXedUser> getAllUsers() {
    log.info("Getting all user accounts");

    return this.userService.findAll();
  }

  @RequestMapping(value = "/user", method = RequestMethod.GET)
  @JsonView(UserDetails.class)
  public ComiXedUser getCurrentUser(Principal user) throws ComiXedUserException {
    log.debug("Returning current user");

    if (user == null) {
      log.debug("Not authenticated");
      return null;
    }

    log.debug("Loading user: {}", user.getName());
    ComiXedUser comiXedUser = this.userService.findByEmail(user.getName());

    if (comiXedUser != null) {
      log.debug("Setting authenticated flag");
      comiXedUser.setAuthenticated(true);
    }

    return comiXedUser;
  }

  @RequestMapping(value = "/user/preferences", method = RequestMethod.GET)
  public List<Preference> getUserPreferences(Authentication authentication)
      throws ComiXedUserException {
    log.debug("Getting user preferences");

    if (authentication == null) {
      log.debug("User is not authenticated");
      return null;
    }

    String email = authentication.getName();

    log.debug("Loading user: email={}", email);
    ComiXedUser user = this.userService.findByEmail(email);

    if (user == null) {
      log.debug("No such user: {}", email);
      return null;
    }

    return user.getPreferences();
  }

  @PostMapping(
      value = "/admin/users",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public ComiXedUser saveNewUser(@RequestBody() final SaveUserRequest request)
      throws ComiXedUserException {
    log.info(
        "Creating new user: email={} admin={}",
        request.getEmail(),
        request.getIsAdmin() ? "Yes" : "No");

    return this.userService.createUser(
        request.getEmail(), request.getPassword(), request.getIsAdmin());
  }

  @RequestMapping(value = "/user/preferences/{name}", method = RequestMethod.PUT)
  public ComiXedUser setUserProperty(
      Authentication authentication, @PathVariable("name") String name, @RequestBody() String value)
      throws ComiXedUserException {
    final String email = authentication.getName();

    log.info("Setting user property: email={} property[{}]={}", email, name, value);

    return this.userService.setUserProperty(email, name, value);
  }

  @RequestMapping(value = "/user/email", method = RequestMethod.POST)
  public ComiXedUser setUserEmail(
      Authentication authentication, @RequestParam("username") String username)
      throws ComiXedUserException {
    final String email = authentication.getName();

    log.info("Updating email address for: email={} new={}", email, username);

    return this.userService.setUserEmail(email, username);
  }

  @RequestMapping(value = "/user/password", method = RequestMethod.POST)
  public ComiXedUser updatePassword(
      Authentication authentication, @RequestParam("password") String password)
      throws ComiXedUserException {
    final String email = authentication.getName();

    log.info("Updating password for: email={}", email);

    return this.userService.setUserPassword(email, password);
  }

  @PutMapping(
      value = "/admin/users/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public ComiXedUser updateUser(
      final Principal principal,
      @PathVariable("id") long id,
      @RequestBody() final SaveUserRequest request)
      throws ComiXedUserException {
    final ComiXedUser authUser = this.userService.findByEmail(principal.getName());

    log.info("Updating user: id={}", id);
    ComiXedUser user = this.userService.findById(id);

    if (user == null) {
      log.debug("No such user");
      return null;
    }

    user.setEmail(request.getEmail());

    if ((request.getPassword() != null) && !request.getPassword().isEmpty()) {
      log.debug("Updating user's password");
      user.setPasswordHash(this.utils.createHash(request.getPassword().getBytes()));
    }

    if (authUser.isAdmin()) {
      log.debug("Auth user is admin: updating roles");
      if (authUser.getId() != id) {
        user.clearRoles();
        user.addRole(this.readerRole);
        if (request.getIsAdmin()) {
          user.addRole(this.adminRole);
        }
      } else {
        log.debug("Admins cannot change their own roles");
      }
    }
    log.debug(
        "Updating user: id={} email={} is_admin={}",
        id,
        request.getEmail(),
        request.getIsAdmin() ? "Yes" : "No");
    return this.userService.save(user);
  }

  void setReaderRole(final Role role) {
    this.readerRole = role;
  }

  void setAdminRole(final Role role) {
    this.adminRole = role;
  }

  @RequestMapping(value = "/user/preferences/{name}", method = RequestMethod.DELETE)
  public ComiXedUser deleteUserProperty(
      final Authentication authentication, @PathVariable("name") final String propertyName) {

    final String email = authentication.getName();
    log.info("Deleting user property: email={} property={}", email, propertyName);
    return this.userService.deleteUserProperty(email, propertyName);
  }
}
