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

package org.comixedproject.batch.comicpages;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicpages.readers.MarkPageWithHashReader;
import org.comixedproject.batch.comicpages.writers.MarkPageWithHashWriter;
import org.comixedproject.batch.processors.NoopProcessor;
import org.comixedproject.model.comicpages.Page;
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
 * <code>MarkPagesWithHashConfiguration</code> defines a process that marks all pages with a given
 * hash for deletion.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class MarkPagesWithHashConfiguration {
  public static final String PARAM_MARK_PAGES_WITH_HASH_STARTED =
      "job.delete-pages-with-hash.started";
  public static final String PARAM_MARK_PAGES_TARGET_HASH =
      "job.delete-pages-with-hash.target-hash";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the job bean to delete pages with a hash.
   *
   * @param jobRepository the job repository
   * @param markPageWithHashStep the mark pages with hash step
   * @return the job
   */
  @Bean(name = "markPagesWithHashJob")
  public Job markPagesWithHashJob(
      final JobRepository jobRepository,
      @Qualifier("markPageWithHashStep") final Step markPageWithHashStep) {
    return new JobBuilder("markPagesWithHashJob", jobRepository)
        .incrementer(new RunIdIncrementer())
        .start(markPageWithHashStep)
        .build();
  }

  /**
   * The mark page with hash step.
   *
   * @param jobRepository the job repository
   * @param platformTransactionManager the transaction manager
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean(name = "markPageWithHashStep")
  public Step markPageWithHashStep(
      final JobRepository jobRepository,
      final PlatformTransactionManager platformTransactionManager,
      final MarkPageWithHashReader reader,
      final NoopProcessor<Page> processor,
      final MarkPageWithHashWriter writer) {
    return new StepBuilder("markPageWithHashStep", jobRepository)
        .<Page, Page>chunk(this.batchChunkSize, platformTransactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
