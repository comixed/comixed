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
import org.comixedproject.model.comicbooks.ComicDetail;

/**
 * <code>LoadComicDetailsForTagRequest</code> represents the payload when loading {@link
 * ComicDetail} records that are unread by a user.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
public class LoadUnreadComicDetailsRequest {
  @JsonProperty("pageSize")
  @Getter
  private int pageSize;

  @JsonProperty("pageIndex")
  @Getter
  private int pageIndex;

  @JsonProperty("sortBy")
  @Getter
  private String sortBy;

  @JsonProperty("sortDirection")
  @Getter
  private String sortDirection;
}
