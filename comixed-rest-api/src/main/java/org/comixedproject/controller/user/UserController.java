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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.istack.NotNull;
import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.model.messaging.user.DeleteUserPropertyMessage;
import org.comixedproject.model.messaging.user.SetUserPropertyMessage;
import org.comixedproject.model.net.user.UpdateCurrentUserRequest;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>UserController</code> provides endpoints for working with instances of {@link ComiXedUser}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class UserController {
  @Autowired private UserService userService;
  @Autowired private SimpMessagingTemplate messagingTemplate;
  @Autowired private ObjectMapper objectMapper;

  /**
   * Loads the current user.
   *
   * @param principal the user principal.
   * @return the user
   * @throws ComiXedUserException if no such user exists
   */
  @GetMapping(value = "/api/user", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.UserDetailsView.class)
  @PreAuthorize("hasAnyRole('READER','ADMIN')")
  public ComiXedUser loadCurrentUser(@NotNull final Principal principal)
      throws ComiXedUserException {
    log.info("Loading current user: {}", principal.getName());
    return this.userService.findByEmail(principal.getName());
  }

  /**
   * Sets a preference name and value for a user.
   *
   * @param principal the user principal
   * @param message the message body
   * @return the updated user
   * @throws ComiXedUserException if the user is invalid
   */
  @MessageMapping("user.preference.save")
  @SendToUser(Constants.CURRENT_USER_UPDATE_TOPIC)
  public ComiXedUser saveCurrentUserProperty(
      @NotNull final Principal principal, @Payload SetUserPropertyMessage message)
      throws ComiXedUserException {
    final String email = principal.getName();
    final String name = message.getName();
    final String value = message.getValue();

    log.info("Setting user preference: {} {}=\"{}\"", email, name, value);
    return this.userService.setUserProperty(email, name, value);
  }

  /**
   * Deletes a user property.
   *
   * @param principal the user principal
   * @param message the message body
   * @return the updated user
   * @throws ComiXedUserException if the user is invalid
   */
  @MessageMapping("user.preference.delete")
  @SendToUser(Constants.CURRENT_USER_UPDATE_TOPIC)
  public ComiXedUser deleteCurrentUserProperty(
      @NotNull final Principal principal, @Payload DeleteUserPropertyMessage message)
      throws ComiXedUserException {
    final String email = principal.getName();
    final String name = message.getName();

    log.info("Deleting user preference: {} {}", principal.getName(), message.getName());
    return this.userService.deleteUserProperty(email, name);
  }

  /**
   * Updates the current user.
   *
   * @param id the user record id
   * @param request the request body
   * @return the updated user
   * @throws ComiXedUserException if an error occurs
   */
  @PutMapping(
      value = "/api/user/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.UserDetailsView.class)
  @AuditableEndpoint
  public ComiXedUser updateCurrentUser(
      @PathVariable("id") final long id, @RequestBody() final UpdateCurrentUserRequest request)
      throws ComiXedUserException {
    final String email = request.getEmail();
    final String password = request.getPassword();
    log.info("Updated user account: id={} email={}", id, email);
    final ComiXedUser response = this.userService.updateCurrentUser(id, email, password);
    try {
      this.messagingTemplate.convertAndSend(
          Constants.CURRENT_USER_UPDATE_TOPIC,
          this.objectMapper
              .writerWithView(View.UserDetailsView.class)
              .writeValueAsString(response));
    } catch (JsonProcessingException error) {
      log.error("Failed to publish user update", error);
    }
    return response;
  }
}
