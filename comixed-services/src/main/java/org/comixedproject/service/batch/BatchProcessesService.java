/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.service.batch;

import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.launch.NoSuchJobException;
import org.springframework.batch.core.launch.NoSuchJobExecutionException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * <code>BatchProcessesService</code> provides methods for accessing batch process data.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class BatchProcessesService {
  @Autowired private JobExplorer jobExplorer;
  @Autowired private JobOperator jobOperator;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  /**
   * Returns the status for all batch processes.
   *
   * @return the status list
   */
  public List<BatchProcessDetail> getAllBatchProcesses() {
    final List<BatchProcessDetail> result = new ArrayList<>();

    log.debug("Loading batch process status records");
    this.jobExplorer
        .getJobNames()
        .forEach(
            name -> {
              log.debug("Loading job instance for job: {}", name);
              try {
                final int count = Math.toIntExact(this.jobExplorer.getJobInstanceCount(name));
                this.jobExplorer
                    .getJobInstances(name, 0, count)
                    .forEach(
                        jobInstance -> {
                          log.trace(
                              "Loading job executions for instance: {}",
                              jobInstance.getInstanceId());
                          final List<JobExecution> jobExecutions =
                              this.jobExplorer.getJobExecutions(jobInstance);
                          log.trace("Getting execution details");
                          jobExecutions.forEach(
                              jobExecution -> {
                                log.trace("Adding job execution: {}", jobExecution.getJobId());
                                result.add(BatchProcessDetail.from(jobExecution));
                              });
                        });
              } catch (NoSuchJobException error) {
                log.error("Failed to load job instance count", error);
              }
            });

    return result;
  }

  public void restartJob(final long jobId) throws BatchProcessException {
    log.debug("Loading job execution");
    try {
      this.jobOperator.restart(jobId);
    } catch (JobInstanceAlreadyCompleteException
        | NoSuchJobExecutionException
        | NoSuchJobException
        | JobRestartException
        | JobParametersInvalidException error) {
      log.error("Failed to restart batch job");
      throw new BatchProcessException("Failed to restart job: " + jobId, error);
    }
  }
}
