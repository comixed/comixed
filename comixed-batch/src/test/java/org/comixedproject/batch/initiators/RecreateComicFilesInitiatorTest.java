package org.comixedproject.batch.initiators;

import static org.comixedproject.batch.comicbooks.OrganizeLibraryConfiguration.*;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.JOB_RECREATE_COMICS_STARTED;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.RECREATE_COMIC_FILES_JOB;
import static org.junit.Assert.*;

import org.comixedproject.model.batch.RecreateComicFilesEvent;
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
public class RecreateComicFilesInitiatorTest {
  private static final Long TEST_COMICS_MARKED_FOR_RECREATION_COUNT = 717L;

  @InjectMocks private RecreateComicFilesInitiator initiator;
  @Mock private ComicBookService comicBookService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock
  @Qualifier(value = RECREATE_COMIC_FILES_JOB)
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
    Mockito.when(comicBookService.findComicsToRecreateCount())
        .thenReturn(TEST_COMICS_MARKED_FOR_RECREATION_COUNT);
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(false);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
  }

  @Test
  public void testExecuteNoComicsToRecreate()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    Mockito.when(comicBookService.findComicsToRecreateCount()).thenReturn(0L);

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

    assertNotNull(jobParameters.getLong(JOB_RECREATE_COMICS_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }

  @Test
  public void testExecuteFromListener()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    initiator.execute(RecreateComicFilesEvent.instance.instance);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(JOB_RECREATE_COMICS_STARTED));

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

    assertNotNull(jobParameters.getLong(JOB_RECREATE_COMICS_STARTED));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(loadPageHashesJob, jobParameters);
  }
}
