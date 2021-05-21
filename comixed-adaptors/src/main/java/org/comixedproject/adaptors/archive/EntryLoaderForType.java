/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import lombok.Getter;
import lombok.Setter;
import org.springframework.util.StringUtils;

/**
 * <code>EntryLoaderForType</code> describes a type entry for loading files from an archive or other
 * source.
 *
 * @author Darryl L. Pierce
 */
public class EntryLoaderForType {
  @Getter @Setter private String type;
  @Getter @Setter private String bean;
  @Getter @Setter private ArchiveEntryType entryType;

  public boolean isValid() {
    return !StringUtils.isEmpty(this.type)
        && !StringUtils.isEmpty(this.bean)
        && this.entryType != null;
  }
}
