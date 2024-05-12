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

import static org.comixedproject.batch.comicbooks.ImportComicFilesConfiguration.IMPORT_COMIC_FILES_JOB;
import static org.comixedproject.batch.comicbooks.ImportComicFilesConfiguration.IMPORT_COMIC_FILES_JOB_STARTED;
import static org.junit.Assert.*;

import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicfiles.ComicFileService;
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
public class ImportComicFilesInitiatorTest {
  @InjectMocks private ImportComicFilesInitiator initiator;
  @Mock private ComicFileService comicFileService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock
  @Qualifier(value = IMPORT_COMIC_FILES_JOB)
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
    Mockito.when(comicFileService.getComicFileDescriptorCount()).thenReturn(100L);
    Mockito.when(batchProcessesService.activeExecutionCountFor(Mockito.anyString())).thenReturn(0L);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
  }

  @Test
  public void testExecuteNoComicFilesFound()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicFileService.getComicFileDescriptorCount()).thenReturn(0L);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  public void testExecuteHasRunningJobs()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(batchProcessesService.activeExecutionCountFor(Mockito.anyString())).thenReturn(1L);

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  public void testExecute()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(IMPORT_COMIC_FILES_JOB_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
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

    assertNotNull(jobParameters.getLong(IMPORT_COMIC_FILES_JOB_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }
}
