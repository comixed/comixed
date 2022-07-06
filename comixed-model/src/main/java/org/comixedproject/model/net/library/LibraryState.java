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

package org.comixedproject.model.net.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>LibraryState</code> contains a snapshot of the state of the library.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class LibraryState {
  @JsonProperty("totalComics")
  @JsonView(View.LibraryState.class)
  @Getter
  private final long totalComics;

  @JsonProperty("deletedComics")
  @JsonView(View.LibraryState.class)
  @Getter
  private final long deletedComics;

  @JsonProperty("publishers")
  @JsonView(View.LibraryState.class)
  @Getter
  @Setter
  private List<LibrarySegmentState> publishers;

  @JsonProperty("series")
  @JsonView(View.LibraryState.class)
  @Getter
  @Setter
  private List<LibrarySegmentState> series;

  @JsonProperty("characters")
  @JsonView(View.LibraryState.class)
  @Getter
  @Setter
  private List<LibrarySegmentState> characters;

  @JsonProperty("teams")
  @JsonView(View.LibraryState.class)
  @Getter
  @Setter
  private List<LibrarySegmentState> teams;

  @JsonProperty("locations")
  @JsonView(View.LibraryState.class)
  @Getter
  @Setter
  private List<LibrarySegmentState> locations;

  @JsonProperty("stories")
  @JsonView(View.LibraryState.class)
  @Getter
  @Setter
  private List<LibrarySegmentState> stories;

  @JsonProperty("states")
  @JsonView(View.LibraryState.class)
  @Getter
  @Setter
  private List<LibrarySegmentState> states;
}
