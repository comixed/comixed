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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicpages.AddImageCacheEntriesConfiguration;
import org.comixedproject.service.comicpages.PageCacheService;
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
 * <code>CreateCoverPageImageCacheEntriesInitiator</code> provides the entry point to initiate the
 * create image cache entries batch process.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class CreateCoverPageImageCacheEntriesInitiator {
  @Autowired private PageCacheService pageCacheService;

  @Autowired
  @Qualifier("addPageToImageCacheJob")
  private Job addPageToImageCacheJob;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  /** Starts a batch process to add pages to the image cache. */
  @Scheduled(cron = "${comixed.batch.add-cover-to-image-cache.schedule:0 0 * * * *}")
  public void execute() {
    log.info("Starting process: add pages to image cache");
    try {
      this.pageCacheService.prepareCoverPagesWithoutCacheEntries();
      this.jobLauncher.run(
          addPageToImageCacheJob,
          new JobParametersBuilder()
              .addLong(
                  AddImageCacheEntriesConfiguration.PARAM_ADD_IMAGE_CACHE_ENTRIES_STARTED,
                  System.currentTimeMillis())
              .toJobParameters());
    } catch (JobExecutionAlreadyRunningException
        | JobInstanceAlreadyCompleteException
        | JobParametersInvalidException
        | JobRestartException error) {
      log.error("Failed to start batch process", error);
    }
  }
}
