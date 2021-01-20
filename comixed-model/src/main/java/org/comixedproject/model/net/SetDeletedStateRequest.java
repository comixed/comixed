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

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class SetDeletedStateRequest {
  @JsonProperty("hashes")
  private List<String> hashes = new ArrayList<>();

  @JsonProperty("deleted")
  private Boolean deleted;

  public SetDeletedStateRequest(final List<String> hashes, final Boolean deleted) {
    this.hashes = hashes;
    this.deleted = deleted;
  }

  public List<String> getHashes() {
    return hashes;
  }

  public Boolean getDeleted() {
    return deleted;
  }
}
