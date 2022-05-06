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

package org.comixedproject.batch.comicbooks.listeners;

import static org.comixedproject.model.messaging.batch.ProcessComicStatus.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>LoadFileContentsStepListener</code> relates batch status while loading comic file contents.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class LoadFileContentsStepListener extends AbstractComicProcessingStepExecutionListener {
  @Autowired private ComicBookService comicBookService;

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    final ExecutionContext context = stepExecution.getJobExecution().getExecutionContext();
    context.putString(STEP_NAME, LOAD_FILE_CONTENTS_STEP_NAME);
    log.trace("Getting comic count");
    context.putLong(TOTAL_COMICS, this.comicBookService.getUnprocessedComicsWithoutContentCount());
    this.doPublishState(context);
  }
}
