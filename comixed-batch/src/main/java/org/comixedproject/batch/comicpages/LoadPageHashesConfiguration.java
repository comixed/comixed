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
import org.comixedproject.batch.comicpages.listeners.LoadPageHashChunkListener;
import org.comixedproject.batch.comicpages.listeners.LoadPageHashesJobListener;
import org.comixedproject.batch.comicpages.processors.LoadPageHashProcessor;
import org.comixedproject.batch.comicpages.readers.LoadPageHashReader;
import org.comixedproject.batch.comicpages.writers.LoadPageHashWriter;
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
 * <code>LoadPageHashesConfiguration</code> defines a batch job that loads the hashes for comic
 * pages.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class LoadPageHashesConfiguration {
  public static final String JOB_LOAD_PAGE_HASHES_STARTED = "job.load-page-hashes.started";
  public static final String LOAD_PAGE_HASHES_JOB = "loadPageHashesJob";

  @Value("${comixed.batch.load-page-hashes.chunk-size:10}")
  private int chunkSize;

  @Bean(name = LOAD_PAGE_HASHES_JOB)
  public Job loadPageHashesJob(
      final JobRepository jobRepository,
      final LoadPageHashesJobListener listener,
      @Qualifier("loadPageHashStep") final Step loadPageHashStep) {
    return new JobBuilder(LOAD_PAGE_HASHES_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(listener)
        .start(loadPageHashStep)
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
  @Bean(name = "loadPageHashStep")
  public Step loadPageHashStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final LoadPageHashReader reader,
      final LoadPageHashProcessor processor,
      final LoadPageHashWriter writer,
      final LoadPageHashChunkListener chunkListener) {
    return new StepBuilder("loadPageHashStep", jobRepository)
        .<ComicPage, ComicPage>chunk(this.chunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
