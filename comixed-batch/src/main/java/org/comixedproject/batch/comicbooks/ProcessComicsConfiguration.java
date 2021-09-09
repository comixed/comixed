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

package org.comixedproject.batch.comicbooks;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicbooks.processors.LoadFileContentsProcessor;
import org.comixedproject.batch.comicbooks.processors.MarkBlockedPagesProcessor;
import org.comixedproject.batch.comicbooks.processors.NoopComicProcessor;
import org.comixedproject.batch.comicbooks.readers.ContentsProcessedReader;
import org.comixedproject.batch.comicbooks.readers.LoadFileContentsReader;
import org.comixedproject.batch.comicbooks.readers.LoadFileDetailsReader;
import org.comixedproject.batch.comicbooks.readers.MarkBlockedPagesReader;
import org.comixedproject.batch.comicbooks.writers.ContentsProcessedWriter;
import org.comixedproject.batch.comicbooks.writers.LoadFileContentsWriter;
import org.comixedproject.batch.comicbooks.writers.MarkBlockedPagesWriter;
import org.comixedproject.model.comicbooks.Comic;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * <code>ProcessComicsConfiguration</code> defines the batch process for importing comics.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableScheduling
@Log4j2
public class ProcessComicsConfiguration {
  private static final String KEY_STARTED = "job.process-comics.started";

  @Value("${batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the process comics job.
   *
   * @param jobBuilderFactory the job factory
   * @param loadFileContentsStep the load file contents step
   * @param markBlockedPagesStep the mark blocked pages step
   * @param loadFileDetailsStep the load file details step
   * @param contentsProcessedStep the mark contents processed step
   * @return the job
   */
  @Bean
  @Qualifier("processComicsJob")
  public Job processComicsJob(
      final JobBuilderFactory jobBuilderFactory,
      @Qualifier("loadFileContentsStep") final Step loadFileContentsStep,
      @Qualifier("markBlockedPagesStep") final Step markBlockedPagesStep,
      @Qualifier("loadFileDetailsStep") final Step loadFileDetailsStep,
      @Qualifier("contentsProcessedStep") final Step contentsProcessedStep) {
    return jobBuilderFactory
        .get("importComicsJob")
        .incrementer(new RunIdIncrementer())
        .start(loadFileContentsStep)
        .next(markBlockedPagesStep)
        .next(loadFileDetailsStep)
        .next(contentsProcessedStep)
        .build();
  }

  /**
   * Returns the load file contents step.
   *
   * @param stepBuilderFactory the step factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("loadFileContentsStep")
  public Step loadFileContentsStep(
      final StepBuilderFactory stepBuilderFactory,
      final LoadFileContentsReader reader,
      final LoadFileContentsProcessor processor,
      final LoadFileContentsWriter writer) {
    return stepBuilderFactory
        .get("loadFileContentsStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Returns the mark blocked pages step.
   *
   * @param stepBuilderFactory the step factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  public Step markBlockedPagesStep(
      final StepBuilderFactory stepBuilderFactory,
      final MarkBlockedPagesReader reader,
      final MarkBlockedPagesProcessor processor,
      final MarkBlockedPagesWriter writer) {
    return stepBuilderFactory
        .get("markBlockedPagesStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Returns the load file details step.
   *
   * @param stepBuilderFactory the step factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  public Step loadFileDetailsStep(
      final StepBuilderFactory stepBuilderFactory,
      final LoadFileDetailsReader reader,
      final LoadFileContentsProcessor processor,
      final LoadFileContentsWriter writer) {
    return stepBuilderFactory
        .get("loadFileDetailsStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Returns the contents processed step.
   *
   * @param stepBuilderFactory the step factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  public Step contentsProcessedStep(
      final StepBuilderFactory stepBuilderFactory,
      final ContentsProcessedReader reader,
      final NoopComicProcessor processor,
      final ContentsProcessedWriter writer) {
    return stepBuilderFactory
        .get("contentsProcessedStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Runs the comic processing job.
   *
   * @param jobLauncher the job launcher
   * @throws JobInstanceAlreadyCompleteException if an error occurs
   * @throws JobExecutionAlreadyRunningException if an error occurs
   * @throws JobParametersInvalidException if an error occurs
   * @throws JobRestartException if an error occurs
   */
  @Scheduled(fixedDelay = 1000)
  public void performJob(
      final JobLauncher jobLauncher, @Qualifier("processComicsJob") Job processComicsJob)
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    jobLauncher.run(
        processComicsJob,
        new JobParametersBuilder()
            .addLong(KEY_STARTED, System.currentTimeMillis())
            .toJobParameters());
  }
}
