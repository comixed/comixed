/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.model.metadata;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>MetadataCacheEntry</code> represents a single entry in a cached set of data.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "metadata_cache_entries")
public class MetadataCacheEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "metadata_cache_id", updatable = false, nullable = false)
  @Getter
  @Setter
  private MetadataCache metadataCache;

  @Column(name = "entry_number", updatable = false, nullable = false)
  @Getter
  @Setter
  private Integer entryNumber;

  @Column(name = "entry_value", updatable = false, nullable = false)
  @Lob
  @Getter
  @Setter
  private String entryValue;
}
