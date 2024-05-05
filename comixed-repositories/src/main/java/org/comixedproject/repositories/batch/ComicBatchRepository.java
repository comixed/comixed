/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.repositories.batch;

import org.comixedproject.model.batch.ComicBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ComicBatchRepository</code> provides APIs for working with persisted instances of {@link
 * ComicBatch}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ComicBatchRepository extends JpaRepository<ComicBatch, Long> {
  /**
   * Returns the record with the given name.
   *
   * @param batchName the batch name
   * @return the record
   */
  @Query("SELECT b FROM ComicBatch b WHERE b.name = :batchName")
  ComicBatch getByName(@Param("batchName") String batchName);
}
