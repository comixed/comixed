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

package org.comixedproject.model.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import javax.persistence.*;
import lombok.Getter;
import org.comixedproject.views.View.PageList;

/**
 * <code>BlockedPageHash</code> represents a single blocked page hash.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "blocked_page_hashes")
public class BlockedPageHash {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(PageList.class)
  @Getter
  private Long id;

  @Column(name = "hash", nullable = false, unique = true, length = 1024)
  @JsonProperty
  @JsonView(PageList.class)
  @Getter
  private String hash;

  public BlockedPageHash() {}

  public BlockedPageHash(String hash) {
    super();
    this.hash = hash;
  }
}
