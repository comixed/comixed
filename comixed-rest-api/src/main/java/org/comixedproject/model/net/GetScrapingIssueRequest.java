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

public class GetScrapingIssueRequest {
  @JsonProperty("apiKey")
  private String apiKey;

  @JsonProperty("skipCache")
  private boolean skipCache;

  @JsonProperty("issueNumber")
  private String issueNumber;

  public GetScrapingIssueRequest() {}

  public GetScrapingIssueRequest(
      final String apiKey, final boolean skipCache, final String issueNumber) {
    this.apiKey = apiKey;
    this.skipCache = skipCache;
    this.issueNumber = issueNumber;
  }

  public String getApiKey() {
    return apiKey;
  }

  public boolean isSkipCache() {
    return skipCache;
  }

  public String getIssueNumber() {
    return issueNumber;
  }
}
