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
import org.comixedproject.batch.comicbooks.readers.PurgeMarkedComicsReader;
import org.comixedproject.batch.comicbooks.writers.PurgeMarkedComicBooksWriter;
import org.comixedproject.model.comicbooks.ComicBook;
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
   * @param jobBuilderFactory the job factory
   * @param purgeMarkedComicsStep the purge library step
   * @return the job
   */
  @Bean
  @Qualifier("purgeLibraryJob")
  public Job purgeLibraryJob(
      final JobBuilderFactory jobBuilderFactory,
      @Qualifier("purgeMarkedComicsStep") final Step purgeMarkedComicsStep) {
    return jobBuilderFactory
        .get("purgeLibraryJob")
        .incrementer(new RunIdIncrementer())
        .start(purgeMarkedComicsStep)
        .build();
  }

  /**
   * Returns the purge marked comics step.
   *
   * @param stepBuilderFactory the step factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("purgeMarkedComicsStep")
  public Step purgeMarkedComicsStep(
      final StepBuilderFactory stepBuilderFactory,
      final PurgeMarkedComicsReader reader,
      final PurgeMarkedComicsProcessor processor,
      final PurgeMarkedComicBooksWriter writer) {
    return stepBuilderFactory
        .get("purgeMarkedComicsStep")
        .<ComicBook, ComicBook>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
