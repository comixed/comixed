/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.model.collections;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/**
 * <code>Series</code> represents the details for a single series in the library.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class Series {
  @JsonProperty("publisher")
  @Getter
  @NonNull
  private String publisher;

  @JsonProperty("name")
  @Getter
  @NonNull
  private String name;

  @JsonProperty("volume")
  @Getter
  @NonNull
  private String volume;

  @JsonProperty("inLibrary")
  @Getter
  @Setter
  @NonNull
  private Long inLibrary;

  @JsonProperty("totalIssues")
  @Getter
  @Setter
  private Long totalIssues = 0L;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final Series series = (Series) o;
    return Objects.equals(publisher, series.publisher)
        && Objects.equals(name, series.name)
        && Objects.equals(volume, series.volume)
        && Objects.equals(inLibrary, series.inLibrary);
  }

  @Override
  public int hashCode() {
    return Objects.hash(publisher, name, volume, inLibrary);
  }
}
