/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import java.util.Date;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadingListRepository extends CrudRepository<ReadingList, Long> {
  @Query("SELECT l FROM ReadingList l WHERE l.owner = :owner AND l.lastUpdated > :lastUpdated")
  List<ReadingList> getAllReadingListsForOwnerUpdatedAfter(
      @Param("owner") ComiXedUser owner, @Param("lastUpdated") Date lastUpdated);

  @Query(
      "SELECT l FROM ReadingList l JOIN FETCH l.comics WHERE l.owner = :owner AND l.name = :listName")
  ReadingList findReadingListForUser(ComiXedUser owner, String listName);

  @Query(
      "SELECT l FROM ReadingList l JOIN FETCH l.comics WHERE l.owner.email = :email AND :comic MEMBER OF l.comics")
  List<ReadingList> findByOwnerAndComic(@Param("email") String email, @Param("comic") Comic comic);

  @Query("SELECT l FROM ReadingList l JOIN FETCH l.comics WHERE l.id = :id")
  ReadingList getById(@Param("id") Long id);
}
