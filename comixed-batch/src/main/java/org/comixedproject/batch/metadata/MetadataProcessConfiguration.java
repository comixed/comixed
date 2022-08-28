/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.metadata;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.metadata.listeners.ScrapeComicBookChunkListener;
import org.comixedproject.batch.metadata.listeners.UpdateComicBookMetadataJobListener;
import org.comixedproject.batch.metadata.processors.ScrapeComicBookProcessor;
import org.comixedproject.batch.metadata.readers.ScrapeComicBookReader;
import org.comixedproject.batch.metadata.writers.ScrapeComicBookWriter;
import org.comixedproject.model.comicbooks.ComicBook;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * <code>MetadataProcessConfiguration</code> provides a batch configuration for scraping comics.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class MetadataProcessConfiguration {
  public static final String PARAM_METADATA_UPDATE_STARTED = "job.metadata-process.started";
  public static final String PARAM_METADATA_UPDATE_FINISHED = "job.metadata-process.finished";
  public static final String PARAM_SKIP_CACHE = "job.metadata-process.skip-cache";
  public static final String PARAM_METADATA_UPDATE_TOTAL_COMICS =
      "job.metadata-process.total-comics";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the job bean to perform the batch comic scraping process.
   *
   * @param jobBuilderFactory the job builder factory
   * @param scrapeComicBook the scrape comic stet
   * @return the job
   */
  @Bean
  @Qualifier("updateComicBookMetadata")
  public Job updateComicBookMetadata(
      final JobBuilderFactory jobBuilderFactory,
      final UpdateComicBookMetadataJobListener jobListener,
      @Qualifier("scrapeComicBook") final Step scrapeComicBook) {
    return jobBuilderFactory
        .get("updateComicBookMetadata")
        .listener(jobListener)
        .start(scrapeComicBook)
        .build();
  }

  /**
   * The scrape comic book step.
   *
   * @param stepBuilderFactory the step builder factory
   * @param reader the step reader
   * @param processor the step processor
   * @param writer the step writer
   * @return the step
   */
  @Bean
  @Qualifier("scrapeComicBook")
  public Step scrapeComicBook(
      final StepBuilderFactory stepBuilderFactory,
      final ScrapeComicBookChunkListener listener,
      final ScrapeComicBookReader reader,
      final ScrapeComicBookProcessor processor,
      final ScrapeComicBookWriter writer) {
    return stepBuilderFactory
        .get("scrapeComicBook")
        .<ComicBook, ComicBook>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(listener)
        .build();
  }
}
