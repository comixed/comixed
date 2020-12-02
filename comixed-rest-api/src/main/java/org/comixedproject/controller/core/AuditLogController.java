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
import org.comixedproject.model.auditlog.RestAuditLogEntry;
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
   * @param timestamp the cutoff timestamp
   * @return the log entries
   * @throws ComiXedServiceException if an error occurs
   */
  @GetMapping(value = "/api/tasks/entries/{cutoff}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.AuditLogEntryList.class)
  @AuditableEndpoint
  public GetTaskAuditLogResponse getAllTaskEntriesAfterDate(
      @PathVariable("cutoff") final Long timestamp) throws ComiXedServiceException {
    final Date cutoff = new Date(timestamp);
    log.debug("Getting all task audit log entries after: {}", cutoff);

    final List<TaskAuditLogEntry> entries = this.taskService.getAuditLogEntriesAfter(cutoff);
    final Date latest =
        entries.isEmpty() ? new Date() : entries.get(entries.size() - 1).getStartTime();

    return new GetTaskAuditLogResponse(entries, latest);
  }

  /** Endpoint for clearing the task log. */
  @DeleteMapping(value = "/api/tasks/entries", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ApiResponse.class)
  @AuditableEndpoint
  public void clearTaskAuditLog() {
    log.debug("Clearing task audit log");
    this.taskService.clearTaskAuditLog();
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
  public GetRestAuditLogResponse getAllRestEntriesAfterDate(
      @PathVariable("cutoff") final Long cutoff) {
    log.info("Getting all REST audit entries since {}", cutoff);
    final List<RestAuditLogEntry> entries = this.restAuditLogService.getEntriesAfterDate(cutoff);
    final Date latest =
        entries.isEmpty() ? new Date() : entries.get(entries.size() - 1).getEndTime();
    return new GetRestAuditLogResponse(entries, latest);
  }
}
