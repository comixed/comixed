/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.model.user;

import com.fasterxml.jackson.annotation.JsonView;
import javax.persistence.*;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.views.View.UserList;

@Entity
@Table(name = "bookmarks")
public class Bookmark {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private ComiXedUser user;

  @ManyToOne
  @JoinColumn(name = "comic_id", nullable = false, updatable = false)
  @JsonView(UserList.class)
  private Comic comic;

  @Column(name = "mark", updatable = true, nullable = false)
  @JsonView(UserList.class)
  private String mark;

  public Bookmark() {}

  public Bookmark(ComiXedUser user, Comic comic, String mark) {
    this.user = user;
    this.comic = comic;
    this.mark = mark;
  }

  public Comic getComic() {
    return comic;
  }

  public void setComic(Comic comic) {
    this.comic = comic;
  }

  public String getMark() {
    return mark;
  }

  public void setMark(String mark) {
    this.mark = mark;
  }
}
