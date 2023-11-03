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
import org.comixedproject.batch.comicbooks.processors.PurgeMarkedComicsProcessor;
import org.comixedproject.batch.comicbooks.processors.RemoveComicBooksWithoutDetailsProcessor;
import org.comixedproject.batch.comicbooks.readers.PurgeMarkedComicsReader;
import org.comixedproject.batch.comicbooks.readers.RemoveComicBooksWithoutDetailsReader;
import org.comixedproject.batch.comicbooks.writers.PurgeMarkedComicBooksWriter;
import org.comixedproject.batch.writers.NoopWriter;
import org.comixedproject.model.comicbooks.ComicBook;
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
 * <code>PurgeLibraryConfiguration</code> defines a batch process that deletes comics that have been
 * marked for purging.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class PurgeLibraryConfiguration {
  public static final String JOB_PURGE_LIBRARY_START = "job.purge-library.started";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the purge library job.
   *
   * @param jobRepository the job repository
   * @param purgeMarkedComicsStep the purge library step
   * @return the job
   */
  @Bean
  @Qualifier("purgeLibraryJob")
  public Job purgeLibraryJob(
      final JobRepository jobRepository,
      @Qualifier("purgeMarkedComicsStep") final Step purgeMarkedComicsStep,
      @Qualifier("removeComicBooksWithoutDetailsStep") final Step removeMalformedComicBooksStep) {
    return new JobBuilder("purgeLibraryJob", jobRepository)
        .incrementer(new RunIdIncrementer())
        .start(removeMalformedComicBooksStep)
        .next(purgeMarkedComicsStep)
        .build();
  }

  /**
   * Returns the remove malformed comics step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("removeComicBooksWithoutDetailsStep")
  public Step removeComicBooksWithoutDetailsStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final RemoveComicBooksWithoutDetailsReader reader,
      final RemoveComicBooksWithoutDetailsProcessor processor,
      final NoopWriter<ComicBook> writer) {
    return new StepBuilder("removeComicBooksWithoutDetailsStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Returns the purge marked comics step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("purgeMarkedComicsStep")
  public Step purgeMarkedComicsStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final PurgeMarkedComicsReader reader,
      final PurgeMarkedComicsProcessor processor,
      final PurgeMarkedComicBooksWriter writer) {
    return new StepBuilder("purgeMarkedComicsStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
