/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.model.net.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.comixedproject.views.View;

/**
 * <code>MetadataUpdateProcessUpdate</code> is the payload sent to the browser when a metadata
 * process batch update occurs.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class MetadataUpdateProcessUpdate {
  @JsonProperty("active")
  @JsonView(View.MetadataUpdateProcessState.class)
  @Getter
  private boolean active;

  @JsonProperty("totalComics")
  @JsonView(View.MetadataUpdateProcessState.class)
  @Getter
  private long totalComics;

  @JsonProperty("completedComics")
  @JsonView(View.MetadataUpdateProcessState.class)
  @Getter
  private long completedComics;
}
