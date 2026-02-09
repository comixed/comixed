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

import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.JobInstance;
import org.springframework.batch.core.launch.NoSuchJobException;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>BatchProcessesService</code> provides methods for accessing batch process data.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class BatchProcessesService {
  @Autowired private JobRepository jobRepository;

  private static final Set<String> DELETABLE_JOB_STATUSES =
      new HashSet<>(
          Arrays.asList(
              ExitStatus.COMPLETED.getExitCode(),
              ExitStatus.FAILED.getExitCode(),
              ExitStatus.STOPPED.getExitCode()));

  /**
   * Returns the status for all batch processes.
   *
   * @return the status list
   */
  public List<BatchProcessDetail> getAllBatchProcesses() {
    return this.doGetAllBatchProcesses();
  }

  /**
   * Delete all jobs that have either completed or failed.
   *
   * @return the list of remaining batches
   */
  public List<BatchProcessDetail> deleteCompletedJobs() {
    log.debug("Deleting inactive jobs");
    this.jobRepository
        .getJobNames()
        .forEach(
            jobName -> {
              try {
                this.doDeleteInactiveJobsFor(jobName);
              } catch (NoSuchJobException error) {
                log.error("Failed to delete inactive executions for job: {}", jobName, error);
              }
            });
    return this.doGetAllBatchProcesses();
  }

  /**
   * Deletes jobs by id.
   *
   * @param jobIds the job ids
   * @return the remaining jobs
   */
  public List<BatchProcessDetail> deleteSelectedJobs(final List<Long> jobIds) {
    log.debug("Deleting {} job(s) by id", jobIds.size());
    jobIds.forEach(
        jobId -> {
          final JobExecution jobExecution = this.jobRepository.getJobExecution(jobId);
          if (Objects.nonNull(jobExecution)) {
            log.trace("Deleting job execution: id={}", jobExecution.getId());
            this.jobRepository.deleteJobExecution(jobExecution);
          }
        });
    return this.getAllBatchProcesses();
  }

  /**
   * Returns if there any any active jobs with the given name.
   *
   * @param jobName the job name
   * @return true if there are active jobs
   */
  public boolean hasActiveExecutions(final String jobName) {
    try {
      final long instances = this.jobRepository.getJobInstanceCount(jobName);
      final List<JobExecution> executions = new ArrayList<>();
      this.jobRepository.getJobInstances(jobName, 0, (int) instances).stream()
          .map(instance -> this.jobRepository.getJobExecutions(instance))
          .forEach(executions::addAll);
      return executions.stream()
              .filter(JobExecution::isRunning)
              .filter(execution -> Objects.isNull(execution.getEndTime()))
              .count()
          > 0L;
    } catch (NoSuchJobException error) {
      log.error("Failed to get active job count for " + jobName, error);
      return false;
    }
  }

  private void doDeleteInactiveJobsFor(final String jobName) throws NoSuchJobException {
    final List<JobInstance> jobInstances =
        this.jobRepository.getJobInstances(
            jobName, 0, (int) this.jobRepository.getJobInstanceCount(jobName));
    for (int whichInstance = 0; whichInstance < jobInstances.size(); whichInstance++) {
      final JobInstance jobInstance = jobInstances.get(whichInstance);
      if (this.jobRepository.getJobExecutions(jobInstance).stream()
          .filter(
              execution ->
                  !DELETABLE_JOB_STATUSES.contains(execution.getExitStatus().getExitCode()))
          .toList()
          .isEmpty()) {
        log.debug("Deleting job instance: id={}", jobInstance.getId());
        this.jobRepository.deleteJobInstance(jobInstance);
      }
    }
  }

  private List<BatchProcessDetail> doGetAllBatchProcesses() {
    final List<BatchProcessDetail> result = new ArrayList<>();

    log.debug("Loading batch process status records");
    this.jobRepository
        .getJobNames()
        .forEach(
            name -> {
              log.debug("Loading job instance for job: {}", name);
              try {
                final int count = Math.toIntExact(this.jobRepository.getJobInstanceCount(name));
                this.jobRepository
                    .getJobInstances(name, 0, count)
                    .forEach(
                        jobInstance -> {
                          log.trace(
                              "Loading job executions for instance: {}",
                              jobInstance.getInstanceId());
                          final List<JobExecution> jobExecutions =
                              this.jobRepository.getJobExecutions(jobInstance);
                          log.trace("Getting execution details");
                          jobExecutions.forEach(
                              jobExecution -> {
                                log.trace("Adding job execution: {}", jobExecution.getId());
                                result.add(BatchProcessDetail.from(jobExecution));
                              });
                        });
              } catch (NoSuchJobException error) {
                log.error("Failed to load job instance count", error);
              }
            });

    return result;
  }
}
