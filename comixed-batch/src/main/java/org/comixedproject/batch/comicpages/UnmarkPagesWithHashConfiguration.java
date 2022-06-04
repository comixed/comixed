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
import org.comixedproject.batch.comicpages.readers.UnmarkPageWithHashReader;
import org.comixedproject.batch.comicpages.writers.UnmarkPageWithHashWriter;
import org.comixedproject.batch.processors.NoopProcessor;
import org.comixedproject.model.comicpages.Page;
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
 * <code>UnmarkPagesWithHashConfiguration</code> defines a process that unmarks all pages with a
 * given hash for deletion.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class UnmarkPagesWithHashConfiguration {
  public static final String PARAM_UNMARK_PAGES_WITH_HASH_STARTED =
      "job.undelete-pages-with-hash.started";
  public static final String PARAM_UNMARK_PAGES_TARGET_HASH =
      "job.undelete-pages-with-hash.target-hash";

  @Value("${comixed.batch.chunk-size}")
  private int batchChunkSize = 10;

  /**
   * Returns the job bean to delete pages with a hash.
   *
   * @param jobBuilderFactory the job builder factory
   * @param unmarkPageWithHashStep the unmark page step
   * @return the job
   */
  @Bean
  @Qualifier("unmarkPagesWithHashJob")
  public Job unmarkPagesWithHashJob(
      final JobBuilderFactory jobBuilderFactory,
      @Qualifier("unmarkPageWithHashStep") final Step unmarkPageWithHashStep) {
    return jobBuilderFactory
        .get("unmarkPagesWithHashJob")
        .incrementer(new RunIdIncrementer())
        .start(unmarkPageWithHashStep)
        .build();
  }

  /**
   * The mark page step.
   *
   * @param stepBuilderFactory the step factory
   * @param reader the reader
   * @param processor the processor
   * @param writer the writer
   * @return the step
   */
  @Bean
  @Qualifier("unmarkPageWithHashStep")
  public Step unmarkPageWithHashStep(
      final StepBuilderFactory stepBuilderFactory,
      final UnmarkPageWithHashReader reader,
      final NoopProcessor<Page> processor,
      final UnmarkPageWithHashWriter writer) {
    return stepBuilderFactory
        .get("unmarkPageWithHashStep")
        .<Page, Page>chunk(this.batchChunkSize)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
  }
}
