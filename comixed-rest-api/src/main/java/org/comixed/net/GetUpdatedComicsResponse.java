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

package org.comixed.net;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.model.user.LastReadDate;
import org.comixed.views.View;

public class GetUpdatedComicsResponse {
  @JsonProperty("comics")
  @JsonView(View.ComicList.class)
  private List<Comic> comics;

  @JsonProperty("lastComicId")
  @JsonView(View.ComicList.class)
  private Long lastComicId;

  @JsonProperty("mostRecentUpdate")
  @JsonView(View.ComicList.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Date mostRecentUpdate;

  @JsonProperty("lastReadDates")
  @JsonView(View.ComicList.class)
  private List<LastReadDate> lastReadDates;

  @JsonProperty("moreUpdates")
  @JsonView(View.ComicList.class)
  private boolean moreUpdates;

  @JsonProperty("processingCount")
  @JsonView(View.ComicList.class)
  private long processingCount;

  public GetUpdatedComicsResponse() {}

  public GetUpdatedComicsResponse(
      List<Comic> comics,
      Long lastComicId,
      Date mostRecentUpdate,
      List<LastReadDate> lastReadDates,
      boolean moreUpdates,
      long processingCount) {
    this.comics = comics;
    this.lastComicId = lastComicId;
    this.mostRecentUpdate = mostRecentUpdate;
    this.lastReadDates = lastReadDates;
    this.moreUpdates = moreUpdates;
    this.processingCount = processingCount;
  }

  public List<Comic> getComics() {
    return comics;
  }

  public Long getLastComicId() {
    return lastComicId;
  }

  public Date getMostRecentUpdate() {
    return mostRecentUpdate;
  }

  public List<LastReadDate> getLastReadDates() {
    return lastReadDates;
  }

  public boolean hasMoreUpdates() {
    return moreUpdates;
  }

  public long getProcessingCount() {
    return processingCount;
  }
}
