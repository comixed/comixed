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

package org.comixedproject.adaptors.archive.model;

import org.apache.commons.compress.archivers.sevenz.SevenZOutputFile;

/**
 * <code>Cb7ArchiveWriteHandle</code> provides an archive handle for writing to CB7 files.
 *
 * @author Darryl L. Pierce
 */
public class Cb7ArchiveWriteHandle extends AbstractArchiveWriteHandle<SevenZOutputFile> {
  public Cb7ArchiveWriteHandle(final SevenZOutputFile archiveHandle, final String filename) {
    super(archiveHandle, filename);
  }
}
