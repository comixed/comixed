/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.model.comicfiles;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.comixedproject.views.View;

/**
 * <code>ComicFileGroup</code> holds a list of {@link ComicFile} instances that exist in the same
 * directory.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class ComicFileGroup {
  @JsonProperty("directory")
  @JsonView(View.ComicFileList.class)
  @NonNull
  @Getter
  private String directory;

  @JsonProperty("files")
  @JsonView(View.ComicFileList.class)
  @Getter
  private List<ComicFile> files = new ArrayList<>();
}
