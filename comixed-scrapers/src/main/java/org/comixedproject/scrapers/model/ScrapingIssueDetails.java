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
import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>ScrapingIssueDetails</code> represents all the details for an issue.
 *
 * @author Darryl L. Pierce
 */
public class ScrapingIssueDetails {
  @JsonProperty("publisher")
  @Getter
  @Setter
  private String publisher;

  @JsonProperty("series")
  @Getter
  @Setter
  private String series;

  @JsonProperty("volume")
  @Getter
  @Setter
  private String volume;

  @JsonProperty("issueNumber")
  @Getter
  @Setter
  private String issueNumber;

  @JsonProperty("coverDate")
  @Getter
  @Setter
  private Date coverDate;

  @JsonProperty("title")
  @Getter
  @Setter
  private String title;

  @JsonProperty("description")
  @Getter
  @Setter
  private String description;

  @JsonProperty("character_credits")
  @Getter
  @Setter
  private List<String> characters = new ArrayList<>();

  @JsonProperty("team_credits")
  @Getter
  @Setter
  private List<String> teams = new ArrayList<>();

  @JsonProperty("location_credits")
  @Getter
  @Setter
  private List<String> locations = new ArrayList<>();

  @JsonProperty("story_arc_credits")
  @Getter
  @Setter
  private List<String> stories = new ArrayList<>();

  @JsonProperty("credits")
  @Getter
  @Setter
  private List<CreditEntry> credits = new ArrayList<>();

  @AllArgsConstructor
  public static class CreditEntry {
    @Getter @Setter private final String name;
    @Getter @Setter private final String role;
  }
}
