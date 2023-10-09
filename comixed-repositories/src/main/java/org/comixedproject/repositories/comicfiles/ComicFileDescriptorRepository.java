/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.repositories.comicfiles;

import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ComicFileDescriptorRepository</code> provides persistence methods for instances of {@link
 * ComicFileDescriptor}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ComicFileDescriptorRepository extends JpaRepository<ComicFileDescriptor, Long> {
  /**
   * Returns the record with the given filename.
   *
   * @param filename the filename
   * @return the record
   */
  @Query("SELECT d FROM ComicFileDescriptor d WHERE d.filename = :filename")
  ComicFileDescriptor findByFilename(@Param("filename") String filename);
}
