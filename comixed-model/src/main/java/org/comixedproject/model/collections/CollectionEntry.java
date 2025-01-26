/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.views.View;

/**
 * <code>CollectionEntry</code> represents a single entry in a collection list.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "collections_view")
@JsonView(View.CollectionEntryList.class)
@NoArgsConstructor
public class CollectionEntry {
  @EmbeddedId @Getter private CollectionEntryId id;

  @Column(name = "comic_count")
  @JsonProperty("comicCount")
  @Getter
  private long comicCount;

  public ComicTagType getTagType() {
    return id.getTagType();
  }

  public String getTagValue() {
    return id.getTagValue();
  }

  @Override
  public boolean equals(final Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    final CollectionEntry that = (CollectionEntry) o;
    return getComicCount() == that.getComicCount()
        && getTagType() == that.getTagType()
        && Objects.equals(getTagValue(), that.getTagValue());
  }

  @Override
  public int hashCode() {
    return Objects.hash(getTagType(), getTagValue(), getComicCount());
  }
}
