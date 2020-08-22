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

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GetComicsRequest {
  @JsonProperty("page")
  private int page;

  @JsonProperty("count")
  private int count;

  @JsonProperty("sortField")
  private String sortField;

  @JsonProperty("ascending")
  private boolean ascending;

  public GetComicsRequest() {}

  public GetComicsRequest(
      final int page, final int count, final String sortField, final boolean ascending) {
    this.page = page;
    this.count = count;
    this.sortField = sortField;
    this.ascending = ascending;
  }

  public int getPage() {
    return page;
  }

  public int getCount() {
    return count;
  }

  public String getSortField() {
    return sortField;
  }

  public boolean isAscending() {
    return ascending;
  }
}
