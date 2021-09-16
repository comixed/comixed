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

package org.comixedproject.rest.admin;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.auditlog.WebAuditLogEntry;
import org.comixedproject.model.net.LoadWebAuditLogResponse;
import org.comixedproject.service.auditlog.WebAuditLogService;
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
  @Autowired private WebAuditLogService webAuditLogService;

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
      value = "/api/admin/web/audit/entries/{cutoff}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.AuditLogEntryList.class)
  public LoadWebAuditLogResponse loadWebAuditLogEntries(@PathVariable("cutoff") final Long cutoff) {
    log.info("Getting all web audit entries since {}", cutoff);
    final List<WebAuditLogEntry> entries = this.webAuditLogService.getEntriesAfterDate(cutoff);
    final Date latest =
        entries.isEmpty() ? new Date() : entries.get(entries.size() - 1).getEndTime();
    return new LoadWebAuditLogResponse(entries, latest);
  }

  /** Clear the rest audit log. */
  @DeleteMapping(value = "/api/admin/web/audit/entries")
  @PreAuthorize("hasRole('ADMIN')")
  public void deleteAllRestAuditLog() {
    log.info("Delete all the entries from the web audit log");
    this.webAuditLogService.clearLogEntries();
  }
}
