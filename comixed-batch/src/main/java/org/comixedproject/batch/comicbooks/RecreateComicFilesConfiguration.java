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
import org.comixedproject.batch.comicbooks.listeners.RecreateComicFileChunkListener;
import org.comixedproject.batch.comicbooks.listeners.RecreatingComicFilesJobListener;
import org.comixedproject.batch.comicbooks.processors.RecreateComicFileProcessor;
import org.comixedproject.batch.comicbooks.readers.RecreateComicFileReader;
import org.comixedproject.batch.comicbooks.writers.RecreateComicFileWriter;
import org.comixedproject.model.comicbooks.ComicBook;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.job.DefaultJobParametersExtractor;
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
  public static final String RECREATE_COMIC_FILES_JOB = "recreateComicFilesJob";
  public static final String RECREATE_COMIC_FILES_JOB_TIME_STARTED =
      "job.recreate-comic.time-started";

  @Value("${comixed.batch.recreate-comic-files.chunk-size:1}")
  private int chunkSize;

  @Bean(name = RECREATE_COMIC_FILES_JOB)
  public Job recreateComicFilesJob(
      final JobRepository jobRepository,
      final RecreatingComicFilesJobListener listener,
      @Qualifier("recreateComicFileStep") final Step recreateComicFileStep,
      @Qualifier("loadComicBooksStep") final Step loadComicBooksStep) {
    return new JobBuilder(RECREATE_COMIC_FILES_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .listener(listener)
        .start(recreateComicFileStep)
        .next(loadComicBooksStep)
        .build();
  }

  @Bean(name = "recreateComicFileStep")
  public Step recreateComicFileStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final RecreateComicFileReader reader,
      final RecreateComicFileProcessor processor,
      final RecreateComicFileWriter writer,
      final RecreateComicFileChunkListener listener) {
    return new StepBuilder("recreateComicFileStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.chunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .listener(listener)
        .build();
  }

  @Bean(name = "loadComicBooksStep")
  public Step loadComicBooksStep(
      final JobRepository jobRepository,
      final @Qualifier("loadComicBooksJob") Job loadComicBooksJob,
      final @Qualifier("batchJobLauncher") JobLauncher jobLauncher) {
    return new StepBuilder("loadComicBooksStep", jobRepository)
        .job(loadComicBooksJob)
        .parametersExtractor(new DefaultJobParametersExtractor())
        .launcher(jobLauncher)
        .build();
  }
}
