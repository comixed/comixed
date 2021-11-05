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
import org.comixedproject.batch.comicbooks.listeners.AddComicsToLibraryJobListener;
import org.comixedproject.batch.comicbooks.listeners.CreateInsertStepExecutionListener;
import org.comixedproject.batch.comicbooks.listeners.ProcessedComicChunkListener;
import org.comixedproject.batch.comicbooks.processors.ComicInsertProcessor;
import org.comixedproject.batch.comicbooks.processors.NoopComicProcessor;
import org.comixedproject.batch.comicbooks.readers.ComicFileDescriptorReader;
import org.comixedproject.batch.comicbooks.readers.RecordInsertedReader;
import org.comixedproject.batch.comicbooks.writers.ComicInsertWriter;
import org.comixedproject.batch.comicbooks.writers.ReaderInsertedWriter;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * <code>AddComicsConfiguration</code> defines the batch process for adding comics to the library.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class AddComicsConfiguration {
  public static final String PARAM_ADD_COMICS_STARTED = "job.add-comics.started";

  @Value("${batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the add comics batch job.
   *
   * @param jobBuilderFactory the job factory
   * @param jobListener the job listener
   * @param createInsertStep the insert step
   * @param recordInsertedStep the post-insert step
   * @param processComicsJobStep the process comics job launch step
   * @return the job
   */
  @Bean
  @Qualifier("addComicsToLibraryJob")
  public Job addComicsToLibraryJob(
      final JobBuilderFactory jobBuilderFactory,
      final AddComicsToLibraryJobListener jobListener,
      @Qualifier("createInsertStep") final Step createInsertStep,
      @Qualifier("recordInsertedStep") Step recordInsertedStep,
      @Qualifier("processComicsJobStep") Step processComicsJobStep) {
    return jobBuilderFactory
        .get("addComicsToLibraryJob")
        .incrementer(new RunIdIncrementer())
        .listener(jobListener)
        .start(createInsertStep)
        .next(recordInsertedStep)
        .next(processComicsJobStep)
        .build();
  }

  /**
   * Returns the insert step.
   *
   * @param stepBuilderFactory the step factory
   * @param stepExecutionListener the step listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("createInsertStep")
  public Step createInsertStep(
      final StepBuilderFactory stepBuilderFactory,
      final CreateInsertStepExecutionListener stepExecutionListener,
      final ComicFileDescriptorReader reader,
      final ComicInsertProcessor processor,
      final ComicInsertWriter writer) {
    return stepBuilderFactory
        .get("createInsertStep")
        .listener(stepExecutionListener)
        .<ComicFileDescriptor, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Returns the record inserted step.
   *
   * @param stepBuilderFactory the step factory
   * @param chunkListener the chunk listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("recordInsertedStep")
  public Step recordInsertedStep(
      final StepBuilderFactory stepBuilderFactory,
      final ProcessedComicChunkListener chunkListener,
      final RecordInsertedReader reader,
      final NoopComicProcessor processor,
      final ReaderInsertedWriter writer) {
    return stepBuilderFactory
        .get("recordInsertedStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
