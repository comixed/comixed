/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.model.net.collections;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * <code>LoadPublisherListRequest</code> represents the request body when loading a page of
 * publishers.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class LoadPublisherListRequest {
  @JsonProperty("searchText")
  @Getter
  private String searchText;

  @JsonProperty("page")
  @Getter
  private int page;

  @JsonProperty("size")
  @Getter
  private int size;

  @JsonProperty("sortBy")
  @Getter
  private String sortBy;

  @JsonProperty("sortDirection")
  @Getter
  private String sortDirection;
}
