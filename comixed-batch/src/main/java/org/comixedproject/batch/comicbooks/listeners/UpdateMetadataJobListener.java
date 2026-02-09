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

package org.comixedproject.batch.comicbooks.listeners;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListener;
import org.springframework.stereotype.Component;

/**
 * <code>UpdateMetadataJobListener</code> sends job status updates while updating comic book
 * metadata.
 *
 * @author Darryl L. Pierce
 */
@Component
@JobScope
@Log4j2
public class UpdateMetadataJobListener extends AbstractBatchProcessListener
    implements JobExecutionListener {
  @Override
  public void beforeJob(final JobExecution jobExecution) {
    this.doPublishBatchProcessDetail(BatchProcessDetail.from(jobExecution));
  }

  @Override
  public void afterJob(final JobExecution jobExecution) {
    this.doPublishBatchProcessDetail(BatchProcessDetail.from(jobExecution));
  }
}
