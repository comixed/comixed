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

import com.fasterxml.jackson.annotation.*;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>Credit</code> associates a name with a creative role for a single comic.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "Credits")
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
@NoArgsConstructor
@RequiredArgsConstructor
public class Credit {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  private Long id;

  @ManyToOne
  @JoinColumn(name = "ComicId")
  @JsonIgnore
  @Getter
  @NonNull
  private Comic comic;

  @Column(name = "Name")
  @JsonProperty("name")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  @NonNull
  private String name;

  @Column(name = "Role")
  @JsonProperty("role")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  @NonNull
  private String role;
}
