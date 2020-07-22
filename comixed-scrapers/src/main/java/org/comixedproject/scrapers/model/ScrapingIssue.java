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
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>ScrapingIssue</code> represents a single issue.
 *
 * @author Darryl L. Pierce
 */
public class ScrapingIssue {
  @JsonProperty(value = "id")
  @Getter
  @Setter
  private int id;

  @JsonProperty(value = "coverDate")
  @Getter
  @Setter
  private Date coverDate;

  @JsonProperty("storeDate")
  @Getter
  @Setter
  private String storeDate;

  @JsonProperty(value = "coverUrl")
  @Getter
  @Setter
  private String coverUrl;

  @JsonProperty(value = "issueNumber")
  @Getter
  @Setter
  private String issueNumber;

  @JsonProperty(value = "description")
  @Getter
  @Setter
  private String description;

  @JsonProperty(value = "name")
  @Getter
  @Setter
  private String name;

  @JsonProperty(value = "volumeName")
  @Getter
  @Setter
  private String volumeName;

  @JsonProperty(value = "volumeId")
  @Getter
  @Setter
  private int volumeId;
}
