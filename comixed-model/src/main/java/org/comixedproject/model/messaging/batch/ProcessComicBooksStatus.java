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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
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
  public static final String PROCESS_COMIC_BOOKS_JOB_STARTED =
      "process-comic-books-state.job-started";
  public static final String PROCESS_COMIC_BOOKS_JOB_FINISHED =
      "process-comic-books-state.job-finished";
  public static final String PROCESS_COMIC_BOOKS_STEP_NAME = "process-comic-books-state.step-name";
  public static final String PROCESS_COMIC_BOOKS_TOTAL_COMICS =
      "process-comic-books-state.total-comics";
  public static final String PROCESS_COMIC_BOOKS_PROCESSED_COMICS =
      "process-comic-books-state.processed-comics";
  public static final String CREATE_METADATA_SOURCE_STEP_NAME = "create-metadata-source-step";
  public static final String LOAD_FILE_CONTENTS_STEP_NAME = "load-file-contents-step";
  public static final String MARK_BLOCKED_PAGES_STEP_NAME = "mark-blocked-pages-step";
  public static final String FILE_CONTENTS_PROCESSED_STEP_NAME = "file-contents-processed-step";

  @JsonProperty("active")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private boolean active = true;

  @JsonProperty("started")
  @JsonView(View.GenericObjectView.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  @Setter
  private Date started;

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
