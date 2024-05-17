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

import static org.comixedproject.batch.comicpages.MarkBlockedPagesConfiguration.JOB_MARK_BLOCKED_PAGES_STARTED;
import static org.comixedproject.batch.comicpages.MarkBlockedPagesConfiguration.MARK_BLOCKED_PAGES_JOB;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicpages.ComicPageService;
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
 * <code>MarkBlockedPagesInitiator</code> starts a job to mark pages with a blocked has for
 * deletion.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkBlockedPagesInitiator {
  @Autowired private ConfigurationService configurationService;
  @Autowired private ComicPageService comicPageService;
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(value = MARK_BLOCKED_PAGES_JOB)
  private Job markBlockedPagesJob;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Scheduled(fixedDelayString = "${comixed.batch.mark-blocked-pages.period}")
  public void execute() {
    if (!this.configurationService.isFeatureEnabled(
        ConfigurationService.CFG_MANAGE_BLOCKED_PAGES)) {
      log.trace("Skipping batch since managing blocked pages is disabled");
      return;
    }
    log.trace("Checking for pages with blocked hash");
    if (this.comicPageService.getUnmarkedWithBlockedHashCount() > 0L
        && !this.batchProcessesService.hasActiveExecutions(MARK_BLOCKED_PAGES_JOB)) {
      try {
        log.trace("Starting batch job: mark pages with blocked hash");
        this.jobLauncher.run(
            this.markBlockedPagesJob,
            new JobParametersBuilder()
                .addLong(JOB_MARK_BLOCKED_PAGES_STARTED, System.currentTimeMillis())
                .toJobParameters());
      } catch (JobExecutionAlreadyRunningException
          | JobRestartException
          | JobInstanceAlreadyCompleteException
          | JobParametersInvalidException error) {
        log.error("Failed to run load page hash job", error);
      }
    }
  }
}
