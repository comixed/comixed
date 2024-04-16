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
import org.comixedproject.batch.comicbooks.listeners.AddedComicBookChunkListener;
import org.comixedproject.batch.comicbooks.listeners.AddedComicBookJobListener;
import org.comixedproject.batch.comicbooks.listeners.CreateInsertStepExecutionListener;
import org.comixedproject.batch.comicbooks.processors.ComicInsertProcessor;
import org.comixedproject.batch.comicbooks.processors.NoopComicProcessor;
import org.comixedproject.batch.comicbooks.readers.ComicInsertReader;
import org.comixedproject.batch.comicbooks.readers.RecordInsertedReader;
import org.comixedproject.batch.comicbooks.writers.ComicInsertWriter;
import org.comixedproject.batch.comicbooks.writers.ReaderInsertedWriter;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * <code>AddComicsConfiguration</code> defines the batch process for adding comics to the library.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class AddComicsConfiguration {
  public static final String PARAM_ADD_COMICS_STARTED = "job.add-comics.started";
  public static final String PARAM_SKIP_METADATA = "job.add-comics.skip-metadata";
  public static final String PARAM_SKIP_BLOCKING_PAGES = "job.add-comics.skip-blocking-pages";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the add comics batch job.
   *
   * @param jobRepository the job repository
   * @param jobListener the job listener
   * @param createInsertStep the insert step
   * @param recordInsertedStep the post-insert step
   * @param processComicBooksJobStep the process comics job launch step
   * @return the job
   */
  @Bean(name = "addComicsToLibraryJob")
  public Job addComicsToLibraryJob(
      final AddedComicBookJobListener jobListener,
      final JobRepository jobRepository,
      @Qualifier("createInsertStep") final Step createInsertStep,
      @Qualifier("recordInsertedStep") Step recordInsertedStep,
      @Qualifier("processComicBooksJobStep") Step processComicBooksJobStep) {
    return new JobBuilder("addComicsToLibraryJob", jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(jobListener)
        .start(createInsertStep)
        .next(recordInsertedStep)
        .next(processComicBooksJobStep)
        .build();
  }

  /**
   * Returns the insert step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param stepExecutionListener the step listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean(name = "createInsertStep")
  public Step createInsertStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final CreateInsertStepExecutionListener stepExecutionListener,
      final ComicInsertReader reader,
      final ComicInsertProcessor processor,
      final ComicInsertWriter writer,
      final AddedComicBookChunkListener chunkListener) {
    return new StepBuilder("createInsertStep", jobRepository)
        .listener(stepExecutionListener)
        .<ComicFileDescriptor, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }

  /**
   * Returns the record inserted step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param chunkListener the chunk listener
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean(name = "recordInsertedStep")
  public Step recordInsertedStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final AddedComicBookChunkListener chunkListener,
      final RecordInsertedReader reader,
      final NoopComicProcessor processor,
      final ReaderInsertedWriter writer) {
    return new StepBuilder("recordInsertedStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
