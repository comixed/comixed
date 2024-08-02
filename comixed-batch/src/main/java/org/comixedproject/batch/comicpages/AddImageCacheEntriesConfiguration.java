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
import org.comixedproject.batch.comicpages.processors.CreateImageCacheEntriesProcessor;
import org.comixedproject.batch.comicpages.readers.CreateImageCacheEntriesReader;
import org.comixedproject.batch.comicpages.writers.CreateImageCacheEntriesWriter;
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
 * <code>AddImageCacheEntriesConfiguration</code> defines a batch process that periodically creates
 * image cache entries for comic pages that do not have one.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class AddImageCacheEntriesConfiguration {
  public static final String PARAM_ADD_IMAGE_CACHE_ENTRIES_STARTED =
      "job.add-image-cache-entries.start";

  @Value("${comixed.batch.add-image-cache-entries.chunk-size:1}")
  private int chunkSize;

  /**
   * Returns a job bean to added pages to the image cache.
   *
   * @param jobRepository the job repository
   * @param createImageCacheEntriesStep the generate thumbnail step
   * @return the job
   */
  @Bean(name = "addPageToImageCacheJob")
  public Job addPageToImageCacheJob(
      final JobRepository jobRepository,
      @Qualifier("createImageCacheEntriesStep") final Step createImageCacheEntriesStep) {
    return new JobBuilder("addPageToImageCacheJob", jobRepository)
        .incrementer(new RunIdIncrementer())
        .start(createImageCacheEntriesStep)
        .next(createImageCacheEntriesStep)
        .build();
  }

  /**
   * The generate image cache entries step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean(name = "createImageCacheEntriesStep")
  public Step createImageCacheEntriesStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final CreateImageCacheEntriesReader reader,
      final CreateImageCacheEntriesProcessor processor,
      final CreateImageCacheEntriesWriter writer) {
    return new StepBuilder("createImageCacheEntriesStep", jobRepository)
        .<ComicPage, String>chunk(this.chunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
