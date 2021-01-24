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
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.net.SaveUserRequest;
import org.comixedproject.model.net.user.SaveUserPreferenceRequest;
import org.comixedproject.model.net.user.SaveUserPreferenceResponse;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Preference;
import org.comixedproject.model.user.Role;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.utils.Utils;
import org.comixedproject.views.View.UserDetailsView;
import org.comixedproject.views.View.UserList;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
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
  @AuditableEndpoint
  public void deleteUser(@PathVariable("id") long userId) throws ComiXedUserException {
    log.info("Deleting user: id={}", userId);

    this.userService.delete(userId);
  }

  @GetMapping(value = "/admin/users", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(UserList.class)
  @AuditableEndpoint
  public List<ComiXedUser> getAllUsers() {
    log.info("Getting all user accounts");

    return this.userService.findAll();
  }

  /**
   * Returns the currently authenticated user.
   *
   * @param principal the principal
   * @return the user, or <code>null</code> if no user is authenticated
   * @throws ComiXedUserException if an error occurs
   */
  @GetMapping(value = "/api/user")
  @JsonView(UserDetailsView.class)
  @AuditableEndpoint
  public ComiXedUser getCurrentUser(Principal principal) throws ComiXedUserException {
    log.debug("Returning current user");
    ComiXedUser comixedUser = null;

    if (principal == null) {
      log.debug("Not authenticated");
      return null;
    }

    log.debug("Loading user: {}", principal.getName());
    comixedUser = this.userService.findByEmail(principal.getName());

    if (comixedUser != null) {
      log.debug("Setting authenticated flag");
      comixedUser.setAuthenticated(true);
    }

    return comixedUser;
  }

  @GetMapping(value = "/api/user/preferences")
  @JsonView(UserDetailsView.class)
  public List<Preference> getUserPreferences(Principal principal) throws ComiXedUserException {
    log.debug("Getting user preferences");

    if (principal == null) {
      log.debug("User is not authenticated");
      return null;
    }

    String email = principal.getName();

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

  /**
   * Sets a user preference.
   *
   * @param principal the user principal
   * @param name the preference name
   * @param request the request body
   * @return the response body
   * @throws ComiXedUserException if an error occurs
   */
  @PutMapping(
      value = "/api/user/preferences/{name}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public SaveUserPreferenceResponse setUserProperty(
      Principal principal,
      @PathVariable("name") String name,
      @RequestBody() SaveUserPreferenceRequest request)
      throws ComiXedUserException {
    final String email = principal.getName();
    final String value = request.getValue();

    log.info("Setting user property: email={} property[{}]={}", email, name, value);
    return new SaveUserPreferenceResponse(this.userService.setUserProperty(email, name, value));
  }

  /**
   * Deletes a user preference.
   *
   * @param principal the user principal
   * @param name the preference name
   * @return the response body
   */
  @DeleteMapping(
      value = "/api/user/preferences/{name}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  public SaveUserPreferenceResponse deleteUserProperty(
      final Principal principal, @PathVariable("name") final String name) {
    final String email = principal.getName();

    log.info("Deleting user property: email={} property={}", email, name);
    return new SaveUserPreferenceResponse(this.userService.deleteUserProperty(email, name));
  }

  @PostMapping(value = "/api/user/email")
  public ComiXedUser setUserEmail(Principal principal, @RequestParam("username") String username)
      throws ComiXedUserException {
    final String email = principal.getName();

    log.info("Updating email address for: email={} new={}", email, username);

    return this.userService.setUserEmail(email, username);
  }

  @PostMapping(value = "/api/user/password")
  public ComiXedUser updatePassword(Principal principal, @RequestParam("password") String password)
      throws ComiXedUserException {
    final String email = principal.getName();

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
}
