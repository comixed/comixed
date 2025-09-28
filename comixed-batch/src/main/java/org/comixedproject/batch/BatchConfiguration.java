/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.batch;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.TaskExecutorJobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.job.DefaultJobParametersExtractor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;

/**
 * <code>BatchConfiguration</code> provides a global batch configuration.
 *
 * @author Darryl L. Pierce
 */
@Configuration
public class BatchConfiguration {
  @Value("${comixed.batch.thread-pool-size:-1}")
  private int batchThreadPoolSize;

  /**
   * Returns the task executor for jobs.
   *
   * @return the task executor
   */
  @Bean(name = "jobTaskExecutor")
  public TaskExecutor jobTaskExecutor() {
    return this.doCreateTaskExecutor("CX-Jarvis");
  }

  /**
   * Returns the task executor for steps.
   *
   * @return the task executor
   */
  @Bean(name = "stepTaskExecutor")
  public TaskExecutor stepTaskExecutor() {
    return this.doCreateTaskExecutor("CX-Jarvis");
  }

  private SimpleAsyncTaskExecutor doCreateTaskExecutor(String name) {
    final SimpleAsyncTaskExecutor result = new SimpleAsyncTaskExecutor(name);
    result.setConcurrencyLimit(this.batchThreadPoolSize);
    result.setVirtualThreads(true);
    return result;
  }

  /**
   * Returns the batch job launcher.
   *
   * @param jobRepository the job repository
   * @param taskExecutor the task executor
   * @return the job launcher
   * @throws Exception if an error occurs
   */
  @Bean(name = "batchJobLauncher")
  public JobLauncher batchJobLauncher(
      final JobRepository jobRepository,
      @Qualifier("jobTaskExecutor") final TaskExecutor taskExecutor)
      throws Exception {
    final TaskExecutorJobLauncher taskExecutorJobLauncher = new TaskExecutorJobLauncher();
    taskExecutorJobLauncher.setJobRepository(jobRepository);
    taskExecutorJobLauncher.setTaskExecutor(taskExecutor);
    taskExecutorJobLauncher.afterPropertiesSet();
    return taskExecutorJobLauncher;
  }

  /**
   * Returns the step that launches the processing batch job.
   *
   * @param jobRepository the step factory
   * @param processComicBooksJob the job
   * @param jobLauncher the job launcher
   * @return the step the step
   */
  @Bean(name = "processComicBooksJobStep")
  public Step processComicBooksJobStep(
      final JobRepository jobRepository,
      final @Qualifier("processComicBooksJob") Job processComicBooksJob,
      final @Qualifier("batchJobLauncher") JobLauncher jobLauncher) {
    return new StepBuilder("processComicBooksJobStep", jobRepository)
        .job(processComicBooksJob)
        .parametersExtractor(new DefaultJobParametersExtractor())
        .launcher(jobLauncher)
        .build();
  }
}
