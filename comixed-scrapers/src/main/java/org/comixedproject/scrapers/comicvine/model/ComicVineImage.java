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
 * <code>ComciVineImage</code> represents the set of image URLs returned with a ComicVine query.
 *
 * @author Darryl L. Pierce
 */
public class ComicVineImage {
  @JsonProperty("icon_url")
  @Getter
  @Setter
  private String iconUrl;

  @JsonProperty("medium_url")
  @Getter
  @Setter
  private String mediumUrl;

  @JsonProperty("screen_url")
  @Getter
  @Setter
  private String screenUrl;

  @JsonProperty("screen_large_url")
  @Getter
  @Setter
  private String screenLargeUrl;

  @JsonProperty("small_url")
  @Getter
  @Setter
  private String smallUrl;

  @JsonProperty("super_url")
  @Getter
  @Setter
  private String superUrl;

  @JsonProperty("thumb_url")
  @Getter
  @Setter
  private String thumbUrl;

  @JsonProperty("tiny_url")
  @Getter
  @Setter
  private String tinyUrl;

  @JsonProperty("original_url")
  @Getter
  @Setter
  private String originalUrl;

  @JsonProperty("image_tags")
  @Getter
  @Setter
  private String imageTags;
}
