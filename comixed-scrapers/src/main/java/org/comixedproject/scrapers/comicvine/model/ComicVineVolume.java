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
import lombok.Setter;

/**
 * <code>ComicVineVolume</code> represents a single volume.
 *
 * @author Darryl L. Pierce
 */
public class ComicVineVolume {
  @JsonProperty("id")
  @Getter
  @Setter
  private Integer id;

  @JsonProperty("count_of_issues")
  @Getter
  @Setter
  private Integer issueCount;

  @JsonProperty("name")
  @Getter
  @Setter
  private String name;

  @JsonProperty("publisher")
  @Getter
  @Setter
  private ComicVinePublisher publisher = new ComicVinePublisher();

  @JsonProperty("start_year")
  @Getter
  @Setter
  private String startYear;

  @JsonProperty("image")
  @Getter
  @Setter
  private ComicVineImage image = new ComicVineImage();

  @JsonProperty("api_detail_url")
  @Getter
  @Setter
  private String detailUrl;

  @JsonProperty("resource_type")
  @Getter
  private String resourceType;
}
