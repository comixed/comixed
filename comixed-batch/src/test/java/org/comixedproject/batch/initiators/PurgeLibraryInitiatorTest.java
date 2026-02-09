package org.comixedproject.batch.initiators;

import static org.comixedproject.batch.comicbooks.PurgeLibraryConfiguration.PURGE_LIBRARY_JOB;
import static org.comixedproject.batch.comicbooks.PurgeLibraryConfiguration.PURGE_LIBRARY_JOB_TIME_STARTED;
import static org.junit.Assert.*;

import org.comixedproject.model.batch.PurgeLibraryEvent;
import org.comixedproject.service.batch.BatchProcessesService;
import org.comixedproject.service.comicbooks.ComicBookService;
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
import org.springframework.beans.factory.annotation.Qualifier;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PurgeLibraryInitiatorTest {
  private static final Long TEST_COMICS_MARKED_FOR_DELETION = 717L;

  @InjectMocks private PurgeLibraryInitiator initiator;
  @Mock private ComicBookService comicBookService;
  @Mock private BatchProcessesService batchProcessesService;

  @Mock
  @Qualifier(value = PURGE_LIBRARY_JOB)
  private Job purgeLibraryJob;

  @Mock
  @Qualifier("batchJobOperator")
  private JobOperator jobOperator;

  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @BeforeEach
  public void setUp()
      throws JobInstanceAlreadyCompleteException,
      JobExecutionAlreadyRunningException,
      InvalidJobParametersException,
      JobRestartException {
    Mockito.when(comicBookService.findComicsToPurgeCount())
        .thenReturn(TEST_COMICS_MARKED_FOR_DELETION);
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(false);
    Mockito.when(jobOperator.start(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);
  }

  @Test
  void execute_noComicsToRecreate()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    Mockito.when(comicBookService.findComicsToPurgeCount()).thenReturn(0L);

    initiator.execute();

    Mockito.verify(jobOperator, Mockito.never()).start(Mockito.any(Job.class), Mockito.any());
  }

  @Test
  void execute_hasRunningJobs()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    Mockito.when(batchProcessesService.hasActiveExecutions(Mockito.anyString())).thenReturn(true);

    initiator.execute();

    Mockito.verify(jobOperator, Mockito.never()).start(Mockito.any(Job.class), Mockito.any());
  }

  @Test
  void execute_fromScheduler()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(PURGE_LIBRARY_JOB_TIME_STARTED));

    Mockito.verify(jobOperator, Mockito.times(1)).start(purgeLibraryJob, jobParameters);
  }

  @Test
  void execute_fromListener()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    initiator.execute(PurgeLibraryEvent.instance);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(PURGE_LIBRARY_JOB_TIME_STARTED));

    Mockito.verify(jobOperator, Mockito.times(1)).run(purgeLibraryJob, jobParameters);
  }

  @Test
  void execute_jobException()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          InvalidJobParametersException,
          JobRestartException {
    Mockito.when(jobOperator.start(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenThrow(InvalidJobParametersException.class);

    initiator.execute();

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters.getLong(PURGE_LIBRARY_JOB_TIME_STARTED));

    Mockito.verify(jobOperator, Mockito.times(1)).start(purgeLibraryJob, jobParameters);
  }
}
