/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.views.View;
import org.hibernate.annotations.Formula;

/**
 * <code>BlockedHash</code> represents a type of page that can be automatically marked for deletion.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "BlockedHashes")
@NoArgsConstructor
@RequiredArgsConstructor
public class BlockedHash {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.BlockedHashList.class)
  @Getter
  private Long id;

  @Column(name = "Label", nullable = true, updatable = true, length = 128)
  @JsonProperty("label")
  @JsonView(View.BlockedHashList.class)
  @Getter
  @Setter
  @NonNull
  private String label;

  @Column(name = "Hash", nullable = false, unique = true, updatable = false, length = 32)
  @JsonProperty("hash")
  @JsonView(View.BlockedHashList.class)
  @Getter
  @NonNull
  private String hash;

  @Column(name = "Snapshot", nullable = true, updatable = false)
  @Lob
  @JsonProperty("snapshot")
  @Getter
  @NonNull
  private String snapshot;

  @Column(name = "CreatedOn", nullable = false, updatable = false)
  @JsonProperty("createdOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView(View.BlockedHashList.class)
  @Getter
  private Date createdOn = new Date();

  @Formula(
      "(SELECT COUNT(*) FROM Comics c WHERE c.id IN (SELECT p.ComicId FROM Pages p WHERE p.FileHash = hash))")
  @JsonProperty("comicCount")
  @JsonView(View.BlockedHashList.class)
  @Getter
  private Integer comicCount;

  @Override
  public int hashCode() {
    return Objects.hash(label, hash);
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final BlockedHash that = (BlockedHash) o;
    return Objects.equals(label, that.label) && Objects.equals(hash, that.hash);
  }
}
