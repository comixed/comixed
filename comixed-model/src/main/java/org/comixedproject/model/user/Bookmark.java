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
import lombok.*;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.views.View;

/**
 * <code>Bookmark</code> represents the last read position for a comic by a user.
 *
 * @author Joao Franca
 */
@Entity
@Table(name = "Bookmarks")
@NoArgsConstructor
@RequiredArgsConstructor
public class Bookmark {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "UserId")
  @Getter
  @NonNull
  private ComiXedUser user;

  @ManyToOne
  @JoinColumn(name = "ComicId", nullable = false, updatable = false)
  @JsonView(View.UserDetailsView.class)
  @Getter
  @NonNull
  private Comic comic;

  @Column(name = "Mark", updatable = true, nullable = false)
  @JsonView(View.UserDetailsView.class)
  @Getter
  @Setter
  @NonNull
  private String mark;
}
