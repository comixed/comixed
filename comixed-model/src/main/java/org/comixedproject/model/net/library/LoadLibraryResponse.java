/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.model.net.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.views.View;

/**
 * <code>LoadLibraryResponse</code> represents the response body for a request to load the library.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class LoadLibraryResponse {
  @JsonProperty("comicBooks")
  @JsonView(View.ComicListView.class)
  @Getter
  private List<ComicDetail> comicBooks;

  @JsonProperty("lastId")
  @JsonView(View.ComicListView.class)
  @Getter
  private long lastId;

  @JsonProperty("lastPayload")
  @JsonView(View.ComicListView.class)
  @Getter
  private boolean lastPayload;
}
