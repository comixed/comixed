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
 */ package org.comixedproject.batch.initiators;

import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_STARTED;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * <code>ProcessComicBooksInitiator</code> provides an initiator that periodically scans the library
 * for unprocessed comic books and starts a batch job to process them.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ProcessComicBooksInitiator {
  @Autowired private ComicBookService comicBookService;

  @Autowired
  @Qualifier("processComicBooksJob")
  private Job processComicBooksJob;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  /** Starts a batch process to add pages to the image cache. */
  @Scheduled(cron = "${comixed.batch.process-comic-books.schedule:'0 0,10,20,30,40,50 * * * *'}")
  public void execute() {
    log.info("Starting process: scan for incoming comics");
    try {
      if (this.comicBookService.getUnprocessedComicsWithoutContentCount() > 0
          || this.comicBookService.getUnprocessedComicsForMarkedPageBlockingCount() > 0
          || this.comicBookService.getWithCreateMetadataSourceFlagCount() > 0
          || this.comicBookService.getProcessedComicsCount() > 0) {
        log.debug("Processing incoming comics");
        this.jobLauncher.run(
            processComicBooksJob,
            new JobParametersBuilder()
                .addLong(JOB_PROCESS_COMIC_BOOKS_STARTED, System.currentTimeMillis())
                .toJobParameters());
      }
    } catch (JobInstanceAlreadyCompleteException
        | JobExecutionAlreadyRunningException
        | JobParametersInvalidException
        | JobRestartException error) {
      log.error("Failed to start scanning incoming comics", error);
    }
  }
}
