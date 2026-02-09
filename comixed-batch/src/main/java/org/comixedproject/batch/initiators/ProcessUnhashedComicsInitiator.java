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

import static org.comixedproject.batch.comicbooks.ProcessUnhashedComicsConfiguration.JOB_PROCESS_UNHASHED_COMICS_STARTED;
import static org.comixedproject.batch.comicbooks.ProcessUnhashedComicsConfiguration.PROCESS_UNHASHED_COMICS_JOB;

import lombok.extern.log4j.Log4j2;
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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * <code>ProcessUnhashedComicsInitiator</code> periodically checks for any page that does not have a
 * defined hash. If any are found, and if the <code>library.blocked-pages-enabled</code> feature is
 * enabled, then it spawns a batch job to load those hashes.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ProcessUnhashedComicsInitiator {
  private static final Object MUTEX = new Object();

  @Autowired private ComicBookService comicBookService;
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(value = PROCESS_UNHASHED_COMICS_JOB)
  private Job loadPageHashesJob;

  @Autowired
  @Qualifier("batchJobOperator")
  private JobOperator jobOperator;

  @Scheduled(fixedDelayString = "${comixed.batch.load-page-hashes.period:60000}")
  public void execute() {
    synchronized (MUTEX) {
      log.trace("Checking for pages without hashes");
      if (this.comicBookService.hasComicsWithUnhashedPages()
          && !this.batchProcessesService.hasActiveExecutions(PROCESS_UNHASHED_COMICS_JOB)) {
        try {
          log.trace("Starting batch job: load page hashes");
          this.jobOperator.start(
              this.loadPageHashesJob,
              new JobParametersBuilder()
                  .addLong(JOB_PROCESS_UNHASHED_COMICS_STARTED, System.currentTimeMillis())
                  .toJobParameters());
        } catch (JobExecutionAlreadyRunningException
                 | JobRestartException
                 | JobInstanceAlreadyCompleteException
                 | InvalidJobParametersException error) {
          log.error("Failed to run load page hash job", error);
        }
      }
    }
  }
}
