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
 * <code>RemoteLibraryState</code> contains a snapshot of the state of the library.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class RemoteLibraryState {
  @JsonProperty("totalComics")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  private final long totalComics;

  @JsonProperty("unscrapedComics")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  private final long unscrapedComics;

  @JsonProperty("deletedComics")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  private final long deletedComics;

  @JsonProperty("publishers")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<RemoteLibrarySegmentState> publishers;

  @JsonProperty("series")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<RemoteLibrarySegmentState> series;

  @JsonProperty("characters")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<RemoteLibrarySegmentState> characters;

  @JsonProperty("teams")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<RemoteLibrarySegmentState> teams;

  @JsonProperty("locations")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<RemoteLibrarySegmentState> locations;

  @JsonProperty("stories")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<RemoteLibrarySegmentState> stories;

  @JsonProperty("states")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<RemoteLibrarySegmentState> states;

  @JsonProperty("byPublisherAndYear")
  @JsonView(View.RemoteLibraryState.class)
  @Getter
  @Setter
  private List<PublisherAndYearSegment> byPublisherAndYear;
}
