/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.model.page;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.comixedproject.views.View.ComicListView;
import org.comixedproject.views.View.PageList;

/**
 * <code>PageType</code> describes the type of a {@link Page}. For example a page may be the front
 * cover, a letters page, or a story page.
 *
 * @author The ComiXed Project
 */
@Entity
@Table(name = "page_types")
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
@NoArgsConstructor
public class PageType {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({ComicListView.class, PageList.class})
  private Long id;

  @Column(name = "name", updatable = false, nullable = false)
  @JsonView({ComicListView.class, PageList.class})
  @Getter
  private String name;
}
