/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.reader.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/**
 * <code>DirectoryEntry</code> represents the information for a single entry in a directory in the
 * library.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class DirectoryEntry {
  @JsonProperty("directoryId")
  @Getter
  private final String directoryId;

  @JsonProperty("title")
  @Getter
  @NonNull
  private String name;

  @JsonProperty("path")
  @Getter
  @NonNull
  private String path;

  @JsonProperty("filename")
  @Getter
  @Setter
  private String filename = "";

  @JsonProperty("fileSize")
  @Getter
  @Setter
  private Long fileSize = 0L;

  @JsonProperty("directory")
  @Getter
  @Setter
  private boolean directory = true;

  @JsonProperty("coverUrl")
  @Getter
  @Setter
  private String coverUrl;
}
