/*
 * ComiXed - A digital comicBook book library management application.
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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.views.View;

/**
 * <code>ComicMetadataSource</code> connects a {@link ComicBook} to the record containing its
 * metadata at a {@link ComicMetadataSource}.
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
  @JoinColumn(name = "ComicBookId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private ComicBook comicBook;

  @ManyToOne
  @JoinColumn(name = "MetadataSourceId", nullable = false, updatable = false)
  @JsonProperty("metadataSource")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  @NonNull
  private MetadataSource metadataSource;

  @Column(name = "ReferenceId", length = 32, nullable = false, updatable = true)
  @JsonProperty("referenceId")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  @NonNull
  private String referenceId;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicMetadataSource that = (ComicMetadataSource) o;
    return comicBook.equals(that.comicBook)
        && metadataSource.equals(that.metadataSource)
        && referenceId.equals(that.referenceId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comicBook, metadataSource, referenceId);
  }
}
