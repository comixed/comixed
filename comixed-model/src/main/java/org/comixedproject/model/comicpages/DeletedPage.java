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

package org.comixedproject.model.comicpages;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

/**
 * <code>DeletedPage</code> represents a single deleted page entry.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class DeletedPage {
  @JsonProperty("hash")
  @Getter
  @NonNull
  private String hash;

  @JsonProperty("comicCount")
  @Getter
  @NonNull
  private Long comicCount;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final DeletedPage that = (DeletedPage) o;
    return hash.equals(that.hash) && comicCount.equals(that.comicCount);
  }

  @Override
  public int hashCode() {
    return Objects.hash(hash, comicCount);
  }
}
