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

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.batch.ComicBatchService;
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
  private static final String TEST_BATCH_NAME = "The batch  name";
  private static final long TEST_MAXL_RECORDS = 25L;

  @InjectMocks private ProcessComicBooksInitiator initiator;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBatchService comicBatchService;

  @Mock(name = "addPageToImageCacheJob")
  private Job addPageToImageCacheJob;

  @Mock(name = "batchJobLauncher")
  private JobLauncher jobLauncher;

  @Mock private JobExecution jobExecution;
  @Mock private ComicBatch comicBatch;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;
  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    for (int index = 0; index < TEST_MAXL_RECORDS; index++)
      comicBookList.add(Mockito.mock(ComicBook.class));
    Mockito.when(comicBatch.getName()).thenReturn(TEST_BATCH_NAME);
    Mockito.when(comicBatchService.createProcessComicBooksGroup(Mockito.anyList()))
        .thenReturn(comicBatch);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
    Mockito.when(comicBookService.getComicBooksForProcessing()).thenReturn(comicBookList);
  }

  @Test
  public void testExecuteWithComicsWithoutContent()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getComicBooksForProcessing()).thenReturn(comicBookList);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(comicBookService, Mockito.times(1)).getComicBooksForProcessing();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecuteOneComicVound()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    while (comicBookList.size() > 1) comicBookList.remove(0);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecuteWithFinishedProcessing()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(JOB_PROCESS_COMIC_BOOKS_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }

  @Test
  public void testExecuteNoComicBooksFound()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    comicBookList.clear();

    initiator.execute();

    Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
  }

  @Test
  public void testExecuteJobLauncherThrowsException()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.getComicBooksForProcessing()).thenReturn(comicBookList);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenThrow(JobExecutionAlreadyRunningException.class);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertFalse(jobParameters.isEmpty());

    Mockito.verify(jobLauncher, Mockito.times(1)).run(addPageToImageCacheJob, jobParameters);
  }
}
