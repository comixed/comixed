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
import org.comixedproject.batch.comicbooks.processors.DeleteComicProcessor;
import org.comixedproject.batch.comicbooks.processors.DeleteEmptyDirectoriesProcessor;
import org.comixedproject.batch.comicbooks.processors.MoveComicProcessor;
import org.comixedproject.batch.comicbooks.readers.DeleteComicReader;
import org.comixedproject.batch.comicbooks.readers.DeleteEmptyDirectoriesReader;
import org.comixedproject.batch.comicbooks.readers.MoveComicReader;
import org.comixedproject.batch.comicbooks.writers.MoveComicWriter;
import org.comixedproject.batch.comicbooks.writers.PurgeMarkedComicsWriter;
import org.comixedproject.batch.writers.NoopWriter;
import org.comixedproject.model.comicbooks.Comic;
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
 * <code>ConsolidationConfiguration</code> defines the consolidation batch process.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class ConsolidationConfiguration {
  public static final String PARAM_CONSOLIDATION_JOB_STARTED = "job.consolidation.time-started";
  public static final String PARAM_DELETE_REMOVED_COMIC_FILES =
      "job.consolidation.delete-removed-comic-files";
  public static final String PARAM_TARGET_DIRECTORY = "job.consolidation.target-directory";
  public static final String PARAM_RENAMING_RULE = "job.consolidation.renaming-rule";

  @Value("${batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns a consolidate library job bean.
   *
   * @param jobBuilderFactory the job builder factory
   * @param deleteComicStep the delete comics step
   * @param moveComicStep the move comics step
   * @return the job
   */
  @Bean
  @Qualifier("consolidateLibraryJob")
  public Job consolidateLibraryJob(
      final JobBuilderFactory jobBuilderFactory,
      @Qualifier("deleteComicStep") final Step deleteComicStep,
      @Qualifier("moveComicStep") final Step moveComicStep,
      @Qualifier("deleteEmptyDirectoriesStep") final Step deleteEmptyDirectoriesStep) {
    return jobBuilderFactory
        .get("consolidateLibraryJob")
        .incrementer(new RunIdIncrementer())
        .start(deleteComicStep)
        .next(moveComicStep)
        .next(deleteEmptyDirectoriesStep)
        .build();
  }

  /**
   * Returns a delete comic step bean.
   *
   * @param stepBuilderFactory the step builder factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("deleteComicStep")
  public Step deleteComicStep(
      final StepBuilderFactory stepBuilderFactory,
      final DeleteComicReader reader,
      final DeleteComicProcessor processor,
      final PurgeMarkedComicsWriter writer) {
    return stepBuilderFactory
        .get("deleteComicStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Returns the move comic step bean.
   *
   * @param stepBuilderFactory the step builder factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("moveComicStep")
  public Step moveComicStep(
      final StepBuilderFactory stepBuilderFactory,
      final MoveComicReader reader,
      final MoveComicProcessor processor,
      final MoveComicWriter writer) {
    return stepBuilderFactory
        .get("moveComicStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }

  /**
   * Deletes any empty directory under the library root.
   *
   * @param stepBuilderFactory the step builder factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("deleteEmptyDirectoriesStep")
  public Step deleteEmptyDirectoriesStep(
      final StepBuilderFactory stepBuilderFactory,
      final DeleteEmptyDirectoriesReader reader,
      final DeleteEmptyDirectoriesProcessor processor,
      final NoopWriter<Void> writer) {
    return stepBuilderFactory
        .get("deleteEmptyDirectoriesStep")
        .<File, Void>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
