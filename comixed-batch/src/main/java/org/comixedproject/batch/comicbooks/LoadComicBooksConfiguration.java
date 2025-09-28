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
import org.comixedproject.batch.comicbooks.processors.*;
import org.comixedproject.batch.comicbooks.readers.*;
import org.comixedproject.batch.comicbooks.writers.*;
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
 * <code>LoadComicBooksConfiguration</code> defines the batch process for importing comics.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class LoadComicBooksConfiguration {
  public static final String LOAD_COMIC_BOOKS_JOB = "loadComicBooksJob";
  public static final String LOAD_COMIC_BOOKS_JOB_STARTED = "job.load-comic-books.time-started";

  @Value("${comixed.batch.load-comic-books.chunk-size:10}")
  private int chunkSize;

  /**
   * Returns the process comics job.
   *
   * @param jobRepository the job repository
   * @param jobListener the job listener
   * @param loadFileContentsStep the load file contents step
   * @return the job
   */
  @Bean(name = LOAD_COMIC_BOOKS_JOB)
  public Job loadComicBooksJob(
      final JobRepository jobRepository,
      final LoadComicBooksJobListener jobListener,
      @Qualifier("loadFileContentsStep") final Step loadFileContentsStep) {
    return new JobBuilder(LOAD_COMIC_BOOKS_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(jobListener)
        .start(loadFileContentsStep)
        .build();
  }

  /**
   * Returns the load file contents step.
   *
   * @param jobRepository the step factory
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @param chunkListener the chunk listener
   * @return the step
   */
  @Bean(name = "loadFileContentsStep")
  public Step loadFileContentsStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final LoadFileContentsReader reader,
      final LoadFileContentsProcessor processor,
      final LoadFileContentsWriter writer,
      final LoadFileContentsChunkListener chunkListener) {
    return new StepBuilder("loadFileContentsStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.chunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
