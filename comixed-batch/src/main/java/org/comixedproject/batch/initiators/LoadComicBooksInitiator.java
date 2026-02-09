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

import static org.comixedproject.batch.comicbooks.LoadComicBooksConfiguration.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.LoadComicBooksEvent;
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
 * <code>LoadComicBooksInitiator</code> provides an initiator that periodically scans the library
 * for unprocessed comic books and starts a batch job to process them.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class LoadComicBooksInitiator {
  private static final Object MUTEX = new Object();

  @Autowired private ComicBookService comicBookService;
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(value = LOAD_COMIC_BOOKS_JOB)
  private Job loadComicBooksJob;

  @Autowired
  @Qualifier("batchJobOperator")
  private JobOperator jobOperator;

  /** Checks for unprocessed comics not in a group and kicks off a new batch job to process them. */
  @Scheduled(fixedDelayString = "${comixed.batch.load-comic-books.period:60000}")
  public void execute() {
    this.doExecute();
  }

  /**
   * Initiates the processing from an event.
   *
   * @param event the event
   */
  @EventListener()
  @Async
  public void execute(LoadComicBooksEvent event) {
    this.doExecute();
  }

  private void doExecute() {
    synchronized (MUTEX) {
      if (!this.batchProcessesService.hasActiveExecutions(LOAD_COMIC_BOOKS_JOB)
          && this.comicBookService.getUnprocessedComicBookCount() > 0) {
        log.info("Starting process comics job");
        try {
          this.jobOperator.start(
              this.loadComicBooksJob,
              new JobParametersBuilder()
                  .addLong(LOAD_COMIC_BOOKS_JOB_STARTED, System.currentTimeMillis())
                  .toJobParameters());
        } catch (JobExecutionAlreadyRunningException
                 | JobRestartException
                 | JobInstanceAlreadyCompleteException
                 | InvalidJobParametersException error) {
          log.error("Failed to start batch job processing comics", error);
        }
      }
    }
  }
}
