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
  public static final String PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED =
      "process-comic-books-status.job-started";
  public static final String PROCESS_COMIC_BOOKS_STATUS_JOB_FINISHED =
      "process-comic-books-status.job-finished";
  public static final String PROCESS_COMIC_BOOKS_STATUS_BATCH_NAME =
      "process-comic-books-status.batch-name";
  public static final String PROCESS_COMIC_BOOKS_STATUS_STEP_NAME =
      "process-comic-books-status.step-name";
  public static final String PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS =
      "process-comic-books-status.total-comics";
  public static final String PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS =
      "process-comic-books-status.processed-comics";

  public static final String PROCESS_COMIC_BOOKS_STEP_NAME_SETUP = "job-setup-step";
  public static final String PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_FILE_CONTENTS =
      "load-file-contents-step";
  public static final String PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_PAGE_HASH = "load-page-hash-step";
  public static final String PROCESS_COMIC_BOOKS_STEP_NAME_COMPLETED = "job-completed-step";

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

  @JsonProperty("batchName")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private String batchName;

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
