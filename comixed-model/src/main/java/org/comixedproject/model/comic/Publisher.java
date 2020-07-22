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

package org.comixedproject.model.comic;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>Publisher</code> represents a single publisher of comics.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "publishers")
public class Publisher {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @Getter
  private Long id;

  @Column(name = "name", length = 256, updatable = true, nullable = false, unique = true)
  @JsonProperty("name")
  @Getter
  @Setter
  private String name;

  @Column(name = "comic_vine_id", length = 64, updatable = false, nullable = false, unique = true)
  @JsonProperty("comicVineId")
  @Getter
  @Setter
  private String comicVineId;

  @Column(name = "comic_vine_url", length = 256, updatable = true, nullable = false)
  @JsonProperty("comicVineUrl")
  @Getter
  @Setter
  private String comicVineUrl;

  @Lob
  @Column(name = "description")
  @JsonProperty("description")
  @Getter
  @Setter
  private String description;

  @Lob
  @Column(name = "thumbnail")
  @JsonIgnore
  @Getter
  @Setter
  private byte[] thumbnail;

  @Lob
  @Column(name = "logo")
  @JsonIgnore
  @Getter
  @Setter
  private byte[] logo;

  public Publisher() {}
}
