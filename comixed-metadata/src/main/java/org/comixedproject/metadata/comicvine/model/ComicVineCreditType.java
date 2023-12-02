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

package org.comixedproject.metadata.comicvine.model;

import java.util.Arrays;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.comixedproject.model.comicbooks.ComicTagType;

/**
 * <code>ComicVineCreditType</code> maps a ComicVine credit type to a {@link ComicTagType}.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public enum ComicVineCreditType {
  WRITER("writer", ComicTagType.WRITER),
  EDITOR("editor", ComicTagType.EDITOR),
  PENCILLER("penciler", ComicTagType.PENCILLER),
  INKER("inker", ComicTagType.INKER),
  COLORIST("colorist", ComicTagType.COLORIST),
  LETTERER("letterer", ComicTagType.LETTERER),
  COVER("cover", ComicTagType.COVER),
  OTHER("other", ComicTagType.OTHER);

  @Getter private String tagValue;
  @Getter private ComicTagType tagType;

  public static ComicVineCreditType forValue(final String value) {
    final Optional<ComicVineCreditType> result =
        Arrays.stream(ComicVineCreditType.values())
            .filter(tag -> tag.getTagValue().equals(value))
            .findFirst();
    return (result.isPresent()) ? result.get() : OTHER;
  }
}
