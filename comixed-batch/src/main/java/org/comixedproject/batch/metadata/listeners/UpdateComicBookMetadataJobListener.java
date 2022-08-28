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

package org.comixedproject.batch.metadata.listeners;

import static org.comixedproject.batch.metadata.MetadataProcessConfiguration.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class UpdateComicBookMetadataJobListener extends AbstractMetadataUpdateProcessingListener
    implements JobExecutionListener {
  @Autowired private ComicBookService comicBookService;

  @Override
  public void beforeJob(final JobExecution jobExecution) {
    final ExecutionContext context = jobExecution.getExecutionContext();
    log.trace("Adding total comics");
    context.putLong(PARAM_METADATA_UPDATE_STARTED, System.currentTimeMillis());
    context.putLong(
        PARAM_METADATA_UPDATE_TOTAL_COMICS,
        this.comicBookService.findComicsForBatchMetadataUpdateCount());
    this.doPublishState(context);
  }

  @Override
  public void afterJob(final JobExecution jobExecution) {
    final ExecutionContext context = jobExecution.getExecutionContext();
    log.trace("Marking job as completed");
    context.putLong(PARAM_METADATA_UPDATE_FINISHED, System.currentTimeMillis());
    this.doPublishState(context);
  }
}
