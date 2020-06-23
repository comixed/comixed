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

package org.comixed.scrapers.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

/**
 * <code>ComicVolume</code> represents a comic volume.
 *
 * @author Darryl L. Pierce
 */
public class ScrapingVolume {
  @JsonProperty(value = "id")
  private long id;

  @JsonProperty(value = "name")
  private String name;

  @JsonProperty(value = "issueCount")
  private int issueCount;

  @JsonProperty(value = "imageUrl")
  private String imageURL;

  @JsonProperty(value = "startYear")
  private String startYear;

  @JsonProperty(value = "publisher")
  private String publisher;

  @JsonProperty(value = "issue")
  private List<ScrapingIssue> comicIssue = new ArrayList<>();

  public long getId() {
    return this.id;
  }

  public String getImageURL() {
    return this.imageURL;
  }

  public int getIssueCount() {
    return this.issueCount;
  }

  public String getName() {
    return this.name;
  }

  public String getPublisher() {
    return this.publisher;
  }

  public String getStartYear() {
    return this.startYear != null ? this.startYear : "";
  }

  public void setId(long id) {
    this.id = id;
  }

  public void setImageURL(String imageURL) {
    this.imageURL = imageURL;
  }

  public void setIssueCount(int issueCount) {
    this.issueCount = issueCount;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void setPublisher(String publisher) {
    this.publisher = publisher;
  }

  public void setStartYear(String startYear) {
    this.startYear = startYear;
  }
}
