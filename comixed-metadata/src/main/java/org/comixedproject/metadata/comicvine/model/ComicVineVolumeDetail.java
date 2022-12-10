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

package org.comixedproject.metadata.comicvine.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Objects;
import lombok.Getter;

/**
 * <code>ComicVineVolumeDetail</code> contains the details returned when retrieving a single volume.
 *
 * @author Darryl L. Pierce
 */
public class ComicVineVolumeDetail {
  @JsonProperty("issues")
  @Getter
  private List<ComicVineIssue> issues;

  @JsonProperty("publisher")
  @Getter
  private ComicVinePublisher publisher;

  @JsonProperty("name")
  @Getter
  private String name;

  @JsonProperty("start_year")
  @Getter
  private String startYear;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicVineVolumeDetail that = (ComicVineVolumeDetail) o;
    return Objects.equals(issues, that.issues)
        && Objects.equals(publisher, that.publisher)
        && Objects.equals(name, that.name)
        && Objects.equals(startYear, that.startYear);
  }

  @Override
  public int hashCode() {
    return Objects.hash(issues, publisher, name, startYear);
  }
}
