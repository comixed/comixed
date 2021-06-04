/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>ComicFileDetails</code> holds the physical details of the comic file.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ComicFileDetails")
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
public class ComicFileDetails {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  private Long id;

  @OneToOne
  @JoinColumn(name = "ComicId", nullable = false, updatable = false)
  @Getter
  @Setter
  private Comic comic;

  @Column(name = "FileHash", length = 32, nullable = false, updatable = true)
  @JsonProperty("hash")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String hash;
}
