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

package org.comixedproject.service.user;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.model.session.UserSession;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>SessionService</code> provides business logic for building a session update.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class SessionService {
  @Autowired private TaskService taskService;

  public SessionUpdate getSessionUpdate(final UserSession userSession, final long timeout) {
    final SessionUpdate result = new SessionUpdate();
    log.debug("Getting session update");

    Long cutoff = System.currentTimeMillis() + timeout;
    boolean done = false;

    while (!done) {
      result.setImportCount(
          this.taskService.getTaskCount(TaskType.ADD_COMIC)
              + this.taskService.getTaskCount(TaskType.PROCESS_COMIC));
      done = this.canReturn(result, userSession);
      if (!done) {
        try {
          log.debug("Sleeping 1000ms waiting for session update");
          Thread.sleep(1000L);
        } catch (InterruptedException error) {
          log.error("Failed to wait for session update", error);
          Thread.currentThread().interrupt();
        }
        done = System.currentTimeMillis() >= cutoff;
      }
    }

    // copy returned values into the session value
    userSession.copyValues(result);
    return result;
  }

  private boolean canReturn(final SessionUpdate sessionUpdate, final UserSession userSession) {
    // if any of the session stats have changed then we can return
    return !sessionUpdate.getImportCount().equals(userSession.getImportCount());
  }
}
