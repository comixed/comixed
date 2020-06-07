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
import java.util.List;

public class RemoveComicsFromReadingListRequest {
  @JsonProperty("ids")
  private List<Long> ids;

  public RemoveComicsFromReadingListRequest() {}

  public RemoveComicsFromReadingListRequest(List<Long> ids) {
    this.ids = ids;
  }

  public List<Long> getIds() {
    return ids;
  }
}
