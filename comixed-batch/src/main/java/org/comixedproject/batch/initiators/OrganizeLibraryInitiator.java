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

import static org.comixedproject.batch.library.OrganizeLibraryConfiguration.*;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_COMIC_RENAMING_RULE;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.library.OrganizingComicService;
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
import org.springframework.util.StringUtils;

/**
 * <code>OrganizeLibraryInitiator</code> decides when to start a batch process to organize the
 * library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class OrganizeLibraryInitiator {
  private static final Object MUTEX = new Object();

  @Autowired private OrganizingComicService organizingComicService;
  @Autowired private ConfigurationService configurationService;
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(value = ORGANIZE_LIBRARY_JOB)
  private Job libraryOrganizationJob;

  @Autowired
  @Qualifier("batchJobOperator")
  private JobOperator jobOperator;

  @Scheduled(fixedDelayString = "${comixed.batch.organize-library.period:60000}")
  public void execute() {
    this.doExecute();
  }

  @EventListener
  @Async
  public void execute(final OrganizingLibraryEvent event) {
    this.doExecute();
  }

  private void doExecute() {
    synchronized (MUTEX) {
      log.trace("Checking for comic files to be organized");
      if (this.organizingComicService.loadComicCount() > 0L
          && !this.batchProcessesService.hasActiveExecutions(ORGANIZE_LIBRARY_JOB)) {
        log.trace("Loading configured root directory");
        final String rootDirectory =
            this.configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY);
        if (!StringUtils.hasLength(rootDirectory)) {
          log.error("Cannot organize comic files: no root directory defined");
          return;
        }
        log.trace("Loading configured renaming rule");
        final String renamingRule =
            this.configurationService.getOptionValue(CFG_LIBRARY_COMIC_RENAMING_RULE);
        if (!StringUtils.hasLength(renamingRule)) {
          log.error("Cannot organize comic files: no renaming rule defined");
          return;
        }
        try {
          log.trace("Starting batch job: organize comic files");
          this.jobOperator.start(
              this.libraryOrganizationJob,
              new JobParametersBuilder()
                  .addLong(ORGANIZE_LIBRARY_JOB_TIME_STARTED, System.currentTimeMillis())
                  .addString(ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY, rootDirectory)
                  .addString(ORGANIZE_LIBRARY_JOB_RENAMING_RULE, renamingRule)
                  .toJobParameters());
        } catch (JobExecutionAlreadyRunningException
            | JobRestartException
            | JobInstanceAlreadyCompleteException
            | InvalidJobParametersException error) {
          log.error("Failed to run import comic files job", error);
        }
      }
    }
  }
}
