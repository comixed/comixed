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

package org.comixedproject.model.messaging.batch;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>ProcessComicBooksStatus</code> represents the current state for processing comic books
 * files.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
public class ProcessComicBooksStatus {
  public static final String IMPORT_COMIC_FILES_STEP = "import-comic-files";
  public static final String COMIC_MARKED_AS_ADDED_STEP = "comic-marked-as-added-step";
  public static final String LOAD_FILE_CONTENTS_STEP = "load-file-contents-step";
  public static final String LOAD_PAGE_HASH_STEP = "load-page-hash-step";

  @JsonProperty("active")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private boolean active = true;

  @JsonProperty("stepName")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private String stepName;

  @JsonProperty("total")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private long total;

  @JsonProperty("processed")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private long processed;
}
