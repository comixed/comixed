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

import static org.comixedproject.batch.comicbooks.ProcessUnhashedComicsConfiguration.PROCESS_UNHASHED_COMICS_JOB;
import static org.comixedproject.batch.library.OrganizeLibraryConfiguration.*;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_COMIC_RENAMING_RULE;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY;
import static org.junit.Assert.*;

import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.library.OrganizingComicService;
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
class OrganizeLibraryInitiatorTest {
  private static final Long TEST_COMICS_MARKED_FOR_ORGANIZATION_COUNT = 717L;
  private static final String TEST_ROOT_DIRECTORY = "/Users/comixed/Documents/library";
  private static final String TEST_RENAMING_RULE = "The renaming rule";

  @InjectMocks private OrganizeLibraryInitiator initiator;
  @Mock private OrganizingComicService organizingComicService;
  @Mock private ConfigurationService configurationService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock
  @Qualifier(value = PROCESS_UNHASHED_COMICS_JOB)
  private Job loadPageHashesJob;

  @Mock
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @BeforeEach
  public void setUp()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(organizingComicService.loadComicCount())
        .thenReturn(TEST_COMICS_MARKED_FOR_ORGANIZATION_COUNT);
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(false);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY))
        .thenReturn(TEST_ROOT_DIRECTORY);
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_COMIC_RENAMING_RULE))
        .thenReturn(TEST_RENAMING_RULE);
  }

  @Test
  void execute_noComicsToMove()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(organizingComicService.loadComicCount()).thenReturn(0L);

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
  void execute_fromScheduler()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(ORGANIZE_LIBRARY_JOB_TIME_STARTED));
    assertEquals(
        TEST_ROOT_DIRECTORY, jobParameters.getString(ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY));
    assertEquals(TEST_RENAMING_RULE, jobParameters.getString(ORGANIZE_LIBRARY_JOB_RENAMING_RULE));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }

  @Test
  void execute_fromListener()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    initiator.execute(OrganizingLibraryEvent.instance);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(ORGANIZE_LIBRARY_JOB_TIME_STARTED));
    assertEquals(
        TEST_ROOT_DIRECTORY, jobParameters.getString(ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY));
    assertEquals(TEST_RENAMING_RULE, jobParameters.getString(ORGANIZE_LIBRARY_JOB_RENAMING_RULE));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }

  @Test
  void execute_noRootDirectory()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY)).thenReturn(null);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  void execute_noRenamingRule()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_COMIC_RENAMING_RULE))
        .thenReturn(null);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
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

    assertNotNull(jobParameters.getLong(ORGANIZE_LIBRARY_JOB_TIME_STARTED));
    assertEquals(
        TEST_ROOT_DIRECTORY, jobParameters.getString(ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY));
    assertEquals(TEST_RENAMING_RULE, jobParameters.getString(ORGANIZE_LIBRARY_JOB_RENAMING_RULE));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }
}
