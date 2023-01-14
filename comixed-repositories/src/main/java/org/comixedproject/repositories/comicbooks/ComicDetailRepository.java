/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

package org.comixedproject.repositories.comicbooks;

import java.util.List;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ComicDetailRepository</code> works directly with persisted instances of {@link
 * ComicDetail}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ComicDetailRepository extends JpaRepository<ComicDetail, Long> {
  /**
   * Returns a set of records with an id greater than the one provided.
   *
   * @param lastId the last id
   * @param pageRequest the page parameter
   * @return the records
   */
  @Query("SELECT d FROM ComicDetail d WHERE d.id > :lastId ORDER BY d.id")
  List<ComicDetail> getWithIdGreaterThan(@Param("lastId") Long lastId, Pageable pageRequest);
}
