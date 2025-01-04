/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.repositories.library;

import java.util.List;
import org.comixedproject.model.library.OrganizingComic;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * <code>OrganizingComicRepository</code> provides methods for working with the database for
 * instacne of {@link OrganizingComic}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface OrganizingComicRepository extends CrudRepository<OrganizingComic, Long> {
  @Query("SELECT o FROM OrganizingComic o")
  List<OrganizingComic> loadComics(Pageable pageable);
}
