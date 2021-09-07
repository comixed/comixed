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
import org.comixedproject.batch.comicbooks.processors.LoadFileDetailsProcessor;
import org.comixedproject.batch.comicbooks.processors.MarkBlockedPagesProcessor;
import org.comixedproject.batch.comicbooks.processors.NoopComicProcessor;
import org.comixedproject.batch.comicbooks.readers.ContentsProcessedReader;
import org.comixedproject.batch.comicbooks.readers.LoadFileContentsReader;
import org.comixedproject.batch.comicbooks.readers.LoadFileDetailsReader;
import org.comixedproject.batch.comicbooks.readers.MarkBlockedPagesReader;
import org.comixedproject.batch.comicbooks.writers.ContentsProcessedWriter;
import org.comixedproject.batch.comicbooks.writers.LoadFileContentsWriter;
import org.comixedproject.batch.comicbooks.writers.LoadFileDetailsWriter;
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
import org.springframework.beans.factory.annotation.Autowired;
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

  @Autowired public JobBuilderFactory jobBuilderFactory;
  @Autowired public StepBuilderFactory stepBuilderFactory;
  @Autowired private JobLauncher jobLauncher;

  @Autowired private LoadFileContentsReader loadFileContentsReader;
  @Autowired private LoadFileContentsProcessor loadFileContentsProcessor;
  @Autowired private LoadFileContentsWriter loadFileContentsWriter;
  @Autowired private MarkBlockedPagesReader markBlockedPagesReader;
  @Autowired private MarkBlockedPagesProcessor markBlockedPagesProcessor;
  @Autowired private MarkBlockedPagesWriter markBlockedPagesWriter;
  @Autowired private LoadFileDetailsReader loadFileDetailsReader;
  @Autowired private LoadFileDetailsProcessor loadFileDetailsProcessor;
  @Autowired private LoadFileDetailsWriter loadFileDetailsWriter;
  @Autowired private ContentsProcessedReader contentsProcessedReader;
  @Autowired private NoopComicProcessor noopComicProcessor;
  @Autowired private ContentsProcessedWriter contentsProcessedWriter;

  @Value("${batch.chunk-size}")
  private int batchChunkSize = 10;

  @Bean
  public Job importComicsJob() {
    return this.jobBuilderFactory
        .get("importComicsJob")
        .incrementer(new RunIdIncrementer())
        .start(loadFileContentsStep())
        .next(markBlockedPagesStep())
        .next(loadFileDetailsStep())
        .next(contentsProcessedStep())
        .build();
  }

  @Bean
  public Step loadFileContentsStep() {
    return this.stepBuilderFactory
        .get("loadFileContentsStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(loadFileContentsReader)
        .processor(loadFileContentsProcessor)
        .writer(loadFileContentsWriter)
        .build();
  }

  @Bean
  public Step markBlockedPagesStep() {
    return this.stepBuilderFactory
        .get("markBlockedPagesStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(markBlockedPagesReader)
        .processor(markBlockedPagesProcessor)
        .writer(markBlockedPagesWriter)
        .build();
  }

  @Bean
  public Step loadFileDetailsStep() {
    return this.stepBuilderFactory
        .get("loadFileDetailsStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(loadFileDetailsReader)
        .processor(loadFileDetailsProcessor)
        .writer(loadFileDetailsWriter)
        .build();
  }

  @Bean
  public Step contentsProcessedStep() {
    return this.stepBuilderFactory
        .get("contentsProcessedStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(contentsProcessedReader)
        .processor(noopComicProcessor)
        .writer(contentsProcessedWriter)
        .build();
  }

  /**
   * Runs the comic processing job.
   *
   * @throws JobInstanceAlreadyCompleteException if an error occurs
   * @throws JobExecutionAlreadyRunningException if an error occurs
   * @throws JobParametersInvalidException if an error occurs
   * @throws JobRestartException if an error occurs
   */
  @Scheduled(fixedDelay = 1000)
  public void performJob()
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    this.jobLauncher.run(
        importComicsJob(),
        new JobParametersBuilder()
            .addLong(KEY_STARTED, System.currentTimeMillis())
            .toJobParameters());
  }
}
