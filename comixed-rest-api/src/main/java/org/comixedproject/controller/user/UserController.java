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
import com.sun.istack.NotNull;
import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.messaging.user.DeleteUserPropertyMessage;
import org.comixedproject.model.messaging.user.SetUserPropertyMessage;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>UserController</code> provides endpoints for working with instances of {@link ComiXedUser}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class UserController {
  @Autowired private UserService userService;

  /**
   * Loads the current user.
   *
   * @param principal the user principal.
   * @return the user
   * @throws ComiXedUserException if no such user exists
   */
  @GetMapping(value = "/api/user", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.UserDetailsView.class)
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
  @SendToUser("/topic/user/current")
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
  @SendToUser("/topic/user/current")
  public ComiXedUser deleteCurrentUserProperty(
      @NotNull final Principal principal, @Payload DeleteUserPropertyMessage message)
      throws ComiXedUserException {
    final String email = principal.getName();
    final String name = message.getName();

    log.info("Deleting user preference: {} {}", principal.getName(), message.getName());
    return this.userService.deleteUserProperty(email, name);
  }
}
