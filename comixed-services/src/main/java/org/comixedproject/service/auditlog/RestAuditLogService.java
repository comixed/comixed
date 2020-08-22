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

package org.comixedproject.service.auditlog;

import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.auditlog.RestAuditLogEntry;
import org.comixedproject.repositories.auditlog.RestAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>RestAuditLogService</code> provides business logic services for instances of {@link
 * RestAuditLogEntry}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class RestAuditLogService {
  private static final Object SEMAPHORE = new Object();

  @Autowired private RestAuditLogRepository auditLogRepository;

  /**
   * Save a new entry to the log.
   *
   * @param entry the entry
   * @return the saved entry
   */
  @Transactional
  public RestAuditLogEntry save(final RestAuditLogEntry entry) {
    log.debug("Saving new REST audit log entry: started={}", entry.getStartTime());
    return this.auditLogRepository.save(entry);
  }

  /**
   * Returns all REST audit log entries after the specified threshold date.
   *
   * @param cutoff the cutoff timestamp
   * @return the entries
   */
  public List<RestAuditLogEntry> getEntriesAfterDate(final Long cutoff) {
    log.debug("Fetching up to 100 REST audit log entries");

    List<RestAuditLogEntry> result = null;
    boolean done = false;
    long started = System.currentTimeMillis();

    while (!done) {
      result =
          this.auditLogRepository.findByEndTimeAfterOrderByEndTime(
              new Date(cutoff), PageRequest.of(0, 100));
      if (result.isEmpty()) {
        log.debug("Waiting for REST audit log entries");
        synchronized (SEMAPHORE) {
          try {
            SEMAPHORE.wait(1000L);
          } catch (InterruptedException error) {
            log.debug("Interrupted while getting REST audit log entries", error);
            Thread.currentThread().interrupt();
          }
        }
      }

      done = !result.isEmpty() || (System.currentTimeMillis() - started > 60000);
    }

    return result;
  }
}
