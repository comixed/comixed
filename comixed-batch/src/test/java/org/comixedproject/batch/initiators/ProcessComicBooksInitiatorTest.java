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

import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_STARTED;
import static org.junit.Assert.*;

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

@RunWith(MockitoJUnitRunner.class)
public class ProcessComicBooksInitiatorTest {
  private static final Long TEST_NEED_TO_HAVE_CONTENT_LOADED = 7L;
  private static final Long TEST_BLOCKED_PAGES = 17L;
  private static final Long TEST_NEEDS_METADATA_LOADED = 65L;
  private static final Long TEST_FINISHED_PROCESSING = 12971L;

  @InjectMocks private ProcessComicBooksInitiator initiator;
  @Mock private ComicBookService comicBookService;

  @Mock(name = "addPageToImageCacheJob")
  private Job addPageToImageCacheJob;

  @Mock(name = "batchJobLauncher")
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
    Mockito.when(comicBookService.getUnprocessedComicsWithoutContentCount()).thenReturn(0L);
    Mockito.when(comicBookService.getUnprocessedComicsForMarkedPageBlockingCount()).thenReturn(0L);
    Mockito.when(comicBookService.getWithCreateMetadataSourceFlagCount()).thenReturn(0L);
    Mockito.when(comicBookService.getProcessedComicsCount()).thenReturn(0L);
  }

  @Test
  public void testExecuteWithComicsWithoutContent()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getUnprocessedComicsWithoutContentCount())
        .thenReturn(TEST_NEED_TO_HAVE_CONTENT_LOADED);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(comicBookService, Mockito.times(1)).getUnprocessedComicsWithoutContentCount();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecuteWithPagesToBeMarked()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getUnprocessedComicsForMarkedPageBlockingCount())
        .thenReturn(TEST_NEEDS_METADATA_LOADED);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(comicBookService, Mockito.times(1))
        .getUnprocessedComicsForMarkedPageBlockingCount();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecuteWithMetadataSourcesToCreate()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getWithCreateMetadataSourceFlagCount())
        .thenReturn(TEST_NEEDS_METADATA_LOADED);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(comicBookService, Mockito.times(1)).getWithCreateMetadataSourceFlagCount();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecuteWithFinishedProcessing()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getProcessedComicsCount()).thenReturn(TEST_FINISHED_PROCESSING);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(comicBookService, Mockito.times(1)).getProcessedComicsCount();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecuteJobLauncherThrowsException()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getUnprocessedComicsWithoutContentCount())
        .thenReturn(TEST_NEED_TO_HAVE_CONTENT_LOADED);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenThrow(JobExecutionAlreadyRunningException.class);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }
}
