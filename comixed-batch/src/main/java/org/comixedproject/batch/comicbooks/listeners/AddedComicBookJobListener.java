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

import static org.comixedproject.model.messaging.batch.AddComicBooksStatus.*;

import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.stereotype.Component;

/**
 * <code>AddedComicBookJobListener</code> provides a {@link JobExecutionListener} for the overall
 * process of adding comics to the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class AddedComicBookJobListener extends AbstractAddComicBooksExecutionListener
    implements JobExecutionListener {
  @Override
  public void beforeJob(final JobExecution jobExecution) {
    log.trace("Gathering job statistics");
    final ExecutionContext context = jobExecution.getExecutionContext();
    context.putLong(ADD_COMIC_BOOKS_JOB_STARTED, System.currentTimeMillis());
    context.putLong(
        ADD_COMIC_BOOKS_TOTAL_COMICS, this.comicFileService.getComicFileDescriptorCount());
    context.putLong(ADD_COMIC_BOOKS_PROCESSED_COMICS, 0);
    this.doPublishStatus(context);
  }

  @Override
  public void afterJob(final JobExecution jobExecution) {
    log.trace("Publishing completed job status");
    final ExecutionContext context = jobExecution.getExecutionContext();
    context.putLong(ADD_COMIC_BOOKS_JOB_FINISHED, System.currentTimeMillis());
    context.putLong(
        ADD_COMIC_BOOKS_PROCESSED_COMICS, context.getLong(ADD_COMIC_BOOKS_TOTAL_COMICS));
    this.doPublishStatus(context);
  }
}
