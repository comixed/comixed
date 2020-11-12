/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import javax.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.model.net.session.SessionUpdateRequest;
import org.comixedproject.model.net.session.SessionUpdateResponse;
import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.model.session.UserSession;
import org.comixedproject.service.user.SessionService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Log4j2
public class SessionController {
  public static final String SESSION_ENTRY_KEY = "session-update";

  @Autowired private SessionService sessionService;

  /**
   * Retrieves a session update. Waits a given period of time before returning an empty update.
   *
   * @param request the request body
   * @return the session update
   */
  @PostMapping(
      value = "/api/session/updates",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.SessionUpdateView.class)
  public ApiResponse<SessionUpdateResponse> getSessionUpdate(
      final HttpSession httpSession, @RequestBody() final SessionUpdateRequest request) {
    UserSession userSession = null;

    if (request.getReset()) {
      log.info("Resetting the user server-side session");
      userSession = new UserSession();
    } else {
      log.info("Retrieving the user server-side session");
      userSession = (UserSession) httpSession.getAttribute(SESSION_ENTRY_KEY);
      if (userSession == null) {
        log.info("Creating a new server-side session");
        userSession = new UserSession();
      }
    }

    final Long timeout = request.getTimeout();
    log.info("Getting session update: timeout={}", timeout);
    final SessionUpdate sessionUpdate = this.sessionService.getSessionUpdate(userSession, timeout);

    this.log.info("Saving server-side session");
    httpSession.setAttribute(SESSION_ENTRY_KEY, userSession);

    log.info("Returning session update");
    return new ApiResponse<>(new SessionUpdateResponse(sessionUpdate));
  }
}
