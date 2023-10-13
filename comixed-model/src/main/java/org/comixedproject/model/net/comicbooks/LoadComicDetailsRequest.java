/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

package org.comixedproject.model.net.comicbooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;

/**
 * <code>LoadComicDetailsRequest</code> represents the request body when loading a page worth of
 * comics.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
public class LoadComicDetailsRequest {
  @JsonProperty("pageSize")
  @Getter
  private int pageSize;

  @JsonProperty("pageIndex")
  @Getter
  private int pageIndex;

  @JsonProperty("coverYear")
  @Getter
  private Integer coverYear;

  @JsonProperty("coverMonth")
  @Getter
  private Integer coverMonth;

  @JsonProperty("archiveType")
  @Getter
  private ArchiveType archiveType;

  @JsonProperty("comicType")
  @Getter
  private ComicType comicType;

  @JsonProperty("comicState")
  @Getter
  private ComicState comicState;

  @JsonProperty("readState")
  @Getter
  private Boolean readState;

  @JsonProperty("unscrapedState")
  @Getter
  private Boolean unscrapedState;

  @JsonProperty("searchText")
  @Getter
  private String searchText;

  @JsonProperty("sortBy")
  @Getter
  private String sortBy;

  @JsonProperty("sortDirection")
  @Getter
  private String sortDirection;

  @Override
  public String toString() {
    return "LoadComicDetailsRequest{"
        + "pageSize="
        + pageSize
        + ", pageIndex="
        + pageIndex
        + ", coverYear="
        + coverYear
        + ", coverMonth="
        + coverMonth
        + ", archiveType="
        + archiveType
        + ", comicType="
        + comicType
        + ", comicState="
        + comicState
        + ", readState="
        + readState
        + ", unscrapedState="
        + unscrapedState
        + ", searchText='"
        + searchText
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
