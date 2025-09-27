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
import org.comixedproject.batch.comicbooks.processors.EditComicMetadataProcessor;
import org.comixedproject.batch.comicbooks.readers.EditComicMetadataReader;
import org.comixedproject.batch.comicbooks.writers.EditComicMetadataWriter;
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
 * <code>EditComicBookMetadataConfiguration</code> defines the process for editing the metadata for
 * multiple comics.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class EditComicBookMetadataConfiguration {
  public static final String EDIT_COMIC_METADATA_JOB = "editComicMetadataJob";
  public static final String EDIT_COMIC_METADATA_JOB_TIME_STARTED =
      "job.edit-comic-metadata.time-started";
  public static final String EDIT_COMIC_METADATA_JOB_PUBLISHER =
      "job.edit-comic-metadata.publisher";
  public static final String EDIT_COMIC_METADATA_JOB_SERIES = "job.edit-comic-metadata.series";
  public static final String EDIT_COMIC_METADATA_JOB_VOLUME = "job.edit-comic-metadata.volume";
  public static final String EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER =
      "job.edit-comic-metadata.issue-number";
  public static final String EDIT_COMIC_METADATA_JOB_IMPRINT = "job.edit-comic-metadata.imprint";
  public static final String EDIT_COMIC_METADATA_JOB_COMIC_TYPE =
      "job.edit-comic-metadata.comic-type";

  @Value("${comixed.batch.update-comic-metadata.chunk-size:1}")
  private int chunkSize;

  @Bean(name = EDIT_COMIC_METADATA_JOB)
  public Job editComicMetadataJob(
      final JobRepository jobRepository,
      @Qualifier("editComicMetadataStep") final Step editComicMetadataStep) {
    return new JobBuilder(EDIT_COMIC_METADATA_JOB, jobRepository)
        .incrementer(new RunIdIncrementer())
        .start(editComicMetadataStep)
        .build();
  }

  @Bean(name = "editComicMetadataStep")
  public Step editComicMetadataStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final EditComicMetadataReader reader,
      final EditComicMetadataProcessor processor,
      final EditComicMetadataWriter writer) {
    return new StepBuilder("editComicMetadataStep", jobRepository)
        .<ComicBook, ComicBook>chunk(this.chunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
