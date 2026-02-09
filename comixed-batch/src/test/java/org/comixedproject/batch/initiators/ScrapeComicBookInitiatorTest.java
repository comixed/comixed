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

package org.comixedproject.batch.initiators;

import static org.comixedproject.batch.comicbooks.ScrapeMetadataConfiguration.*;
import static org.comixedproject.batch.initiators.ScrapeComicBookInitiator.DEFAULT_ERROR_THRESHOLD;
import static org.junit.Assert.*;

import org.comixedproject.model.batch.ScrapeMetadataEvent;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Qualifier;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ScrapeComicBookInitiatorTest {
  private static final long TEST_BATCH_SCRAPING_COUNT = 717L;
  private static final long TEST_CONFIGURED_ERROR_THRESHOLD = 100L;

  @InjectMocks private ScrapeComicBookInitiator initiator;
  @Mock private ComicBookService comicBookService;
  @Mock private BatchProcessesService batchProcessesService;
  @Mock private ConfigurationService configurationService;

  @Mock
  @Qualifier(value = SCRAPE_METADATA_JOB)
  private Job scrapeMetadataJob;

  @Mock
  @Qualifier("batchJobOperator")
  private JobLauncher jobLauncher;

  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @BeforeEach
  public void setUp()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getBatchScrapingCount()).thenReturn(TEST_BATCH_SCRAPING_COUNT);
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(false);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
    Mockito.when(
            configurationService.getOptionValue(
                ConfigurationService.CFG_METADATA_SCRAPING_ERROR_THRESHOLD,
                String.valueOf(DEFAULT_ERROR_THRESHOLD)))
        .thenReturn(String.valueOf(TEST_CONFIGURED_ERROR_THRESHOLD));
  }

  @Test
  void execute_fromListener()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    initiator.execute(ScrapeMetadataEvent.instance);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(SCRAPE_METADATA_JOB_TIME_STARTED));
    assertEquals(
        TEST_CONFIGURED_ERROR_THRESHOLD,
        jobParameters.getLong(SCRAPE_METADATA_JOB_ERROR_THRESHOLD).longValue());

    Mockito.verify(jobLauncher, Mockito.times(1)).run(scrapeMetadataJob, jobParameters);
  }

  @Test
  void execute_fromListener_noErrorThresholdConfigured()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(
            configurationService.getOptionValue(
                ConfigurationService.CFG_METADATA_SCRAPING_ERROR_THRESHOLD,
                String.valueOf(DEFAULT_ERROR_THRESHOLD)))
        .thenReturn(String.valueOf(DEFAULT_ERROR_THRESHOLD));

    initiator.execute(ScrapeMetadataEvent.instance);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(SCRAPE_METADATA_JOB_TIME_STARTED));
    assertEquals(10L, jobParameters.getLong(SCRAPE_METADATA_JOB_ERROR_THRESHOLD).longValue());

    Mockito.verify(jobLauncher, Mockito.times(1)).run(scrapeMetadataJob, jobParameters);
  }

  @Test
  void execute_jobException()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenThrow(JobParametersInvalidException.class);

    initiator.execute(ScrapeMetadataEvent.instance);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(SCRAPE_METADATA_JOB_TIME_STARTED));
    assertEquals(
        TEST_CONFIGURED_ERROR_THRESHOLD,
        jobParameters.getLong(SCRAPE_METADATA_JOB_ERROR_THRESHOLD).longValue());

    Mockito.verify(jobLauncher, Mockito.times(1)).run(scrapeMetadataJob, jobParameters);
  }
}
