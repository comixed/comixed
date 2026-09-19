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

import static org.comixedproject.batch.comicbooks.LoadComicsConfiguration.LOAD_COMICS_JOB;
import static org.comixedproject.batch.comicbooks.LoadComicsConfiguration.LOAD_COMICS_JOB_STARTED;
import static org.comixedproject.batch.comicpages.AddPagesToImageCacheConfiguration.ADD_PAGES_TO_IMAGE_CACHE_JOB;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.batch.LoadComicsEvent;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicbooks.ComicService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.InvalidJobParametersException;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.launch.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.launch.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.launch.JobRestartException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LoadComicsInitiatorTest {
  @InjectMocks private LoadComicsInitiator initiator;
  @Mock private ComicService comicService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock(name = ADD_PAGES_TO_IMAGE_CACHE_JOB)
  private Job addPagesToImageCacheJob;

  @Mock(name = "batchJobLauncher")
  private JobOperator jobOperator;

  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;
  private List<Comic> comicList = new ArrayList<>();

  @BeforeEach
  void setUp()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    when(batchProcessesService.hasActiveExecutions(LOAD_COMICS_JOB)).thenReturn(false);
    for (int index = 0; index < 100; index++) comicList.add(mock(Comic.class));
    when(jobOperator.start(any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
    when(comicService.getUnprocessedComicBookCount()).thenReturn(1L);
  }

  @Test
  void execute_comicsWithoutContent()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    when(comicService.getUnprocessedComicBookCount()).thenReturn(1L);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(LOAD_COMICS_JOB_STARTED));

    verify(comicService).getUnprocessedComicBookCount();
    verify(jobOperator).start(addPagesToImageCacheJob, jobParameters);
  }

  @Test
  void execute_comicsFromListener()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    when(comicService.getUnprocessedComicBookCount()).thenReturn(1L);

    initiator.execute(LoadComicsEvent.instance);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(LOAD_COMICS_JOB_STARTED));

    verify(comicService).getUnprocessedComicBookCount();
    verify(jobOperator).start(addPagesToImageCacheJob, jobParameters);
  }

  @Test
  void execute_oneComicFound()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    while (comicList.size() > 1) comicList.remove(0);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(LOAD_COMICS_JOB_STARTED));

    verify(jobOperator).start(addPagesToImageCacheJob, jobParameters);
  }

  @Test
  void execute_finishedProcessing()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertNotNull(jobParameters.getLong(LOAD_COMICS_JOB_STARTED));

    verify(jobOperator).start(addPagesToImageCacheJob, jobParameters);
  }

  @Test
  void execute_noComicBooksFound()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    when(comicService.getUnprocessedComicBookCount()).thenReturn(0L);

    initiator.execute();

    verify(jobOperator, never()).start(any(Job.class), any());
  }

  @Test
  void execute_jobLauncherThrowsException()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    when(comicService.getUnprocessedComicBookCount()).thenReturn(1L);
    when(jobOperator.start(any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenThrow(JobExecutionAlreadyRunningException.class);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(jobParameters);
    assertFalse(jobParameters.isEmpty());

    verify(jobOperator).start(addPagesToImageCacheJob, jobParameters);
  }

  @Test
  void execute_hasActiveJob()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    when(batchProcessesService.hasActiveExecutions(LOAD_COMICS_JOB)).thenReturn(true);

    initiator.execute();

    verify(jobOperator, never()).start(any(Job.class), any());
  }
}
