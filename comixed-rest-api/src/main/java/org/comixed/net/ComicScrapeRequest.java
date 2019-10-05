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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.net;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ComicScrapeRequest {
    @JsonProperty("comicId") private Long comicId;
    @JsonProperty("apiKey") private String apiKey;
    @JsonProperty("issueId") private String issueId;
    @JsonProperty("skipCache") private Boolean skipCache;

    public ComicScrapeRequest() {}

    public ComicScrapeRequest(final long comicId,
                              final String apiKey,
                              final String issueId,
                              final boolean skipCache) {
        this.comicId = comicId;
        this.apiKey = apiKey;
        this.issueId = issueId;
        this.skipCache = skipCache;
    }

    public Long getComicId() { return comicId; }

    public String getApiKey() { return apiKey; }

    public String getIssueId() { return issueId; }

    public Boolean getSkipCache() { return skipCache; }
}
