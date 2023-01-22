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

package org.comixedproject.model.comicbooks;

import java.util.Arrays;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * <code>ComicTagType</code> defines the types of collections.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public enum ComicTagType {
  CHARACTER("character", "CHARACTER"),
  TEAM("team", "TEAM"),
  LOCATION("location", "LOCATION"),
  STORY("story", "STORIE"),
  WRITER("writer", "WRITER"),
  EDITOR("editor", "EDITOR"),
  PENCILLER("penciller", "PENCILLER"),
  INKER("inker", "INKER"),
  COLORIST("colorist", "COLORIST"),
  LETERRER("leterrer", "LETERRER"),
  COVER("cover", "COVER");

  @Getter private String value;
  @Getter private String opdsValue;

  public static ComicTagType forValue(final String value) {
    final Optional<ComicTagType> result =
        Arrays.stream(ComicTagType.values())
            .filter(tag -> tag.getValue().equals(value))
            .findFirst();
    return (result.isPresent()) ? result.get() : null;
  }
}
