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

import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.RECREATE_COMIC_FILES_JOB;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.RECREATE_COMIC_FILES_JOB_TIME_STARTED;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.RecreateComicFilesEvent;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * <code>RecreateComicFilesInitiator</code> decides when to start a batch process to recreate comic
 * book files.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class RecreateComicFilesInitiator {
  private static final Object MUTEX = new Object();

  @Autowired private ComicBookService comicBookService;
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(value = RECREATE_COMIC_FILES_JOB)
  private Job recreateComicFilesJob;

  @Autowired
  @Qualifier("batchJobOperator")
  private JobOperator jobOperator;

  @Scheduled(fixedDelayString = "${comixed.batch.recreate-comic-files.period:60000}")
  public void execute() {
    this.doExecute();
  }

  @EventListener
  @Async
  public void execute(final RecreateComicFilesEvent event) {
    this.doExecute();
  }

  private void doExecute() {
    synchronized (MUTEX) {
      log.trace("Checking for comic files to be recreated");
      if (this.comicBookService.findComicsToRecreateCount() > 0L
          && !this.batchProcessesService.hasActiveExecutions(RECREATE_COMIC_FILES_JOB)) {
        try {
          log.trace("Starting batch job: organize comic files");
          this.jobOperator.run(
              this.recreateComicFilesJob,
              new JobParametersBuilder()
                  .addLong(RECREATE_COMIC_FILES_JOB_TIME_STARTED, System.currentTimeMillis())
                  .toJobParameters());
        } catch (JobExecutionAlreadyRunningException
            | JobRestartException
            | JobInstanceAlreadyCompleteException
            | JobParametersInvalidException error) {
          log.error("Failed to run import comic files job", error);
        }
      }
    }
  }
}
