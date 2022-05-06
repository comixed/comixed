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

package org.comixedproject.repositories.lists;

import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadingListRepository extends CrudRepository<ReadingList, Long> {
  /**
   * Retrieves all records for the given user.
   *
   * @param owner the owner
   * @return the reading lists
   */
  @Query("SELECT l FROM ReadingList l WHERE l.owner = :owner ORDER BY l.lastModifiedOn")
  List<ReadingList> getAllReadingListsForOwner(@Param("owner") ComiXedUser owner);

  /**
   * Returns the reading list with the given name and owner.
   *
   * @param owner the owner
   * @param listName the list name
   * @return the reading list
   */
  @Query(
      "SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM ReadingList l WHERE l.owner = :owner AND l.nameKey = UPPER(:listName)")
  boolean checkForExistingReadingList(
      @Param("owner") ComiXedUser owner, @Param("listName") String listName);

  /**
   * Retrieves the reading list with the given id owned by the specified user.
   *
   * @param owner the owner
   * @param id the record id
   * @return the reading list
   */
  @Query("SELECT l FROM ReadingList l WHERE l.id = :id AND l.owner = :owner")
  ReadingList getReadingListForUserAndId(@Param("owner") ComiXedUser owner, @Param("id") long id);

  @Query(
      "SELECT l FROM ReadingList l JOIN FETCH l.comicBooks WHERE l.owner.email = :email AND :comicBook MEMBER OF l.comicBooks")
  List<ReadingList> findByOwnerAndComic(
      @Param("email") String email, @Param("comicBook") ComicBook comicBook);

  /**
   * Returns the reading list with the given record id. Also included are any comics.
   *
   * @param id the record id
   * @return the reading list
   */
  @Query("SELECT l FROM ReadingList l LEFT JOIN FETCH l.comicBooks WHERE l.id = :id")
  ReadingList getById(@Param("id") Long id);
}
