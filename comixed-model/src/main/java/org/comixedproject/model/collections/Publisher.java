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

/**
 * <code>Publisher</code> represents the details for a single publisher in the library.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class Publisher {
  @JsonProperty("name")
  @NonNull
  @Getter
  private String name;

  @JsonProperty("seriesCount")
  @NonNull
  @Getter
  private Long seriesCount;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final Publisher publisher = (Publisher) o;
    return name.equals(publisher.name) && seriesCount.equals(publisher.seriesCount);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, seriesCount);
  }
}
