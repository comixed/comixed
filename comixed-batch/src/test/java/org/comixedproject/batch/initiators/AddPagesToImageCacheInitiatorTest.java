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

import static org.comixedproject.batch.comicpages.AddPagesToImageCacheConfiguration.ADD_PAGES_TO_IMAGE_CACHE_JOB;
import static org.junit.Assert.assertNotNull;

import org.comixedproject.batch.comicpages.AddPagesToImageCacheConfiguration;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.comicpages.PageCacheService;
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
public class AddPagesToImageCacheInitiatorTest {
  private static final long TEST_PAGE_COUNT = 27L;
  @InjectMocks private AddPagesToImageCacheInitiator initiator;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicPageService comicPageService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock
  @Qualifier(ADD_PAGES_TO_IMAGE_CACHE_JOB)
  private Job addPagesToImageCacheJob;

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
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
    Mockito.when(comicPageService.findPagesNeedingCacheEntriesCount()).thenReturn(TEST_PAGE_COUNT);
    Mockito.when(batchProcessesService.hasActiveExecutions(ADD_PAGES_TO_IMAGE_CACHE_JOB))
        .thenReturn(false);
  }

  @Test
  public void testExecute()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(
        jobParameters.getLong(
            AddPagesToImageCacheConfiguration.PARAM_ADD_IMAGE_CACHE_ENTRIES_STARTED));

    Mockito.verify(pageCacheService, Mockito.times(1)).prepareCoverPagesWithoutCacheEntries();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPagesToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecute_noPagesNeedCaching()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicPageService.findPagesNeedingCacheEntriesCount()).thenReturn(0L);

    initiator.execute();

    Mockito.verify(pageCacheService, Mockito.times(1)).prepareCoverPagesWithoutCacheEntries();
    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(Job.class), Mockito.any());
  }

  @Test
  public void testExecute_existingJobFound()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(batchProcessesService.hasActiveExecutions(ADD_PAGES_TO_IMAGE_CACHE_JOB))
        .thenReturn(true);

    initiator.execute();

    Mockito.verify(pageCacheService, Mockito.times(1)).prepareCoverPagesWithoutCacheEntries();
    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(Job.class), Mockito.any());
  }

  @Test
  public void testExecute_jobLauncherThrowsException()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenThrow(JobExecutionAlreadyRunningException.class);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(
        jobParameters.getLong(
            AddPagesToImageCacheConfiguration.PARAM_ADD_IMAGE_CACHE_ENTRIES_STARTED));

    Mockito.verify(pageCacheService, Mockito.times(1)).prepareCoverPagesWithoutCacheEntries();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPagesToImageCacheJob, jobParameters);
  }
}
