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
import org.comixedproject.batch.comicbooks.listeners.*;
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
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * <code>ProcessComicsConfiguration</code> defines the batch process for importing comics.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableScheduling
@Log4j2
public class ProcessComicsConfiguration {
  public static final String JOB_RESCAN_COMICS_START = "job.rescan-comics.started";

  @Value("${batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the process comics job.
   *
   * @param jobBuilderFactory the job factory
   * @param jobListener the job listener
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
      final ProcessComicsJobListener jobListener,
      @Qualifier("loadFileContentsStep") final Step loadFileContentsStep,
      @Qualifier("markBlockedPagesStep") final Step markBlockedPagesStep,
      @Qualifier("loadFileDetailsStep") final Step loadFileDetailsStep,
      @Qualifier("contentsProcessedStep") final Step contentsProcessedStep) {
    return jobBuilderFactory
        .get("processComicsJob")
        .incrementer(new RunIdIncrementer())
        .listener(jobListener)
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
   * @param stepListener the step listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @param chunkListener the chunk listener
   * @return the step
   */
  @Bean
  @Qualifier("loadFileContentsStep")
  public Step loadFileContentsStep(
      final StepBuilderFactory stepBuilderFactory,
      final LoadFileContentsStepListener stepListener,
      final LoadFileContentsReader reader,
      final LoadFileContentsProcessor processor,
      final LoadFileContentsWriter writer,
      final ProcessedComicChunkListener chunkListener) {
    return stepBuilderFactory
        .get("loadFileContentsStep")
        .listener(stepListener)
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }

  /**
   * Returns the mark blocked pages step.
   *
   * @param stepBuilderFactory the step factory
   * @param stepListener the step listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @param chunkListener the chunk listener
   * @return the step
   */
  @Bean
  @Qualifier("markBlockedPagesStep")
  public Step markBlockedPagesStep(
      final StepBuilderFactory stepBuilderFactory,
      final MarkBlockedPagesStepListener stepListener,
      final MarkBlockedPagesReader reader,
      final MarkBlockedPagesProcessor processor,
      final MarkBlockedPagesWriter writer,
      final ProcessedComicChunkListener chunkListener) {
    return stepBuilderFactory
        .get("markBlockedPagesStep")
        .listener(stepListener)
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }

  /**
   * Returns the load file details step.
   *
   * @param stepBuilderFactory the step factory
   * @param stepListener the step listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @param chunkListener the chunk listener
   * @return the step
   */
  @Bean
  @Qualifier("loadFileDetailsStep")
  public Step loadFileDetailsStep(
      final StepBuilderFactory stepBuilderFactory,
      final LoadFileDetailsStepListener stepListener,
      final LoadFileDetailsReader reader,
      final LoadFileDetailsProcessor processor,
      final LoadFileDetailsWriter writer,
      final ProcessedComicChunkListener chunkListener) {
    return stepBuilderFactory
        .get("loadFileDetailsStep")
        .listener(stepListener)
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }

  /**
   * Returns the contents processed step.
   *
   * @param stepBuilderFactory the step factory
   * @param stepListener the step listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer @Param chunkListener the chunk listener
   * @return the step
   */
  @Bean
  @Qualifier("contentsProcessedStep")
  public Step contentsProcessedStep(
      final StepBuilderFactory stepBuilderFactory,
      final ContentsProcessedStepListener stepListener,
      final ContentsProcessedReader reader,
      final NoopComicProcessor processor,
      final ContentsProcessedWriter writer,
      final ProcessedComicChunkListener chunkListener) {
    return stepBuilderFactory
        .get("contentsProcessedStep")
        .listener(stepListener)
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
