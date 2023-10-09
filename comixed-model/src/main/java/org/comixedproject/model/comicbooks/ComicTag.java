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

package org.comixedproject.model.comicbooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.comixedproject.views.View;

/**
 * <code>ComicTag</code> represents a single tag for a comic book.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comic_tags")
@NoArgsConstructor
@RequiredArgsConstructor
public class ComicTag {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "comic_detail_id", insertable = true, nullable = false, updatable = false)
  @Getter
  @NonNull
  private ComicDetail comicDetail;

  @Column(name = "tag_type", insertable = true, nullable = false, updatable = false)
  @Enumerated(EnumType.STRING)
  @JsonProperty("type")
  @JsonView({View.ComicListView.class})
  @Getter
  @NonNull
  private ComicTagType type;

  @Column(name = "tag_value", length = 255, insertable = true, nullable = false, updatable = false)
  @JsonView({View.ComicListView.class})
  @JsonProperty("value")
  @Getter
  @NonNull
  private String value;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicTag comicTag = (ComicTag) o;
    return type == comicTag.type && value.equals(comicTag.value);
  }

  @Override
  public int hashCode() {
    return Objects.hash(type, value);
  }
}
