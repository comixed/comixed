/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.comicvine.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

/**
 * <code>AbstractComicVineQueryResponse</code> provides the common fields for all query results
 * returned from ComicVine.
 *
 * @author Darryl L. Pierce
 */
public abstract class AbstractComicVineQueryResponse {
  @JsonProperty("error")
  @Getter
  private String error;

  @JsonProperty("limit")
  @Getter
  private Integer limit;

  @JsonProperty("offset")
  @Getter
  private Integer offset;

  @JsonProperty("number_of_page_results")
  @Getter
  private Integer numberOfPageResults;

  @JsonProperty("number_of_total_results")
  @Getter
  private Integer numberOfTotalResults;

  @JsonProperty("status_code")
  @Getter
  private Integer statusCode;

  @JsonProperty("version")
  @Getter
  private String version;
}
