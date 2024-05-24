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

import static org.comixedproject.batch.comicbooks.ImportComicFilesConfiguration.IMPORT_COMIC_FILES_JOB;
import static org.comixedproject.batch.comicbooks.ImportComicFilesConfiguration.IMPORT_COMIC_FILES_JOB_STARTED;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicfiles.ComicFileService;
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
 * <code>ImportComicFilesInitiator</code> looks for unprocessed comic file descriptors and imports
 * them into the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ImportComicFilesInitiator {
  @Autowired private ComicFileService comicFileService;
  @Autowired private BatchProcessesService batchProcessesService;

  @Autowired
  @Qualifier(value = IMPORT_COMIC_FILES_JOB)
  private Job loadPageHashesJob;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Scheduled(fixedDelayString = "${comixed.batch.import-comic-files.period}")
  public void execute() {
    log.trace("Checking for comic files to import");
    if (this.comicFileService.getUnimportedComicFileDescriptorCount() > 0
        && !this.batchProcessesService.hasActiveExecutions(IMPORT_COMIC_FILES_JOB)) {
      try {
        log.trace("Starting batch job: import comic files");
        this.jobLauncher.run(
            this.loadPageHashesJob,
            new JobParametersBuilder()
                .addLong(IMPORT_COMIC_FILES_JOB_STARTED, System.currentTimeMillis())
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
