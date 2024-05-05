/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.model.batch;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.*;

/**
 * <code>ComicBatch</code> groups together comic books for a batch process.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comic_batches")
@NoArgsConstructor
@RequiredArgsConstructor
public class ComicBatch {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "batch_name", length = 32, nullable = false, insertable = true, updatable = false)
  @Getter
  @NonNull
  private String name;

  @OneToMany(
      mappedBy = "batch",
      fetch = FetchType.EAGER,
      cascade = CascadeType.ALL,
      orphanRemoval = true)
  @Getter
  private List<ComicBatchEntry> entries = new ArrayList<>();

  @Column(name = "created_on", nullable = false, insertable = true, updatable = false)
  @Getter
  private Date createdOn = new Date();
}
