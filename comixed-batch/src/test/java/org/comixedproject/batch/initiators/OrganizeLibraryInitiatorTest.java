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

import static org.comixedproject.batch.comicbooks.OrganizeLibraryConfiguration.*;
import static org.comixedproject.batch.comicpages.LoadPageHashesConfiguration.LOAD_PAGE_HASHES_JOB;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_COMIC_RENAMING_RULE;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY;
import static org.junit.Assert.*;

import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Qualifier;

@RunWith(MockitoJUnitRunner.class)
public class OrganizeLibraryInitiatorTest {
  private static final Long TEST_COMICS_MARKED_FOR_ORGANIZATION_COUNT = 717L;
  private static final String TEST_ROOT_DIRECTORY = "/Users/comixed/Documents/library";
  private static final String TEST_RENAMING_RULE = "The renaming rule";

  @InjectMocks private OrganizeLibraryInitiator initiator;
  @Mock private ComicBookService comicBookService;
  @Mock private ConfigurationService configurationService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock
  @Qualifier(value = LOAD_PAGE_HASHES_JOB)
  private Job loadPageHashesJob;

  @Mock
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Before
  public void setUp()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.findComicsToBeMovedCount())
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
  public void testExecuteNoComicsToMove()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.findComicsToBeMovedCount()).thenReturn(0L);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  public void testExecuteHasRunningJobs()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(true);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  public void testExecuteFromScheduler()
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
  public void testExecuteFromListener()
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
  public void testExecuteNoRootDirectory()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY)).thenReturn(null);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  public void testExecuteNoRenamingRule()
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
  public void testExecuteJobException()
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
