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

package org.comixedproject.batch.listeners;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.JobExecution;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>AbstractBatchProcessListener</code> provides a foundation for building listeners for batch
 * processes
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractBatchProcessListener {
  @Autowired private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;
  @Autowired private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Autowired protected ComicBookService comicBookService;

  protected void doPublishProcessComicBookStatus(
      final boolean active, final String stepName, final long total, final long processed) {
    final ProcessComicBooksStatus status = new ProcessComicBooksStatus();
    status.setActive(active);
    status.setStepName(stepName);
    status.setTotal(total);
    status.setProcessed(processed);
    log.trace("Publishing add comics to library status");
    try {
      this.publishProcessComicBooksStatusAction.publish(status);
    } catch (PublishingException error) {
      log.error("Failed to publish add comics to library status", error);
    }
  }

  protected void doPublishBatchProcessDetail(final BatchProcessDetail detail) {
    try {
      this.publishBatchProcessDetailUpdateAction.publish(detail);
    } catch (PublishingException error) {
      log.error("Failed to publish batch process detail", error);
    }
  }

  protected BatchProcessDetail getBatchDetails(final JobExecution jobExecution) {
    return BatchProcessDetail.from(jobExecution);
  }
}
