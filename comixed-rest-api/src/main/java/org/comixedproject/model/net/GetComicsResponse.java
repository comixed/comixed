/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.views.View;

public class GetComicsResponse {
  @JsonProperty("comics")
  @JsonView(View.ComicList.class)
  private List<Comic> comics;

  @JsonProperty("lastReadDates")
  @JsonView(View.ComicList.class)
  private List<LastReadDate> lastReadDates;

  @JsonProperty("lastUpdatedDate")
  @JsonView(View.ComicList.class)
  private Date latestUpdatedDate;

  @JsonProperty("comicCount")
  @JsonView(View.ComicList.class)
  private long comicCount;

  public GetComicsResponse() {}

  public GetComicsResponse(
      final List<Comic> comics,
      final List<LastReadDate> lastReadDates,
      final Date latestUpdatedDate,
      final long comicCount) {
    this.comics = comics;
    this.lastReadDates = lastReadDates;
    this.latestUpdatedDate = latestUpdatedDate;
    this.comicCount = comicCount;
  }

  public List<Comic> getComics() {
    return comics;
  }

  public List<LastReadDate> getLastReadDates() {
    return lastReadDates;
  }

  public Date getLatestUpdatedDate() {
    return latestUpdatedDate;
  }

  public long getComicCount() {
    return comicCount;
  }
}
