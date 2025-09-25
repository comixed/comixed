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

import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.util.Date;
import lombok.Getter;
import org.comixedproject.views.View;

/**
 * <code>DuplicateComicId</code> represents the unique id for a duplicate comic.
 *
 * @author Darryl L. Pierce
 */
@Embeddable
public class DuplicateComicId {
  @Column(name = "publisher")
  @JsonView(View.DuplicateComicListView.class)
  @Getter
  private String publisher;

  @Column(name = "series")
  @JsonView(View.DuplicateComicListView.class)
  @Getter
  private String series;

  @Column(name = "volume")
  @JsonView(View.DuplicateComicListView.class)
  @Getter
  private String volume;

  @Column(name = "issue_number")
  @JsonView(View.DuplicateComicListView.class)
  @Getter
  private String issueNumber;

  @Column(name = "cover_date")
  @JsonView(View.DuplicateComicListView.class)
  @Getter
  private Date coverDate;
}
