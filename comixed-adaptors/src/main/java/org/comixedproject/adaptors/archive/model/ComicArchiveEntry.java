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

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * <code>ArchiveEntry</code> represents a single entry in an archive.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class ComicArchiveEntry {
  @Getter private int index;
  @Getter private String filename;
  @Getter private long size;
  @Getter private String mimetype;
  @Getter private ArchiveEntryType archiveEntryType;
}
