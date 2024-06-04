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

package org.comixedproject.batch.comicpages;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicpages.listeners.MarkBlockedPagesChunkListener;
import org.comixedproject.batch.comicpages.listeners.MarkBlockedPagesJobListener;
import org.comixedproject.batch.comicpages.readers.MarkBlockedPagesReader;
import org.comixedproject.batch.comicpages.writers.MarkBlockedPagesWriter;
import org.comixedproject.batch.processors.NoopProcessor;
import org.comixedproject.model.comicpages.ComicPage;
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
 * <code>MarkBlockedPagesConfiguration</code> defines the batch job for marking pages with a blocked
 * hash for deletion.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class MarkBlockedPagesConfiguration {
  public static final String MARK_BLOCKED_PAGES_JOB = "markBlockedPagesJob";
  public static final String JOB_MARK_BLOCKED_PAGES_STARTED = "job.mark-blocked-pages.started";

  @Value("${comixed.batch.mark-blocked-pages.chunk-size}")
  private int chunkSize = 1;

  /**
   * Returns the mark blocked pages job.
   *
   * @param jobRepository the job repository
   * @param jobListener the job listener
   * @param markBlockedPagesStep the mark blocked pages step
   * @return the job
   */
  @Bean(name = MARK_BLOCKED_PAGES_JOB)
  public Job markBlockedPagesJob(
      final JobRepository jobRepository,
      final MarkBlockedPagesJobListener jobListener,
      @Qualifier("markBlockedPagesStep") final Step markBlockedPagesStep) {
    return new JobBuilder(MARK_BLOCKED_PAGES_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(jobListener)
        .start(markBlockedPagesStep)
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
  @Bean(name = "markBlockedPagesStep")
  public Step markBlockedPagesStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final MarkBlockedPagesReader reader,
      final NoopProcessor<ComicPage> processor,
      final MarkBlockedPagesWriter writer,
      final MarkBlockedPagesChunkListener chunkListener) {
    return new StepBuilder("markBlockedPagesStep", jobRepository)
        .<ComicPage, ComicPage>chunk(this.chunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
