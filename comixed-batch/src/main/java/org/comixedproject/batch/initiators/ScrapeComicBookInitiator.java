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

import static org.comixedproject.batch.comicbooks.ScrapeMetadataConfiguration.*;
import static org.comixedproject.service.admin.ConfigurationService.CFG_METADATA_SCRAPING_ERROR_THRESHOLD;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.ScrapeMetadataEvent;
import org.comixedproject.service.admin.ConfigurationService;
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
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * <code>ScrapeComicBookInitiator</code> starts the process of scraping comic books in a batch.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ScrapeComicBookInitiator {
  private static final Object MUTEX = new Object();
  public static final long DEFAULT_ERROR_THRESHOLD = 10L;

  @Autowired private ComicBookService comicBookService;
  @Autowired private BatchProcessesService batchProcessesService;
  @Autowired private ConfigurationService configurationService;

  @Autowired
  @Qualifier(SCRAPE_METADATA_JOB)
  private Job batchScrapingJob;

  @Autowired
  @Qualifier("batchJobOperator")
  private JobLauncher jobLauncher;

  @Scheduled(cron = "${comixed.batch.scrape-metadata.schedule:0 0 3 * * *}")
  public void execute() {
    this.doExecute();
  }

  @EventListener
  @Async
  public void execute(ScrapeMetadataEvent event) {
    this.doExecute();
  }

  private void doExecute() {
    synchronized (MUTEX) {
      log.trace("Checking for comic files to import");
      if (this.comicBookService.getBatchScrapingCount() > 0L
          && !this.batchProcessesService.hasActiveExecutions(SCRAPE_METADATA_JOB)) {
        try {
          final Long errorThreshold =
              Long.parseLong(
                  this.configurationService.getOptionValue(
                      CFG_METADATA_SCRAPING_ERROR_THRESHOLD,
                      String.valueOf(DEFAULT_ERROR_THRESHOLD)));
          log.trace("Starting batch job: batch scraping");
          this.jobLauncher.run(
              this.batchScrapingJob,
              new JobParametersBuilder()
                  .addLong(SCRAPE_METADATA_JOB_TIME_STARTED, System.currentTimeMillis())
                  .addLong(SCRAPE_METADATA_JOB_ERROR_THRESHOLD, errorThreshold)
                  .toJobParameters());
        } catch (JobExecutionAlreadyRunningException
            | JobRestartException
            | JobInstanceAlreadyCompleteException
            | JobParametersInvalidException error) {
          log.error("Failed to run batch scraping job", error);
        }
      }
    }
  }
}
