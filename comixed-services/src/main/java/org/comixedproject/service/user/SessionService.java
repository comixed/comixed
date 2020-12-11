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

import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.auditlog.AuditEvent;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicAuditor;
import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.comic.ComicService;
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
  @Autowired private ComicService comicService;
  @Autowired private ComicAuditor comicAuditor;

  /**
   * Retrieves a session update with the specific timeout period. Only returns events that occurred
   * after the specified timestamp. For each type, returns only up to the specific maximum record
   * count.
   *
   * @param timestamp the timestamp
   * @param maximumRecords the maximum records
   * @param timeout the timeout period
   * @return the session update
   */
  public SessionUpdate getSessionUpdate(
      final long timestamp, final int maximumRecords, final long timeout) {
    log.debug("Getting session update");

    Long cutoff = System.currentTimeMillis() + (timeout * 1000L);
    boolean done = false;
    List<Comic> comicsUpdated = null;
    List<AuditEvent<Long>> comicIdsRemoved = null;
    int importCount = 0;

    while (!done) {
      comicsUpdated = this.comicService.getComicsUpdatedSince(timestamp, maximumRecords);
      comicIdsRemoved = this.comicAuditor.getEntriesSinceTimestamp(timestamp, maximumRecords);
      importCount =
          this.taskService.getTaskCount(TaskType.ADD_COMIC)
              + this.taskService.getTaskCount(TaskType.PROCESS_COMIC);
      done = !comicsUpdated.isEmpty() || !comicIdsRemoved.isEmpty();
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

    return createSessionUpdate(
        timestamp, maximumRecords, importCount, comicsUpdated, comicIdsRemoved);
  }

  private SessionUpdate createSessionUpdate(
      final long timestamp,
      final int maximumRecords,
      final int importCount,
      final List<Comic> comicsUpdated,
      final List<AuditEvent<Long>> comicIdsRemoved) {
    final List<Comic> updated = new ArrayList<>();
    final List<Long> removed = new ArrayList<>();
    int updatedIndex = 0;
    int removedIndex = 0;
    long latest = timestamp;
    final int count = 0;
    boolean done = false;

    log.debug("Reducing response to maximum records: {}", maximumRecords);
    while (!done) {
      final long updateTimestamp =
          updatedIndex < comicsUpdated.size()
              ? comicsUpdated.get(updatedIndex).getDateLastUpdated().getTime()
              : 0L;
      final long removeTimestamp =
          removedIndex < comicIdsRemoved.size()
              ? comicIdsRemoved.get(removedIndex).getOccurred().getTime()
              : 0L;
      if (updateTimestamp > removeTimestamp) {
        updated.add(comicsUpdated.get(updatedIndex));
        latest = comicsUpdated.get(updatedIndex).getDateLastUpdated().getTime();
        updatedIndex++;
      } else {
        removed.add(comicIdsRemoved.get(removedIndex).getValue());
        latest = comicIdsRemoved.get(removedIndex).getOccurred().getTime();
        removedIndex++;
      }
      done =
          updatedIndex == comicsUpdated.size() && removedIndex == comicIdsRemoved.size()
              || count == maximumRecords;
    }

    return new SessionUpdate(updated, removed, importCount, latest);
  }
}
