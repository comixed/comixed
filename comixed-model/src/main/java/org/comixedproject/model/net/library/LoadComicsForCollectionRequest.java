/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.model.net.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.comixedproject.model.comicbooks.ComicTagType;

/**
 * <code>LoadComicsForCollectionRequest</code> represents a request to load comics for collection.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
public class LoadComicsForCollectionRequest {
  @JsonProperty("pageSize")
  @Getter
  private int pageSize;

  @JsonProperty("pageIndex")
  @Getter
  private int pageIndex;

  @JsonProperty("tagType")
  @Getter
  private ComicTagType tagType;

  @JsonProperty("tagValue")
  @Getter
  private String tagValue;

  @JsonProperty("sortBy")
  @Getter
  private String sortBy;

  @JsonProperty("sortDirection")
  @Getter
  private String sortDirection;

  @Override
  public String toString() {
    return "LoadComicsForCollectionRequest{"
        + "pageSize="
        + pageSize
        + ", pageIndex="
        + pageIndex
        + ", tagType='"
        + tagType
        + '\''
        + ", tagValue='"
        + tagValue
        + '\''
        + ", sortBy='"
        + sortBy
        + '\''
        + ", sortDirection='"
        + sortDirection
        + '\''
        + '}';
  }
}