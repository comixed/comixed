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

package org.comixedproject.model.comic;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.persistence.PostRemove;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.auditlog.AuditEvent;
import org.comixedproject.model.auditlog.AuditEventType;
import org.springframework.stereotype.Component;

/**
 * <code>ComicAuditor</code> defines a bean that receives notifications of persistence events on
 * instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicAuditor {
  private List<AuditEvent<Long>> removalEvents = new ArrayList<>();

  /**
   * Invoked when a comic has been deleted.
   *
   * @param comic the comic
   */
  @PostRemove
  public void comicRemoved(final Comic comic) {
    log.debug("Added audit entry for delted comic: id={}", comic.getId());
    this.removalEvents.add(new AuditEvent<>(comic.getId(), AuditEventType.DELETED));
  }

  /**
   * Retrieves up to a maximum number of records from the audit log that have occurred since the
   * specific timestamp.
   *
   * @param timestamp the timestamp
   * @param maximumRecords the maximum records
   * @return the list of events
   */
  public List<AuditEvent<Long>> getEntriesSinceTimestamp(
      final long timestamp, final int maximumRecords) {
    log.debug("Getting first audit entry after timestamp");
    final Optional<AuditEvent<Long>> firstEntry =
        this.removalEvents.stream()
            .findFirst()
            .filter(comicAuditEvent -> comicAuditEvent.getOccurred().getTime() > timestamp);
    if (firstEntry.isEmpty()) {
      log.debug("No entries found");
      return new ArrayList<>();
    }
    final int first = this.removalEvents.indexOf(firstEntry.get());
    final int last =
        (first + maximumRecords <= this.removalEvents.size())
            ? first + maximumRecords
            : this.removalEvents.size();
    return this.removalEvents.subList(first, last);
  }
}
