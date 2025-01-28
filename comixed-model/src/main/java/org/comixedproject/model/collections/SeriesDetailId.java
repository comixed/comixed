/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * <code>SeriesDetailId</code> represents the composite id for a {@link SeriesDetail}.
 *
 * @author Darryl L. Pierce
 */
@Embeddable
@NoArgsConstructor
@RequiredArgsConstructor
public class SeriesDetailId {
  @Column(name = "publisher")
  @Getter
  @NonNull
  private String publisher;

  @Column(name = "series")
  @Getter
  @NonNull
  private String series;

  @Column(name = "volume")
  @Getter
  @NonNull
  private String volume;

  @Override
  public boolean equals(final Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    final SeriesDetailId that = (SeriesDetailId) o;
    return Objects.equals(publisher, that.publisher)
        && Objects.equals(series, that.series)
        && Objects.equals(volume, that.volume);
  }

  @Override
  public int hashCode() {
    return Objects.hash(publisher, series, volume);
  }

  @Override
  public String toString() {
    return "SeriesDetailId{"
        + "publisher='"
        + publisher
        + '\''
        + ", series='"
        + series
        + '\''
        + ", volume='"
        + volume
        + '\''
        + '}';
  }
}
