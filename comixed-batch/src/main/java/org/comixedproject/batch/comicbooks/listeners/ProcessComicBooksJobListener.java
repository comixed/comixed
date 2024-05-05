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

import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_BATCH_NAME;
import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_STARTED;
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.service.batch.ComicBatchService;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ProcessComicBooksJobListener</code> relays overall job state during the comic processing
 * batch process.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ProcessComicBooksJobListener extends AbstractBatchProcessListener
    implements JobExecutionListener {
  @Autowired private ComicBatchService comicBatchService;

  @Override
  public void beforeJob(final JobExecution jobExecution) {
    this.doPublishBatchProcessDetail(BatchProcessDetail.from(jobExecution));
    final ExecutionContext context = jobExecution.getExecutionContext();
    final String batchName = this.getBatchName(jobExecution.getJobParameters());
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED, System.currentTimeMillis());
    context.putString(PROCESS_COMIC_BOOKS_STATUS_BATCH_NAME, batchName);
    context.putString(PROCESS_COMIC_BOOKS_STATUS_STEP_NAME, PROCESS_COMIC_BOOKS_STEP_NAME_SETUP);
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS, this.getEntryCount(batchName));
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS, 0);
    this.doPublishProcessComicBookStatus(context, true);
  }

  @Override
  public void afterJob(final JobExecution jobExecution) {
    this.doPublishBatchProcessDetail(BatchProcessDetail.from(jobExecution));
    final ExecutionContext context = jobExecution.getExecutionContext();
    final String batchName = this.getBatchName(jobExecution.getJobParameters());
    context.putLong(
        PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED,
        jobExecution.getJobParameters().getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));
    context.putString(PROCESS_COMIC_BOOKS_STATUS_BATCH_NAME, batchName);
    context.putString(
        PROCESS_COMIC_BOOKS_STATUS_STEP_NAME, PROCESS_COMIC_BOOKS_STEP_NAME_COMPLETED);
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_JOB_FINISHED, System.currentTimeMillis());
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS, this.getEntryCount(batchName));
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS, this.getEntryCount(batchName));
    final String comicBatchName =
        jobExecution.getJobParameters().getString(JOB_PROCESS_COMIC_BOOKS_BATCH_NAME);
    log.debug("Deleting comic batch: {}", comicBatchName);
    this.comicBatchService.deleteBatchByName(comicBatchName);
    this.doPublishProcessComicBookStatus(context, false);
  }
}
