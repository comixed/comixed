/*
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.model.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.*;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.views.View;

/**
 * <code>DuplicatePage</code> represents a page that appears in more than one comic.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "duplicate_pages_view")
@RequiredArgsConstructor
@NoArgsConstructor
public class DuplicatePage {
  @Id
  @Column(name = "file_hash")
  @JsonProperty("hash")
  @JsonView(View.DuplicatePageList.class)
  @NonNull
  @Getter
  private String hash;

  @Column(name = "comic_count")
  @JsonProperty("comicCount")
  @JsonView(View.DuplicatePageList.class)
  @Getter
  private Long comicCount;

  @Transient
  @JsonView(View.DuplicatePageList.class)
  @Getter
  @Setter
  private Set<ComicDetail> comics = new HashSet<>();

  @Override
  public boolean equals(final Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    final DuplicatePage that = (DuplicatePage) o;
    return Objects.equals(getHash(), that.getHash());
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(getHash());
  }
}
