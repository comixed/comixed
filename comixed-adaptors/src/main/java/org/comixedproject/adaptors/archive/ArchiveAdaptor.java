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

package org.comixedproject.adaptors.archive;

import java.util.List;
import org.comixedproject.adaptors.archive.model.ArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.ArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.model.archives.ArchiveType;

/**
 * <code>ArchiveAdaptor</code> defines a type that can access the contents of an archive.
 *
 * @author Darryl L. Pierce
 */
public interface ArchiveAdaptor {
  /**
   * Identifies the underlying archive type.
   *
   * @return the archive type
   */
  ArchiveType getArchiveType();

  /**
   * Opens an archive for read operations.
   *
   * @param filename the archive filename
   * @return the archive handle
   * @throws ArchiveAdaptorException if the archive could not be opened
   */
  ArchiveReadHandle openArchiveForRead(String filename) throws ArchiveAdaptorException;

  /**
   * Closes an archive for read operations.
   *
   * @param archiveHandle the archive handle
   * @throws ArchiveAdaptorException if an error occurs
   */
  void closeArchiveForRead(ArchiveReadHandle archiveHandle) throws ArchiveAdaptorException;

  /**
   * Returns the list of entries in the archive.
   *
   * @param archiveHandle the archive handle
   * @return the entries
   * @throws ArchiveAdaptorException if an error occurs loading an entry
   */
  List<ComicArchiveEntry> getEntries(ArchiveReadHandle archiveHandle)
      throws ArchiveAdaptorException;

  /**
   * Returns the entry with the given filename.
   *
   * @param archiveHandle the archive handle
   * @param filename the entry filename
   * @return the entry content
   * @throws ArchiveAdaptorException if an error occurs loading the entry
   */
  byte[] readEntry(ArchiveReadHandle archiveHandle, String filename) throws ArchiveAdaptorException;

  /**
   * Opens an archive for write operations. Creates a new file or overwrites any existing file.
   *
   * @param filename the archive filename
   * @return the archive handle
   * @throws ArchiveAdaptorException if an error occurs
   */
  ArchiveWriteHandle openArchiveForWrite(String filename) throws ArchiveAdaptorException;

  /**
   * Adds a new entry to the archive.
   *
   * @param archiveHandle the archive handle
   * @param filename the entry filename
   * @param content the entry content
   * @throws ArchiveAdaptorException if an error occurs
   */
  void writeEntry(ArchiveWriteHandle archiveHandle, String filename, byte[] content)
      throws ArchiveAdaptorException;

  /**
   * Closes an archive for write operations.
   *
   * @param archiveHandle the archive handle
   * @throws ArchiveAdaptorException if an error occurs
   */
  void closeArchiveForWrite(ArchiveWriteHandle archiveHandle) throws ArchiveAdaptorException;
}
