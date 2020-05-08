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

import com.fasterxml.jackson.annotation.JsonProperty;

public class GetVolumesRequest {
  @JsonProperty("apiKey")
  private String apiKey;

  @JsonProperty("series")
  private String series;

  @JsonProperty("skipCache")
  private Boolean skipCache;

  public GetVolumesRequest() {}

  public GetVolumesRequest(final String apiKey, final String series, final Boolean skipCache) {
    this.apiKey = apiKey;
    this.series = series;
    this.skipCache = skipCache;
  }

  public String getApiKey() {
    return apiKey;
  }

  public String getSeries() {
    return series;
  }

  public Boolean getSkipCache() {
    return skipCache;
  }
}
