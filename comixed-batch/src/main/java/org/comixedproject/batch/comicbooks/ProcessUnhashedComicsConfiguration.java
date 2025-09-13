/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import org.comixedproject.batch.comicbooks.listeners.ProcessUnhashedComicsChunkListener;
import org.comixedproject.batch.comicbooks.listeners.ProcessUnhashedComicsJobListener;
import org.comixedproject.batch.comicbooks.processors.ProcessUnhashedComicsProcessor;
import org.comixedproject.batch.comicbooks.readers.ProcessUnhashedComicsReader;
import org.comixedproject.batch.comicbooks.writers.ProcessUnhashedComicsWriter;
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
 * <code>ProcessUnhashedComicsConfiguration</code> defines a batch job that loads the hashes for
 * comic pages.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class ProcessUnhashedComicsConfiguration {
  public static final String PROCESS_UNHASHED_COMICS_JOB = "processUnhashedComicsJob";
  public static final String PROCESS_UNHASHED_COMICS_STEP = "processUnhashedComicsStep";
  public static final String JOB_PROCESS_UNHASHED_COMICS_STARTED =
      "job.process-unhashed-comics.started";

  @Value("${comixed.batch.load-page-hashes.chunk-size:10}")
  private int chunkSize;

  @Bean(name = PROCESS_UNHASHED_COMICS_JOB)
  public Job loadPageHashesJob(
      final JobRepository jobRepository,
      final ProcessUnhashedComicsJobListener listener,
      @Qualifier(PROCESS_UNHASHED_COMICS_STEP) final Step processUnhashedComicsStep) {
    return new JobBuilder(PROCESS_UNHASHED_COMICS_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(listener)
        .start(processUnhashedComicsStep)
        .build();
  }

  /**
   * Returns the load page hash step.
   *
   * @param jobRepository the step factory
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @param chunkListener the chunk listener
   * @return the step
   */
  @Bean(name = PROCESS_UNHASHED_COMICS_STEP)
  public Step processUnhashedComicsStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final ProcessUnhashedComicsReader reader,
      final ProcessUnhashedComicsProcessor processor,
      final ProcessUnhashedComicsWriter writer,
      final ProcessUnhashedComicsChunkListener chunkListener) {
    return new StepBuilder(PROCESS_UNHASHED_COMICS_STEP, jobRepository)
        .<ComicBook, ComicBook>chunk(this.chunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
