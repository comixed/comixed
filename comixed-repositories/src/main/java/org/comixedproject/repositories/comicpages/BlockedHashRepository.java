/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.repositories.comicpages;

import java.util.List;
import org.comixedproject.model.comicpages.BlockedHash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * <code>BlockedHashRepository</code> manages persisted instances of {@link BlockedHash}.
 *
 * @author The ComiXed Project
 */
public interface BlockedHashRepository extends JpaRepository<BlockedHash, Long> {
  /**
   * Returns the one instance with the given hash.
   *
   * @param hash the offset hash
   * @return the instance, or <code>null</code> if no such hash is registered
   */
  @Query("SELECT b FROM BlockedHash b WHERE b.hash = :#{#hash}")
  BlockedHash findByHash(@Param("hash") String hash);

  /**
   * Retrieves all blocked page records.
   *
   * @return the records.
   */
  @Query("SELECT b FROM BlockedHash b")
  List<BlockedHash> getAll();

  /**
   * Retrieves only the hashes from the database.
   *
   * @return the hashes
   */
  @Query("SELECT b.hash FROM BlockedHash b")
  List<String> getHashes();
}
