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

import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.*;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.batch.BatchProcessesService;
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
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(value = PROCESS_COMIC_BOOKS_JOB)
  private Job processComicBooksJob;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  /** Checks for unprocessed comics not in a group and kicks off a new batch job to process them. */
  @Scheduled(fixedDelayString = "${comixed.batch.process-comic-books.period}")
  public void execute() {
    log.debug("Looking for unprocessed comic books");
    final List<ComicBook> comicBooks = this.comicBookService.getComicBooksForProcessing();
    if (comicBooks.isEmpty()) {
      log.debug("No comic books to be processed");
      return;
    }
    if (!this.batchProcessesService.hasActiveExecutions(PROCESS_COMIC_BOOKS_STARTED_JOB)) {
      log.info("Starting process comics job");
      try {
        this.jobLauncher.run(
            this.processComicBooksJob,
            new JobParametersBuilder()
                .addLong(PROCESS_COMIC_BOOKS_STARTED_JOB, System.currentTimeMillis())
                .toJobParameters());
      } catch (JobExecutionAlreadyRunningException
          | JobRestartException
          | JobInstanceAlreadyCompleteException
          | JobParametersInvalidException error) {
        log.error("Failed to start batch job processing comics", error);
      }
    }
  }
}
