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

package org.comixedproject.model.archives;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * <code>ArchiveType</code> reports the archive type detected for a file.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public enum ArchiveType {
  CBZ("ZIP ComicBook", "application/vnc.comicbook+zip", "cbz"),
  CBR("RAR ComicBook", "application/vnc.comicbook+rar", "cbr"),
  CB7("7Z ComicBook", "application/vnc.comicbook+octet-stream", "cb7");

  @Getter private String name;

  @Getter private String mimeType;

  @Getter private String extension;

  public static ArchiveType forValue(String name) {
    for (ArchiveType value : values()) {
      if (value.toString().equals(name)) return value;
    }

    throw new IllegalArgumentException("No such archive type: " + name);
  }

  @Override
  public String toString() {
    return this.name;
  }
}
