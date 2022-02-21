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

package org.comixedproject.model.comicbooks;

import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.model.metadata.MetadataSource;

/**
 * <code>ComicMetadataSource</code> connects a {@link Comic} to the record containing its metadata
 * at a {@link ComicMetadataSource}.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ComicMetadataSources")
@NoArgsConstructor
@RequiredArgsConstructor
public class ComicMetadataSource {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @OneToOne
  @JoinColumn(name = "ComicId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private Comic comic;

  @ManyToOne
  @JoinColumn(name = "MetadataSourceId", nullable = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private MetadataSource metadataSource;

  @Column(name = "ReferenceId", length = 32, nullable = false, updatable = true)
  @Getter
  @Setter
  @NonNull
  private String referenceId;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicMetadataSource that = (ComicMetadataSource) o;
    return comic.equals(that.comic)
        && metadataSource.equals(that.metadataSource)
        && referenceId.equals(that.referenceId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comic, metadataSource, referenceId);
  }
}
