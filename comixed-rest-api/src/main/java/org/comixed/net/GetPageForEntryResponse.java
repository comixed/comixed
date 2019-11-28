/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixed.net;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.views.View;

public class GetPageForEntryResponse {
  @JsonProperty("comics")
  @JsonView(View.ComicList.class)
  private List<Comic> comics;

  @JsonProperty("comicCount")
  @JsonView(View.ComicList.class)
  private int comicCount;

  public GetPageForEntryResponse() {}

  public GetPageForEntryResponse(final List<Comic> comics, final int comicCount) {
    this.comics = comics;
    this.comicCount = comicCount;
  }

  public List<Comic> getComics() {
    return comics;
  }

  public int getComicCount() {
    return comicCount;
  }
}
