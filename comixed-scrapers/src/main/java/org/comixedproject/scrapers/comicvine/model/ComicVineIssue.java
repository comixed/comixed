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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.Getter;

/**
 * <code>ComicVineIssue</code> represents a single issue.
 *
 * @author Darryl L. Pierce
 */
public class ComicVineIssue {
  @JsonProperty("id")
  @Getter
  private Long id;

  @JsonProperty("volume")
  @Getter
  private ComicVineVolume volume = new ComicVineVolume();

  @JsonProperty("issue_number")
  @Getter
  private String issueNumber;

  @JsonProperty("cover_date")
  @Getter
  private Date coverDate;

  @JsonProperty("name")
  @Getter
  private String title;

  @JsonProperty("description")
  @Getter
  private String description;

  @JsonProperty("image")
  @Getter
  private ComicVineImage image = new ComicVineImage();

  @JsonProperty("store_date")
  @Getter
  private String storeDate;

  @JsonProperty("character_credits")
  @Getter
  private List<ComicVineCharacter> characters = new ArrayList<>();

  @JsonProperty("team_credits")
  @Getter
  private List<ComicVineTeam> teams = new ArrayList<>();

  @JsonProperty("location_credits")
  @Getter
  private List<ComicVineLocation> locations = new ArrayList<>();

  @JsonProperty("story_arc_credits")
  @Getter
  private List<ComicVineStory> stories = new ArrayList<>();

  @JsonProperty("person_credits")
  @Getter
  private List<ComicVineCredit> people = new ArrayList<>();
}
