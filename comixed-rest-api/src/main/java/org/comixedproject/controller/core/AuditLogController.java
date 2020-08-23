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

package org.comixedproject.controller.core;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.controller.ComiXedControllerException;
import org.comixedproject.model.auditlog.RestAuditLogEntry;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.model.net.GetRestAuditLogResponse;
import org.comixedproject.model.net.GetTaskAuditLogResponse;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.ComiXedServiceException;
import org.comixedproject.service.auditlog.RestAuditLogService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>AuditLogController</code> provides REST APIs for interacting with the tasks system.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class AuditLogController {
  @Autowired private TaskService taskService;
  @Autowired private RestAuditLogService restAuditLogService;

  /**
   * Retrieve the list of log entries after the cutoff time.
   *
   * @param cutoff the cutoff
   * @return the log entries
   */
  @GetMapping(value = "/api/tasks/entries/{cutoff}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.AuditLogEntryList.class)
  @AuditableEndpoint
  public ApiResponse<GetTaskAuditLogResponse> getAllTaskEntriesAfterDate(
      @PathVariable("cutoff") final Long timestamp) throws ComiXedControllerException {
    ApiResponse<GetTaskAuditLogResponse> response = new ApiResponse<>();

    final Date cutoff = new Date(timestamp);
    log.debug("Getting all task audit log entries after: {}", cutoff);

    try {
      final List<TaskAuditLogEntry> entries = this.taskService.getAuditLogEntriesAfter(cutoff);
      response.setResult(new GetTaskAuditLogResponse());
      response.getResult().setEntries(entries);
      response
          .getResult()
          .setLatest(
              entries.isEmpty() ? new Date() : entries.get(entries.size() - 1).getStartTime());
      response.setSuccess(true);
    } catch (ComiXedServiceException error) {
      log.error("Failed to load task audit log entries", error);
      response.setSuccess(false);
      response.setError(error.getMessage());
      response.setThrowable(error);
    }

    return response;
  }

  /**
   * Endpoint for clearing the task log.
   *
   * @return the success of the operation
   */
  @DeleteMapping(value = "/api/tasks/entries", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ApiResponse.class)
  @AuditableEndpoint
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
      response.setThrowable(error);
    }

    return response;
  }

  /**
   * Returns the list of REST audit log entries that ended after the given date.
   *
   * <p><b>NOTE:</b> this endpoint is <em>NOT</em> audited since it would create an infinite
   * feedback loop.
   *
   * @param cutoff the cutoff timestamp
   * @return the list of entries
   */
  @GetMapping(
      value = "/api/auditing/rest/entries/{cutoff}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.AuditLogEntryList.class)
  public ApiResponse<GetRestAuditLogResponse> getAllRestEntriesAfterDate(
      @PathVariable("cutoff") final Long cutoff) {
    log.info("Getting all REST audit entries since {}", cutoff);
    ApiResponse<GetRestAuditLogResponse> response = new ApiResponse<>();

    try {
      final List<RestAuditLogEntry> result = this.restAuditLogService.getEntriesAfterDate(cutoff);
      response.setSuccess(true);
      response.setResult(new GetRestAuditLogResponse());
      response.getResult().setEntries(result);
      response
          .getResult()
          .setLatest(result.isEmpty() ? new Date() : result.get(result.size() - 1).getEndTime());
    } catch (Exception error) {
      response.setSuccess(false);
      response.setError(error.getMessage());
      response.setThrowable(error);
    }

    return response;
  }
}
