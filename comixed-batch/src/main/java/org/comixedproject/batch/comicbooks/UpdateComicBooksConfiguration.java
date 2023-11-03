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

package org.comixedproject.batch.comicbooks;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicbooks.processors.UpdateComicBooksProcessor;
import org.comixedproject.batch.comicbooks.readers.UpdateComicBooksReader;
import org.comixedproject.batch.comicbooks.writers.UpdateComicBooksWriter;
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
 * <code>UpdateComicBooksConfiguration</code> defines the process for updating the details for
 * multiple comics.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class UpdateComicBooksConfiguration {
  public static final String JOB_UPDATE_COMICBOOKS_STARTED = "job.update-comic.started";
  public static final String JOB_UPDATE_COMICBOOKS_PUBLISHER = "job.update-comic.publisher";
  public static final String JOB_UPDATE_COMICBOOKS_SERIES = "job.update-comic.series";
  public static final String JOB_UPDATE_COMICBOOKS_VOLUME = "job.update-comic.volume";
  public static final String JOB_UPDATE_COMICBOOKS_ISSUENO = "job.update-comic.issue-number";
  public static final String JOB_UPDATE_COMICBOOKS_IMPRINT = "job.update-comic.imprint";
  public static final String JOB_UPDATE_COMICBOOKS_COMIC_TYPE = "job.update-comic.comic-type";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  @Bean
  @Qualifier("updateComicBooksJob")
  public Job updateComicBooksJob(
      final JobRepository jobRepository,
      @Qualifier("updateComicBooksStep") final Step updateComicBooksStep) {
    return new JobBuilder("updateComicBooksJob", jobRepository)
        .incrementer(new RunIdIncrementer())
        .start(updateComicBooksStep)
        .build();
  }

  @Bean
  @Qualifier("updateComicBooksStep")
  public Step updateComicBooksStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final UpdateComicBooksReader reader,
      final UpdateComicBooksProcessor processor,
      final UpdateComicBooksWriter writer) {
    return new StepBuilder("updateComicBooksStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
