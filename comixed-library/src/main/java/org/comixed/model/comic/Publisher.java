/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixed.model.comic;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import javax.persistence.*;

@Entity
@Table(name = "publishers")
public class Publisher {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  private Long id;

  @Column(name = "name", length = 256, updatable = true, nullable = false, unique = true)
  @JsonProperty("name")
  private String name;

  @Column(name = "comic_vine_id", length = 64, updatable = false, nullable = false, unique = true)
  @JsonProperty("comic_vine_id")
  private String comicVineId;

  @Column(name = "comic_vine_url", length = 256, updatable = true, nullable = false)
  @JsonProperty("comic_vine_url")
  private String comicVineUrl;

  @Lob
  @Column(name = "description")
  @JsonProperty("description")
  private String description;

  @Lob
  @Column(name = "thumbnail")
  @JsonIgnore
  private byte[] thumbnail;

  @Lob
  @Column(name = "logo")
  @JsonIgnore
  private byte[] logo;

  public Publisher() {}

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getComicVineId() {
    return comicVineId;
  }

  public void setComicVineId(String comicVineId) {
    this.comicVineId = comicVineId;
  }

  public String getComicVineUrl() {
    return comicVineUrl;
  }

  public void setComicVineUrl(String comicVineUrl) {
    this.comicVineUrl = comicVineUrl;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public byte[] getThumbnail() {
    return thumbnail;
  }

  public void setThumbnail(byte[] thumbnail) {
    this.thumbnail = thumbnail;
  }

  public byte[] getLogo() {
    return logo;
  }

  public void setLogo(byte[] logo) {
    this.logo = logo;
  }
}
