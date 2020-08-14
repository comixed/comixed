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

package org.comixedproject.repositories.tasks;

import java.util.Date;
import java.util.List;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * <code>TaskAuditLogRepository</code> handles storing and fetching instances of {@link
 * TaskAuditLogEntry}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface TaskAuditLogRepository extends JpaRepository<TaskAuditLogEntry, Long> {
  /**
   * Returns the first set of entries after the specified start date.
   *
   * @param startTime the earliest startTime date
   * @return the log entries
   */
  List<TaskAuditLogEntry> findAllByStartTimeGreaterThanOrderByStartTime(Date startTime);
}
