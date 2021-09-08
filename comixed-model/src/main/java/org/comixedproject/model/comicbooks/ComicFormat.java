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

package org.comixedproject.model.comicbooks;

import com.fasterxml.jackson.annotation.JsonView;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.comixedproject.views.View;

/**
 * <code>ComicFormat</code> represents the format for a single comic, such as a graphic novel, a
 * digest, manga or standard issue.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ComicFormats")
@NoArgsConstructor
public class ComicFormat {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({View.ComicFormatList.class, View.ComicDetailsView.class})
  @Getter
  private Long id;

  @Column(name = "Name", updatable = false, nullable = false)
  @JsonView({View.ComicFormatList.class, View.ComicDetailsView.class})
  @Getter
  private String name;
}
