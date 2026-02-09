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

import static org.comixedproject.batch.comicpages.MarkBlockedPagesConfiguration.JOB_MARK_BLOCKED_PAGES_STARTED;
import static org.comixedproject.batch.comicpages.MarkBlockedPagesConfiguration.MARK_BLOCKED_PAGES_JOB;
import static org.comixedproject.service.admin.ConfigurationService.CFG_MANAGE_BLOCKED_PAGES;
import static org.junit.Assert.*;

import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicpages.ComicPageService;
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
class MarkBlockedPagesInitiatorTest {
  @InjectMocks private MarkBlockedPagesInitiator initiator;
  @Mock private ConfigurationService configurationService;
  @Mock private ComicPageService comicPageService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock
  @Qualifier(value = MARK_BLOCKED_PAGES_JOB)
  private Job loadPageHashesJob;

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
    Mockito.when(configurationService.isFeatureEnabled(CFG_MANAGE_BLOCKED_PAGES)).thenReturn(true);
    Mockito.when(comicPageService.getUnmarkedWithBlockedHashCount()).thenReturn(1L);
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(false);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
  }

  @Test
  void execute_notManagingBlockedPages()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(configurationService.isFeatureEnabled(CFG_MANAGE_BLOCKED_PAGES)).thenReturn(false);

    initiator.execute();

    Mockito.verify(configurationService, Mockito.times(1))
        .isFeatureEnabled(CFG_MANAGE_BLOCKED_PAGES);
    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  void execute_noMissingHashes()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicPageService.getUnmarkedWithBlockedHashCount()).thenReturn(0L);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  void execute_hasRunningJobs()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(true);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  void execute()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(JOB_MARK_BLOCKED_PAGES_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }

  @Test
  void execute_jobException()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenThrow(JobParametersInvalidException.class);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(JOB_MARK_BLOCKED_PAGES_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }
}
