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
import org.comixedproject.batch.comicbooks.listeners.UpdateMetadataChunkListener;
import org.comixedproject.batch.comicbooks.listeners.UpdateMetadataJobListener;
import org.comixedproject.batch.comicbooks.processors.UpdateMetadataProcessor;
import org.comixedproject.batch.comicbooks.readers.UpdateMetadataReader;
import org.comixedproject.batch.comicbooks.writers.UpdateMetadataWriter;
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
 * <code>UpdateMetadataConfiguration</code> defines a batch process that updates the metadata within
 * comics.
 *
 * @author Darryl L Pierce
 */
@Configuration
@Log4j2
public class UpdateMetadataConfiguration {
  public static final String UPDATE_METADATA_JOB = "updateMetadataJob";
  public static final String UPDATE_METADATA_JOB_TIME_STARTED = "job.update-metadata.time-started";

  @Value("${comixed.batch.update-metadata.chunk-size:10}")
  private int chunkSize;

  /**
   * Returns the job bean to update comic metadata.
   *
   * @param jobRepository the job repository
   * @param updateMetadataStep the update metadata step
   * @return the job
   */
  @Bean(name = UPDATE_METADATA_JOB)
  public Job updateMetadataJob(
      final JobRepository jobRepository,
      final UpdateMetadataJobListener listener,
      @Qualifier("updateMetadataStep") final Step updateMetadataStep) {
    return new JobBuilder(UPDATE_METADATA_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(listener)
        .start(updateMetadataStep)
        .build();
  }

  /**
   * The update metadata step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean(name = "updateMetadataStep")
  public Step updateMetadataStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final UpdateMetadataReader reader,
      final UpdateMetadataProcessor processor,
      final UpdateMetadataWriter writer,
      final UpdateMetadataChunkListener listener) {
    return new StepBuilder(UPDATE_METADATA_JOB, jobRepository)
        .<ComicBook, ComicBook>chunk(this.chunkSize)
        .transactionManager(platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(listener)
        .build();
  }
}
