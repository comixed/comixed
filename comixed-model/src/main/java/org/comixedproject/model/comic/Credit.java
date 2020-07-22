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

package org.comixedproject.model.comic;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View.ComicList;

/**
 * <code>Credit</code> associates a name with a creative role for a single comic.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comic_credits")
public class Credit {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView(ComicList.class)
  private Long id;

  @Column(name = "name")
  @JsonProperty("name")
  @JsonView(ComicList.class)
  @Getter
  @Setter
  private String name;

  @Column(name = "role")
  @JsonProperty("role")
  @JsonView(ComicList.class)
  @Getter
  @Setter
  private String role;

  @ManyToOne
  @JoinColumn(name = "comic_id")
  @JsonIgnore
  @Getter
  private Comic comic;

  public Credit() {}

  public Credit(final Comic comic, final String name, final String role) {
    this.comic = comic;
    this.name = name;
    this.role = role;
  }
}
