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
 * <code>AbstractArchiveWriteHandle</code> provides a foundation for creating {@link
 * ArchiveWriteHandle} types.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public abstract class AbstractArchiveWriteHandle<T> implements ArchiveWriteHandle {
  @Getter private T archiveHandle;
  @Getter private String filename;
}
