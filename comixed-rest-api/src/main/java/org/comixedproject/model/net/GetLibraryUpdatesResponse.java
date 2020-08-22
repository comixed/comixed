/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.views.View.ComicList;

public class GetLibraryUpdatesResponse {
  @JsonProperty("comics")
  @JsonView(ComicList.class)
  private List<Comic> comics;

  @JsonProperty("rescanCount")
  @JsonView(ComicList.class)
  private int rescanCount;

  @JsonProperty("processingCount")
  @JsonView(ComicList.class)
  private long processingCount;

  @JsonProperty("lastReadDates")
  @JsonView(ComicList.class)
  private List<LastReadDate> lastReadDates;

  public GetLibraryUpdatesResponse(
      List<Comic> comics, List<LastReadDate> lastReadDates, int rescanCount, long importCount) {
    this.comics = comics;
    this.lastReadDates = lastReadDates;
    this.rescanCount = rescanCount;
    this.processingCount = importCount;
  }

  public List<Comic> getComics() {
    return this.comics;
  }

  public long getProcessingCount() {
    return this.processingCount;
  }

  public int getRescanCount() {
    return this.rescanCount;
  }

  public List<LastReadDate> getLastReadDates() {
    return lastReadDates;
  }
}
