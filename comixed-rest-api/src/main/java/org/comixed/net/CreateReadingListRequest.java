/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixed.net;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CreateReadingListRequest {
  @JsonProperty("name")
  private String name;

  @JsonProperty("summary")
  private String summary;

  public CreateReadingListRequest() {}

  public CreateReadingListRequest(String name, String summary) {
    this.name = name;
    this.summary = summary;
  }

  public String getName() {
    return name;
  }

  public String getSummary() {
    return summary;
  }
}
