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
import org.comixedproject.batch.comicbooks.listeners.CreateComicBookChunkListener;
import org.comixedproject.batch.comicbooks.listeners.ImportComicFilesJobListener;
import org.comixedproject.batch.comicbooks.listeners.RecordInsertedChunkListener;
import org.comixedproject.batch.comicbooks.processors.CreateComicBookProcessor;
import org.comixedproject.batch.comicbooks.processors.NoopComicProcessor;
import org.comixedproject.batch.comicbooks.readers.CreateComicBookReader;
import org.comixedproject.batch.comicbooks.readers.RecordInsertedReader;
import org.comixedproject.batch.comicbooks.writers.CreateComicBookWriter;
import org.comixedproject.batch.comicbooks.writers.RecordInsertedWriter;
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
 * <code>ImportComicFilesConfiguration</code> defines the batch process for importing comic files to
 * the library.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class ImportComicFilesConfiguration {
  public static final String IMPORT_COMIC_FILES_JOB = "importComicFilesJob";
  public static final String IMPORT_COMIC_FILES_JOB_STARTED = "job.import-comic-files.started";
  public static final String PARAM_SKIP_METADATA = "job.import-comic-files.skip-metadata";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the add comics batch job.
   *
   * @param jobRepository the job repository
   * @param jobListener the job listener
   * @param createComicBookStep the insert step
   * @param recordInsertedStep the post-insert step
   * @return the job
   */
  @Bean(name = IMPORT_COMIC_FILES_JOB)
  public Job importComicFilesJob(
      final ImportComicFilesJobListener jobListener,
      final JobRepository jobRepository,
      @Qualifier("createComicBookStep") final Step createComicBookStep,
      @Qualifier("recordInsertedStep") Step recordInsertedStep) {
    return new JobBuilder(IMPORT_COMIC_FILES_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(jobListener)
        .start(createComicBookStep)
        .next(recordInsertedStep)
        .build();
  }

  /**
   * Returns the insert step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean(name = "createComicBookStep")
  public Step createComicBookStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final CreateComicBookReader reader,
      final CreateComicBookProcessor processor,
      final CreateComicBookWriter writer,
      final CreateComicBookChunkListener chunkListener) {
    return new StepBuilder("createComicBookStep", jobRepository)
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
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @param chunkListener the chunk listener
   * @return the step
   */
  @Bean(name = "recordInsertedStep")
  public Step recordInsertedStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final RecordInsertedReader reader,
      final NoopComicProcessor processor,
      final RecordInsertedWriter writer,
      final RecordInsertedChunkListener chunkListener) {
    return new StepBuilder("recordInsertedStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
