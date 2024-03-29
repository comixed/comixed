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

import java.io.File;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicbooks.processors.DeleteComicBookProcessor;
import org.comixedproject.batch.comicbooks.processors.DeleteEmptyDirectoriesProcessor;
import org.comixedproject.batch.comicbooks.processors.MoveComicProcessor;
import org.comixedproject.batch.comicbooks.readers.DeleteComicReader;
import org.comixedproject.batch.comicbooks.readers.DeleteEmptyDirectoriesReader;
import org.comixedproject.batch.comicbooks.readers.MoveComicReader;
import org.comixedproject.batch.comicbooks.writers.MoveComicBookWriter;
import org.comixedproject.batch.comicbooks.writers.PurgeMarkedComicBooksWriter;
import org.comixedproject.batch.writers.NoopWriter;
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
 * <code>LibraryOrganizationConfiguration</code> defines the organization batch process.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class LibraryOrganizationConfiguration {
  public static final String JOB_ORGANIZATION_TIME_STARTED = "job.organization.time-started";
  public static final String JOB_ORGANIZATION_DELETE_REMOVED_COMIC_FILES =
      "job.organization.delete-removed-comic-files";
  public static final String JOB_ORGANIZATION_TARGET_DIRECTORY =
      "job.organization.target-directory";
  public static final String JOB_ORGANIZATION_RENAMING_RULE = "job.organization.renaming-rule";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns a library organization job bean.
   *
   * @param jobRepository the job repository
   * @param deleteComicBookStep the delete comics step
   * @param moveComicStep the move comics step
   * @param deleteEmptyDirectoriesStep the delete empty directories step
   * @return the job
   */
  @Bean
  @Qualifier("organizeLibraryJob")
  public Job organizeLibraryJob(
      final JobRepository jobRepository,
      @Qualifier("deleteComicBookStep") final Step deleteComicBookStep,
      @Qualifier("moveComicStep") final Step moveComicStep,
      @Qualifier("deleteEmptyDirectoriesStep") final Step deleteEmptyDirectoriesStep) {
    return new JobBuilder("organizeLibraryJob", jobRepository)
        .incrementer(new RunIdIncrementer())
        .start(deleteComicBookStep)
        .next(moveComicStep)
        .next(deleteEmptyDirectoriesStep)
        .build();
  }

  /**
   * Returns a delete comic step bean.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("deleteComicBookStep")
  public Step deleteComicBookStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final DeleteComicReader reader,
      final DeleteComicBookProcessor processor,
      final PurgeMarkedComicBooksWriter writer) {
    return new StepBuilder("deleteComicBookStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Returns the move comic step bean.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("moveComicStep")
  public Step moveComicStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final MoveComicReader reader,
      final MoveComicProcessor processor,
      final MoveComicBookWriter writer) {
    return new StepBuilder("moveComicStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Deletes any empty directory under the library root.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("deleteEmptyDirectoriesStep")
  public Step deleteEmptyDirectoriesStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final DeleteEmptyDirectoriesReader reader,
      final DeleteEmptyDirectoriesProcessor processor,
      final NoopWriter<Void> writer) {
    return new StepBuilder("deleteEmptyDirectoriesStep", jobRepository)
        .<File, Void>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
