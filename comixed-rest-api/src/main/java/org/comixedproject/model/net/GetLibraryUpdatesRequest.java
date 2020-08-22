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

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GetLibraryUpdatesRequest {
  @JsonProperty("timeout")
  private long timeout;

  @JsonProperty("maximumResults")
  private int maximumResults;

  @JsonProperty("lastProcessingCount")
  private int lastProcessingCount;

  @JsonProperty("lastRescanCount")
  private int lastRescanCount;

  public GetLibraryUpdatesRequest() {}

  public GetLibraryUpdatesRequest(final long timeout, final int maximumResults) {
    this.timeout = timeout;
    this.maximumResults = maximumResults;
  }

  public long getTimeout() {
    return timeout;
  }

  public void setTimeout(final long timeout) {
    this.timeout = timeout;
  }

  public int getMaximumResults() {
    return maximumResults;
  }

  public void setMaximumResults(final int maximumResults) {
    this.maximumResults = maximumResults;
  }

  public int getLastProcessingCount() {
    return lastProcessingCount;
  }

  public void setLastProcessingCount(final int lastProcessingCount) {
    this.lastProcessingCount = lastProcessingCount;
  }

  public int getLastRescanCount() {
    return lastRescanCount;
  }

  public void setLastRescanCount(final int lastRescanCount) {
    this.lastRescanCount = lastRescanCount;
  }
}
