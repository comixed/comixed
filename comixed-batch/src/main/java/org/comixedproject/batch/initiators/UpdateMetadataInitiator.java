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

package org.comixedproject.batch.initiators;

import static org.comixedproject.batch.comicbooks.UpdateMetadataConfiguration.UPDATE_METADATA_JOB;
import static org.comixedproject.batch.comicbooks.UpdateMetadataConfiguration.UPDATE_METADATA_JOB_TIME_STARTED;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.UpdateMetadataEvent;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.parameters.InvalidJobParametersException;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.launch.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.launch.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * <code>UpdateMetadataInitiator</code> initiates the batch process to update the metadata for
 * marked comic books.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class UpdateMetadataInitiator {
  private static final Object MUTEX = new Object();

  @Autowired private ComicBookService comicBookService;
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(UPDATE_METADATA_JOB)
  private Job updateMetadataJob;

  @Autowired
  @Qualifier("batchJobOperator")
  private JobOperator jobOperator;

  @Scheduled(fixedDelayString = "${comixed.batch.update-metadata.period:60000}")
  public void execute() {
    this.doExecute();
  }

  @EventListener
  @Async
  public void execute(UpdateMetadataEvent event) {
    this.doExecute();
  }

  private void doExecute() {
    synchronized (MUTEX) {
      log.trace("Checking for pending metadata updates");
      if (this.comicBookService.getUpdateMetadataCount() > 0L
          && !this.batchProcessesService.hasActiveExecutions(UPDATE_METADATA_JOB)) {
        try {
          log.trace("Starting batch job: update metadata");
          this.jobOperator.start(
              this.updateMetadataJob,
              new JobParametersBuilder()
                  .addLong(UPDATE_METADATA_JOB_TIME_STARTED, System.currentTimeMillis())
                  .toJobParameters());
        } catch (JobExecutionAlreadyRunningException
                 | JobRestartException
                 | JobInstanceAlreadyCompleteException
                 | InvalidJobParametersException error) {
          log.error("Failed to run update metadata job", error);
        }
      }
    }
  }
}
