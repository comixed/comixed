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

import org.comixedproject.batch.comicbooks.processors.MarkComicBatchCompletedProcessor;
import org.comixedproject.batch.comicbooks.readers.MarkComicBatchCompletedReader;
import org.comixedproject.batch.comicbooks.writers.ComicBatchWriter;
import org.comixedproject.model.batch.ComicBatch;
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
import org.springframework.transaction.PlatformTransactionManager;

/**
 * <code>BatchConfiguration</code> provides a global batch configuration.
 *
 * @author Darryl L. Pierce
 */
@Configuration
public class BatchConfiguration {
  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  @Value("${comixed.batch.thread-pool-size}")
  private int batchThreadPoolSize = 10;

  /**
   * Returns the task executor for jobs.
   *
   * @return the task executor
   */
  @Bean(name = "jobTaskExecutor")
  public TaskExecutor jobTaskExecutor() {
    final SimpleAsyncTaskExecutor result = new SimpleAsyncTaskExecutor("CX-Jarvis");
    result.setConcurrencyLimit(this.batchThreadPoolSize);
    return result;
  }

  /**
   * Returns the task executor for steps.
   *
   * @return the task executor
   */
  @Bean(name = "stepTaskExecutor")
  public TaskExecutor stepTaskExecutor() {
    return new SimpleAsyncTaskExecutor("CX-Alfred");
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

  /**
   * Returns the step performs batch group deletion.
   *
   * @param jobRepository the step factory
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step the step
   */
  @Bean(name = "markComicBatchCompletedStep")
  public Step markComicBatchCompletedStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final MarkComicBatchCompletedReader reader,
      final MarkComicBatchCompletedProcessor processor,
      final ComicBatchWriter writer) {
    return new StepBuilder("processComicBooksJobStep", jobRepository)
        .<ComicBatch, ComicBatch>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
