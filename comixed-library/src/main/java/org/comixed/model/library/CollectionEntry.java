/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixed.model.library;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CollectionEntry {
  @JsonProperty("name")
  private String name;

  @JsonProperty("comicCount")
  private int comicCount;

  public CollectionEntry() {}

  public CollectionEntry(final String name, final int comicCount) {
    this.name = name;
    this.comicCount = comicCount;
  }

  public String getName() {
    return name;
  }

  public int getComicCount() {
    return comicCount;
  }
}
