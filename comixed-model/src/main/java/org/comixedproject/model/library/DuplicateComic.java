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

package org.comixedproject.model.library;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.Date;
import lombok.Getter;
import org.comixedproject.views.View;

/**
 * <code>DuplicateComic</code> represents a single duplicate comic set in the library.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "duplicate_comics_view")
public class DuplicateComic {
  @EmbeddedId @Getter private DuplicateComicId id;

  @Column(name = "count")
  @JsonView(View.DuplicateComicListView.class)
  @Getter
  private int count;

  @Transient
  @JsonView(View.DuplicateComicListView.class)
  @JsonProperty("publisher")
  public String getPublisher() {
    return id.getPublisher();
  }

  @Transient
  @JsonView(View.DuplicateComicListView.class)
  @JsonProperty("series")
  public String getSeries() {
    return id.getSeries();
  }

  @Transient
  @JsonView(View.DuplicateComicListView.class)
  @JsonProperty("volume")
  public String getVolume() {
    return id.getVolume();
  }

  @Transient
  @JsonView(View.DuplicateComicListView.class)
  @JsonProperty("issueNumber")
  public String getIssueNumber() {
    return id.getIssueNumber();
  }

  @Transient
  @JsonView(View.DuplicateComicListView.class)
  @JsonProperty("coverDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  public Date getCoverDate() {
    return id.getCoverDate();
  }
}
