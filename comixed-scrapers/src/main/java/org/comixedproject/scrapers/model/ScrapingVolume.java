/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixedproject.scrapers.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>ComicVolume</code> represents a comic volume.
 *
 * @author Darryl L. Pierce
 */
public class ScrapingVolume {
  @JsonProperty(value = "id")
  @Getter
  @Setter
  private long id;

  @JsonProperty(value = "name")
  @Getter
  @Setter
  private String name;

  @JsonProperty(value = "issueCount")
  @Getter
  @Setter
  private int issueCount;

  @JsonProperty(value = "imageUrl")
  @Getter
  @Setter
  private String imageURL;

  @JsonProperty(value = "startYear")
  @Getter
  @Setter
  private String startYear;

  @JsonProperty(value = "publisher")
  @Getter
  @Setter
  private String publisher;

  @JsonProperty(value = "issue")
  @Getter
  @Setter
  private List<ScrapingIssue> comicIssue = new ArrayList<>();
}
