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
import org.comixedproject.model.comicbooks.Comic;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

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
  private static final String KEY_STARTED = "job.update-metadata.started";

  @Autowired public JobBuilderFactory jobBuilderFactory;
  @Autowired public StepBuilderFactory stepBuilderFactory;
  @Autowired private JobLauncher jobLauncher;

  @Autowired private UpdateMetadataReader updateMetadataReader;
  @Autowired private UpdateMetadataProcessor updateMatadataProcessor;
  @Autowired private UpdateMetadataWriter updateMetadataWriter;

  @Value("${batch.chunk-size}")
  private int batchChunkSize = 10;

  @Bean
  public Job updateMetadataJob() {
    return this.jobBuilderFactory
        .get("updateMetadataJob")
        .incrementer(new RunIdIncrementer())
        .start(updateMetadataStep())
        .build();
  }

  @Bean
  public Step updateMetadataStep() {
    return this.stepBuilderFactory
        .get("updateMetadataStep")
        .<Comic, Comic>chunk(this.batchChunkSize)
        .reader(updateMetadataReader)
        .processor(updateMatadataProcessor)
        .writer(updateMetadataWriter)
        .build();
  }

  @Scheduled(fixedDelay = 1000)
  public void performJob()
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    this.jobLauncher.run(
        updateMetadataJob(),
        new JobParametersBuilder()
            .addLong(KEY_STARTED, System.currentTimeMillis())
            .toJobParameters());
  }
}
