/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.repositories.users;

import java.util.Set;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicSelection;
import org.comixedproject.model.user.ComiXedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ComicSelectionRepository</code> provides a repository for persisted instances of {@link
 * ComicSelection}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ComicSelectionRepository extends JpaRepository<ComicSelection, Long> {
  /**
   * Loads all existing selections for the specified user.
   *
   * @param user the user
   * @return the existing selections
   */
  @Query("SELECT s.comicBook.id FROM ComicSelection s WHERE s.user = :user")
  Set<Long> getAllForUser(@Param("user") ComiXedUser user);

  /**
   * Deletes the recod for the given user and comic detail.
   *
   * @param user the user
   * @param comicBook the comic book
   */
  @Query(
      "SELECT CASE WHEN COUNT(s) > 0 THEN TRUE ELSE FALSE END FROM ComicSelection s WHERE s.user = :user AND s.comicBook = :comicBook")
  boolean existsForUserAndComicBook(
      @Param("user") ComiXedUser user, @Param("comicBook") ComicBook comicBook);

  /**
   * Deletes the recod for the given user and comic detail.
   *
   * @param user the user
   * @param comicBook the comic book
   */
  @Query("DELETE FROM ComicSelection s WHERE s.user = :user AND s.comicBook = :comicBook")
  void deleteForUserAndComicBook(
      @Param("user") ComiXedUser user, @Param("comicBook") ComicBook comicBook);

  /**
   * Returns the record id for the given user's comic book selection.
   *
   * @param user the user
   * @param comicBook the comic book
   * @return the id
   */
  @Query("SELECT s.id FROM ComicSelection s WHERE s.user = :user AND s.comicBook = :comicBook")
  Long getIdForUserAndComic(
      @Param("user") ComiXedUser user, @Param("comicBook") ComicBook comicBook);
}
