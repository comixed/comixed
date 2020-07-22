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

package org.comixedproject.model.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.views.View;

/**
 * <code>LastReadDate</code> holds the date and time for when a user last read a specific comic.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "user_last_read_dates")
public class LastReadDate {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView(View.UserDetails.class)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "comic_id", insertable = true, updatable = false, nullable = false)
  @JsonProperty("comic")
  @Getter
  @Setter
  private Comic comic;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = true, updatable = false, nullable = false)
  @Getter
  @Setter
  private ComiXedUser user;

  @Column(name = "last_read", insertable = true, updatable = false, nullable = false)
  @JsonProperty("lastRead")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.UserDetails.class, View.LibraryUpdate.class})
  @Getter
  @Setter
  private Date lastRead = new Date();

  @Column(name = "last_updated", nullable = false, updatable = true)
  @JsonProperty("lastUpdated")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.UserDetails.class, View.LibraryUpdate.class})
  @Getter
  @Setter
  private Date lastUpdated = new Date();

  @JsonProperty("comicId")
  @JsonView({View.UserDetails.class, View.LibraryUpdate.class})
  @Transient
  public Long getComicId() {
    return this.comic.getId();
  }
}
