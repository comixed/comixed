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

import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.stereotype.Component;

/**
 * <code>ImportComicFilesJobListener</code> provides a {@link JobExecutionListener} for the overall
 * process of adding comics to the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@JobScope
@Log4j2
public class ImportComicFilesJobListener extends AbstractBatchProcessListener
    implements JobExecutionListener {
  @Override
  public void beforeJob(final JobExecution jobExecution) {
    log.trace("Publishing status before job");
    this.doPublishBatchProcessDetail(BatchProcessDetail.from(jobExecution));
  }

  @Override
  public void afterJob(final JobExecution jobExecution) {
    log.trace("Publishing status after job");
    this.doPublishBatchProcessDetail(BatchProcessDetail.from(jobExecution));
  }
}
