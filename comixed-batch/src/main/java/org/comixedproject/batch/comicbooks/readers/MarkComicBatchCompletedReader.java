/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.readers;

import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_BATCH_NAME;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.service.batch.ComicBatchService;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MarkComicBatchCompletedReader</code> loads a {@link ComicBatch} defined in the job
 * parameters.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkComicBatchCompletedReader
    implements ItemReader<ComicBatch>, StepExecutionListener {
  @Autowired private ComicBatchService comicBatchService;

  String batchName;

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    this.batchName = stepExecution.getJobParameters().getString(JOB_PROCESS_COMIC_BOOKS_BATCH_NAME);
  }

  @Override
  public ComicBatch read() {
    log.debug("Loading comic batch: {}", this.batchName);
    return this.comicBatchService.getIncompleteBatchByName(this.batchName);
  }
}
