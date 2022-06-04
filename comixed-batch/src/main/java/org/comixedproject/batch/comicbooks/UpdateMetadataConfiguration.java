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
import org.comixedproject.batch.comicbooks.processors.UpdateMetadataProcessor;
import org.comixedproject.batch.comicbooks.readers.UpdateMetadataReader;
import org.comixedproject.batch.comicbooks.writers.UpdateMetadataWriter;
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
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * <code>UpdateMetadataConfiguration</code> defines a batch process that updates the metadata within
 * comics.
 *
 * @author Darryl L Pierce
 */
@Configuration
@EnableScheduling
@Log4j2
public class UpdateMetadataConfiguration {
  public static final String JOB_UPDATE_METADATA_STARTED = "job.update-metadata.started";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the job bean to update comic metadata.
   *
   * @param jobBuilderFactory the job builder factory
   * @param updateMetadataStep the update metadata step
   * @return the job
   */
  @Bean
  @Qualifier("updateMetadataJob")
  public Job updateMetadataJob(
      final JobBuilderFactory jobBuilderFactory,
      @Qualifier("updateMetadataStep") final Step updateMetadataStep) {
    return jobBuilderFactory
        .get("updateMetadataJob")
        .incrementer(new RunIdIncrementer())
        .start(updateMetadataStep)
        .build();
  }

  /**
   * The update metadata step.
   *
   * @param stepBuilderFactory the step factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("updateMetadataStep")
  public Step updateMetadataStep(
      final StepBuilderFactory stepBuilderFactory,
      final UpdateMetadataReader reader,
      final UpdateMetadataProcessor processor,
      final UpdateMetadataWriter writer) {
    return stepBuilderFactory
        .get("updateMetadataStep")
        .<ComicBook, ComicBook>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
