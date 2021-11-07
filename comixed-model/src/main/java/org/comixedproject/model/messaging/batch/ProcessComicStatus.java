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
 * <code>ProcessComicStatus</code> represents the current state for adding comics to the library.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
public class ProcessComicStatus {
  public static final String JOB_STARTED = "add-comic-state.job-started";
  public static final String JOB_FINISHED = "add-comic-state.job-finished";
  public static final String STEP_NAME = "add-comic-state.step-name";
  public static final String CREATE_INSERT_STEP_NAME = "create-insert-step";
  public static final String LOAD_FILE_CONTENTS_STEP_NAME = "load-file-contents-step";
  public static final String MARK_BLOCKED_PAGES_STEP_NAME = "mark-blocked-pages-step";
  public static final String LOAD_FILE_DETAILS_STEP_NAME = "load-file-details-step";
  public static final String FILE_CONTENTS_PROCESSED_STEP_NAME = "file-contents-processed-step";
  public static final String TOTAL_COMICS = "add-comic-state.total-comics";
  public static final String PROCESSED_COMICS = "add-comic-state.processed-comics";

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
