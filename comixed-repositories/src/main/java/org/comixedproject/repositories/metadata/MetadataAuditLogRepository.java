/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
 * aLong with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.repositories.metadata;

import java.util.List;
import org.comixedproject.model.metadata.MetadataAuditLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * <code>MetadataAuditLogRepository</code> provides persistence methods for instances of {@link
 * MetadataAuditLogEntry}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface MetadataAuditLogRepository extends JpaRepository<MetadataAuditLogEntry, Long> {
  /**
   * Loads all audit log entries.
   *
   * @return the entry list
   */
  @Query("SELECT e FROM MetadataAuditLogEntry e JOIN FETCH e.comicBook ORDER BY e.createdOn")
  List<MetadataAuditLogEntry> loadAll();
}
