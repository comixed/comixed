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

package org.comixedproject.controller.tasks;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.controller.ComiXedControllerException;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.net.ApiResponse;
import org.comixedproject.repositories.tasks.TaskAuditLogRepository;
import org.comixedproject.service.ComiXedServiceException;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>TaskController</code> provides REST APIs for interacting with the tasks system.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping(value = "/api/tasks")
@Log4j2
public class TaskController {
  @Autowired private TaskAuditLogRepository taskAuditLogRepository;
  @Autowired private TaskService taskService;

  /**
   * Retrieve the list of log entries after the cutoff time.
   *
   * @param cutoff the cutoff
   * @return the log entries
   */
  @GetMapping(value = "/entries/{cutoff}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.TaskAuditLogEntryList.class)
  public List<TaskAuditLogEntry> getAllAfterDate(@PathVariable("cutoff") final Long timestamp)
      throws ComiXedControllerException {
    final Date cutoff = new Date(timestamp);
    log.debug("Getting all task audit log entries after: {}", cutoff);

    try {
      return this.taskService.getAuditLogEntriesAfter(cutoff);
    } catch (ComiXedServiceException error) {
      throw new ComiXedControllerException("unable to get task audit log entries", error);
    }
  }

  /**
   * Endpoint for clearing the task log.
   *
   * @return the success of the operation
   */
  @DeleteMapping(value = "/entries", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ApiResponse.class)
  public ApiResponse<Void> clearTaskAuditLog() {
    log.debug("Clearing task audit log");
    final ApiResponse<Void> response = new ApiResponse<>();

    try {
      this.taskService.clearTaskAuditLog();
      response.setSuccess(true);
    } catch (Exception error) {
      log.error("Failed to clear audit log", error);
      response.setSuccess(false);
      response.setError(error.getMessage());
    }

    return response;
  }
}
