/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.model.comicbooks;

import com.fasterxml.jackson.annotation.*;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>Credit</code> associates a name with a creative role for a single comicBook.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "Credits")
@NoArgsConstructor
@RequiredArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Credit {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({View.ComicListView.class})
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "ComicBookId", nullable = false, updatable = false)
  @JsonIgnore
  @Getter
  @NonNull
  private ComicBook comicBook;

  @Column(name = "Name", length = 255, nullable = false, updatable = false)
  @JsonProperty("name")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  @NonNull
  private String name;

  @Column(name = "Role", length = 255, nullable = false, updatable = false)
  @JsonProperty("role")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  @NonNull
  private String role;
}
