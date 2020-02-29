/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.repositories;

import org.comixed.model.scraping.ComicVineIssue;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Performs persistence operations on instances of {@link ComicVineIssue}.
 *
 * @author Darryl L. Piece
 */
@Repository
public interface ComicVineIssueRepository extends CrudRepository<ComicVineIssue, Long> {
  /**
   * Retrieves the entry for the given volume id and issue number.
   *
   * @param issueId the issue id
   * @return the issue, not null if none was found
   */
  ComicVineIssue findByIssueId(String issueId);
}
