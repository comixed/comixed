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
 * aLong with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.model.metadata;

import java.util.Date;
import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.comixedproject.model.comicbooks.Comic;

/**
 * <code>MetadataAuditLogEntry</code> represents a single auditable metadata event.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "MetadataAuditLogEntries")
@NoArgsConstructor
@RequiredArgsConstructor
public class MetadataAuditLogEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "ComicId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private Comic comic;

  @ManyToOne
  @JoinColumn(name = "MetadataSourceId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private MetadataSource metadataSource;

  @Column(name = "ReferenceId", length = 32, nullable = false, updatable = false)
  @Getter
  @NonNull
  private String referenceId;

  @Column(name = "CreatedOn", nullable = false, updatable = false)
  @Getter
  private Date createdOn = new Date();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final MetadataAuditLogEntry that = (MetadataAuditLogEntry) o;
    return comic.equals(that.comic)
        && metadataSource.equals(that.metadataSource)
        && referenceId.equals(that.referenceId)
        && createdOn.equals(that.createdOn);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comic, metadataSource, referenceId, createdOn);
  }
}
