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

package org.comixedproject.repositories.auditlog;

import java.util.Date;
import java.util.List;
import org.comixedproject.model.auditlog.RestAuditLogEntry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>RestAuditLogRepository</code> manages persisted instances of {@link RestAuditLogEntry}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface RestAuditLogRepository extends JpaRepository<RestAuditLogEntry, Long> {
  /**
   * Retrieve a page of entries after the provided cutoff date.
   *
   * @param cutoff the cutoff date
   * @param pageable the page parameters
   * @return the list of entries
   */
  List<RestAuditLogEntry> findByEndTimeAfterOrderByEndTime(
      @Param("cutoff") Date cutoff, Pageable pageable);
}
