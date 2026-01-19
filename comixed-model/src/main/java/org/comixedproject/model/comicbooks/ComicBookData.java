/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

package org.comixedproject.model.comicbooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.views.View;

/**
 * <code>ComicBookData</code> represents the details of a comic book.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class ComicBookData {
  @JsonProperty("details")
  @JsonView(View.ComicDetailsView.class)
  @Getter
  private DisplayableComic details;

  @JsonProperty("pages")
  @JsonView(View.ComicDetailsView.class)
  @Getter
  private List<ComicPage> pages;

  @JsonProperty("metadata")
  @JsonView(View.ComicDetailsView.class)
  @Getter
  private ComicMetadataSource metadata;

  @JsonProperty("tags")
  @JsonView(View.ComicDetailsView.class)
  @Getter
  private List<ComicTag> tags;
}
