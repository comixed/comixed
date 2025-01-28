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
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Objects;
import lombok.*;

/**
 * <code>SeriesDetail</code> represents the details for a single series in the library.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "series_details_view")
@NoArgsConstructor
@RequiredArgsConstructor
public class SeriesDetail {
  @EmbeddedId @Getter @NonNull private SeriesDetailId id;

  @Column(name = "in_library")
  @JsonProperty("inLibrary")
  @Getter
  @Setter
  @NonNull
  private Long inLibrary;

  @Column(name = "issue_count")
  @JsonProperty("totalIssues")
  @Getter
  @Setter
  private Long totalIssues = 0L;

  @JsonProperty("publisher")
  public String getPublisher() {
    return this.id.getPublisher();
  }

  @JsonProperty("name")
  public String getName() {
    return this.id.getSeries();
  }

  @JsonProperty("volume")
  public String getVolume() {
    return this.id.getVolume();
  }

  @Override
  public boolean equals(final Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    final SeriesDetail that = (SeriesDetail) o;
    return Objects.equals(id, that.id)
        && Objects.equals(inLibrary, that.inLibrary)
        && Objects.equals(totalIssues, that.totalIssues);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, inLibrary, totalIssues);
  }

  @Override
  public String toString() {
    return "SeriesDetail{"
        + "id="
        + id
        + ", inLibrary="
        + inLibrary
        + ", totalIssues="
        + totalIssues
        + '}';
  }
}
