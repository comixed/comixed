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
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.*;

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.comixedproject.service.batch.ComicBatchService;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>AbstractProcessComicBookExecution</code> provides a foundation for building listeners that
 * listen to the batch processes that add comics to, or process comics for, the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public abstract class AbstractProcessComicBookExecution {
  @Autowired private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;
  @Autowired private ComicBatchService comicBatchService;

  /**
   * Returns the number of entries for a comic batch.
   *
   * @param batchName the batch name
   * @return the entry count
   */
  protected int getEntryCount(final String batchName) {
    final ComicBatch group = this.comicBatchService.getByName(batchName);
    return group.getEntries().size();
  }

  protected String getBatchName(final JobParameters jobParameters) {
    return jobParameters.getString(JOB_PROCESS_COMIC_BOOKS_BATCH_NAME);
  }

  protected void doPublishStatus(final ExecutionContext context, final boolean active) {
    log.trace("Building add comics to library status");
    final ProcessComicBooksStatus status = new ProcessComicBooksStatus();
    status.setActive(active);
    status.setBatchName(context.getString(PROCESS_COMIC_BOOKS_STATUS_BATCH_NAME));
    status.setStarted(
        context.containsKey(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED)
            ? new Date(context.getLong(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED))
            : null);
    status.setStepName(context.getString(PROCESS_COMIC_BOOKS_STATUS_STEP_NAME));
    status.setTotal(context.getLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS));
    status.setProcessed(context.getLong(PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS));
    log.trace("Publishing add comics to library status");
    try {
      this.publishProcessComicBooksStatusAction.publish(status);
    } catch (PublishingException error) {
      log.error("Failed to publish add comics to library status", error);
    }
  }
}
