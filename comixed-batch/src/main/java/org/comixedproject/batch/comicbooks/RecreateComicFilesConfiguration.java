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
import org.comixedproject.batch.comicbooks.processors.RecreateComicFileProcessor;
import org.comixedproject.batch.comicbooks.readers.RecreateComicFileReader;
import org.comixedproject.batch.comicbooks.writers.RecreateComicFileWriter;
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
 * <code>RecreateComicFilesConfiguration</code> defines the process for recreating comic files.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class RecreateComicFilesConfiguration {
  public static final String JOB_RECREATE_COMICS_STARTED = "job.recreate-comic.started";
  public static final String JOB_TARGET_ARCHIVE = "job.recreate-comic.target-archive";
  public static final String JOB_DELETE_MARKED_PAGES = "job.recreate-comic.delete-blocked-pages";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  @Bean
  @Qualifier("recreateComicFilesJob")
  public Job recreateComicFilesJob(
      final JobRepository jobRepository,
      @Qualifier("recreateComicFileStep") final Step recreateComicFileStep,
      @Qualifier("processComicsJobStep") final Step processComicsJobStep) {
    return new JobBuilder("recreateComicFilesJob", jobRepository)
        .incrementer(new RunIdIncrementer())
        .start(recreateComicFileStep)
        .next(processComicsJobStep)
        .build();
  }

  @Bean
  @Qualifier("recreateComicFileStep")
  public Step recreateComicFileStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final RecreateComicFileReader reader,
      final RecreateComicFileProcessor processor,
      final RecreateComicFileWriter writer) {
    return new StepBuilder("recreateComicFileStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
