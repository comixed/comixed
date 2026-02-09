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
import org.comixedproject.batch.comicbooks.listeners.ScrapeMetadataChunkListener;
import org.comixedproject.batch.comicbooks.listeners.ScrapeMetadataJobListener;
import org.comixedproject.batch.comicbooks.processors.ScrapeMetadataProcessor;
import org.comixedproject.batch.comicbooks.readers.ScrapeMetadataReader;
import org.comixedproject.batch.comicbooks.writers.ScrapeMetadataWriter;
import org.comixedproject.model.comicbooks.ComicBook;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.job.parameters.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * <code>ScrapeMetadataConfiguration</code> defines a batch process that scrapes comic book metadata
 * in the background.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class ScrapeMetadataConfiguration {
  public static final String SCRAPE_METADATA_JOB = "scrapeMetadataJob";
  public static final String SCRAPE_METADATA_JOB_TIME_STARTED = "job.scrape-metadata.time-started";
  public static final String SCRAPE_METADATA_JOB_ERROR_THRESHOLD =
      "job.scrape-metadata.error-threshold";
  public static final String SCRAPE_METADATA_STEP = "scrape-metadata-step";

  @Value("${comixed.batch.scrape-metadata.chunk-size:10}")
  private int chunkSize;

  /**
   * Returns the scrape metadata job.
   *
   * @param jobRepository the job repository
   * @param jobListener the job listener
   * @param scrapeMetadataStep the scrape metadata step
   * @return the job
   */
  @Bean(name = SCRAPE_METADATA_JOB)
  public Job scrapeMetadataJob(
      final JobRepository jobRepository,
      final ScrapeMetadataJobListener jobListener,
      @Qualifier("scrapeMetadataStep") final Step scrapeMetadataStep) {
    return new JobBuilder(SCRAPE_METADATA_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(jobListener)
        .start(scrapeMetadataStep)
        .build();
  }

  /**
   * Returns the scrape metadata step.
   *
   * @param jobRepository the step factory
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @param chunkListener the chunk listener
   * @return the step
   */
  @Bean(name = "scrapeMetadataStep")
  public Step scrapeMetadataStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final ScrapeMetadataReader reader,
      final ScrapeMetadataProcessor processor,
      final ScrapeMetadataWriter writer,
      final ScrapeMetadataChunkListener chunkListener) {
    return new StepBuilder("scrapeMetadataStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.chunkSize)
        .transactionManager(platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(chunkListener)
        .build();
  }
}
