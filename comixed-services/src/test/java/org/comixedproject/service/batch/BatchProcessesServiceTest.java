/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.service.batch;

import static junit.framework.TestCase.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.*;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.NoSuchJobException;
import org.springframework.batch.core.repository.JobRepository;

@RunWith(MockitoJUnitRunner.class)
public class BatchProcessesServiceTest {
  private static final String TEST_JOB_NAME = "jobName:";
  private static final long TEST_INSTANCE_COUNT = 1L;
  private static final long TEST_JOB_ID = RandomUtils.nextLong();
  private static final BatchStatus TEST_STATUS =
      BatchStatus.values()[RandomUtils.nextInt(BatchStatus.values().length)];
  private static final LocalDateTime TEST_START_TIME = LocalDateTime.now();
  private static final LocalDateTime TEST_END_TIME = LocalDateTime.now();
  private static final ExitStatus TEST_EXIT_STATUS = ExitStatus.COMPLETED;

  @InjectMocks private BatchProcessesService service;
  @Mock private JobExplorer jobExplorer;
  @Mock private JobRepository jobRepository;
  @Mock private JobInstance jobInstance;
  @Mock private JobParameters jobParameters;
  @Mock private JobExecution jobExecution;

  private List<String> jobNames = new ArrayList<>();
  private List<JobInstance> jobInstanceList = new ArrayList<>();
  private List<JobExecution> jobExecutionList = new ArrayList<>();
  private Map<String, JobParameter<?>> parameters = new HashMap<>();

  @Before
  public void setUp() throws NoSuchJobException {
    jobNames.add(TEST_JOB_NAME);
    Mockito.when(jobExplorer.getJobNames()).thenReturn(jobNames);
    Mockito.when(jobInstance.getJobName()).thenReturn(TEST_JOB_NAME);
    Mockito.when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    Mockito.when(jobParameters.getParameters()).thenReturn(parameters);
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobExplorer.getJobInstanceCount(Mockito.anyString()))
        .thenReturn(TEST_INSTANCE_COUNT);
    jobInstanceList.add(jobInstance);
    Mockito.when(
            jobExplorer.getJobInstances(Mockito.anyString(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(jobInstanceList);
    Mockito.when(jobExecution.getJobId()).thenReturn(TEST_JOB_ID);
    Mockito.when(jobExecution.getStatus()).thenReturn(TEST_STATUS);
    Mockito.when(jobExecution.getStartTime()).thenReturn(TEST_START_TIME);
    Mockito.when(jobExecution.getEndTime()).thenReturn(TEST_END_TIME);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(TEST_EXIT_STATUS);
    Mockito.when(jobExecution.getEndTime()).thenReturn(TEST_END_TIME);
    jobExecutionList.add(jobExecution);
    Mockito.when(jobExplorer.getJobExecutions(Mockito.any(JobInstance.class)))
        .thenReturn(jobExecutionList);
    Mockito.when(jobExplorer.getJobExecution(Mockito.anyLong())).thenReturn(jobExecution);
  }

  @Test
  public void testGetAllBatchProcessesNoSuchJobException() throws NoSuchJobException {
    Mockito.when(jobExplorer.getJobInstanceCount(Mockito.anyString()))
        .thenThrow(NoSuchJobException.class);

    final List<BatchProcessDetail> result = service.getAllBatchProcesses();

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetAllBatchProcesses() {
    final List<BatchProcessDetail> result = service.getAllBatchProcesses();

    assertNotNull(result);
    assertEquals(TEST_INSTANCE_COUNT, result.size());

    final BatchProcessDetail batchProcess = result.get(0);
    assertEquals(TEST_JOB_NAME, batchProcess.getJobName());
    assertEquals(TEST_JOB_ID, batchProcess.getJobId());
    assertEquals(TEST_STATUS.name(), batchProcess.getStatus());
    assertEquals(
        Date.from(TEST_START_TIME.atZone(ZoneId.systemDefault()).toInstant()),
        batchProcess.getStartTime());
    assertEquals(
        Date.from(TEST_END_TIME.atZone(ZoneId.systemDefault()).toInstant()),
        batchProcess.getEndTime());
    assertSame(TEST_EXIT_STATUS.getExitCode(), batchProcess.getExitStatus());

    Mockito.verify(jobExplorer, Mockito.times(1)).getJobNames();
    Mockito.verify(jobExplorer, Mockito.times(1))
        .getJobInstances(TEST_JOB_NAME, 0, Math.toIntExact(TEST_INSTANCE_COUNT));
    Mockito.verify(jobExplorer, Mockito.times(Math.toIntExact(TEST_INSTANCE_COUNT)))
        .getJobExecutions(jobInstance);
  }

  @Test
  public void testGetAllBatchProcessesNoStartOrFinishedTime() {
    Mockito.when(jobExecution.getStartTime()).thenReturn(null);
    Mockito.when(jobExecution.getEndTime()).thenReturn(null);

    final List<BatchProcessDetail> result = service.getAllBatchProcesses();

    assertNotNull(result);
    assertEquals(TEST_INSTANCE_COUNT, result.size());

    final BatchProcessDetail batchProcess = result.get(0);
    assertEquals(TEST_JOB_NAME, batchProcess.getJobName());
    assertEquals(TEST_JOB_ID, batchProcess.getJobId());
    assertEquals(TEST_STATUS.name(), batchProcess.getStatus());
    assertNull(batchProcess.getStartTime());
    assertNull(batchProcess.getEndTime());
    assertSame(TEST_EXIT_STATUS.getExitCode(), batchProcess.getExitStatus());

    Mockito.verify(jobExplorer, Mockito.times(1)).getJobNames();
    Mockito.verify(jobExplorer, Mockito.times(1))
        .getJobInstances(TEST_JOB_NAME, 0, Math.toIntExact(TEST_INSTANCE_COUNT));
    Mockito.verify(jobExplorer, Mockito.times(Math.toIntExact(TEST_INSTANCE_COUNT)))
        .getJobExecutions(jobInstance);
  }

  @Test
  public void testDeleteWhenCompleted() {
    Mockito.when(jobExplorer.getJobExecutions(Mockito.any(JobInstance.class)))
        .thenReturn(jobExecutionList);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);

    final List<BatchProcessDetail> result = service.deleteCompletedJobs();

    assertNotNull(result);
    assertEquals(TEST_INSTANCE_COUNT, result.size());

    Mockito.verify(jobRepository, Mockito.times(1)).deleteJobExecution(jobExecution);
  }

  @Test
  public void testDeleteWhenFailed() {
    Mockito.when(jobExplorer.getJobExecutions(Mockito.any(JobInstance.class)))
        .thenReturn(jobExecutionList);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.FAILED);

    final List<BatchProcessDetail> result = service.deleteCompletedJobs();

    assertNotNull(result);
    assertEquals(TEST_INSTANCE_COUNT, result.size());

    Mockito.verify(jobRepository, Mockito.times(1)).deleteJobExecution(jobExecution);
  }

  @Test
  public void testDeleteWhenRunning() {
    Mockito.when(jobExplorer.getJobExecutions(Mockito.any(JobInstance.class)))
        .thenReturn(jobExecutionList);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.EXECUTING);

    final List<BatchProcessDetail> result = service.deleteCompletedJobs();

    assertNotNull(result);
    assertEquals(TEST_INSTANCE_COUNT, result.size());

    Mockito.verify(jobRepository, Mockito.never()).deleteJobExecution(Mockito.any());
  }

  @Test
  public void testDeleteNoSuchJobException() throws NoSuchJobException {
    Mockito.when(jobExplorer.getJobInstanceCount(Mockito.anyString()))
        .thenThrow(NoSuchJobException.class);

    final List<BatchProcessDetail> result = service.deleteCompletedJobs();

    assertNotNull(result);

    Mockito.verify(jobRepository, Mockito.never()).deleteJobExecution(Mockito.any());
  }

  @Test
  public void testExecutionCountForInvalidJob() throws NoSuchJobException {
    Mockito.when(jobExplorer.getJobInstanceCount(Mockito.anyString()))
        .thenThrow(NoSuchJobException.class);

    final boolean result = service.hasActiveExecutions(TEST_JOB_NAME);

    assertFalse(result);
  }

  @Test
  public void testExecutionCountFor() {
    Mockito.when(jobExecution.isRunning()).thenReturn(true);
    Mockito.when(jobExecution.getEndTime()).thenReturn(null);

    final boolean result = service.hasActiveExecutions(TEST_JOB_NAME);

    assertTrue(result);
  }

  @Test
  public void testExecutionCountForNoneFound() {
    Mockito.when(jobExecution.isRunning()).thenReturn(false);

    final boolean result = service.hasActiveExecutions(TEST_JOB_NAME);

    assertFalse(result);
  }

  @Test
  public void testDeleteSelectedJobIds() {
    final List<BatchProcessDetail> result = service.deleteSelectedJobs(Arrays.asList(TEST_JOB_ID));

    assertNotNull(result);

    Mockito.verify(jobExplorer, Mockito.times(1)).getJobExecution(TEST_JOB_ID);
    Mockito.verify(jobRepository, Mockito.times(1)).deleteJobExecution(jobExecution);
  }

  @Test
  public void testDeleteSelectedJobId_JobNotFound() {
    Mockito.when(jobExplorer.getJobExecution(Mockito.anyLong())).thenReturn(null);

    final List<BatchProcessDetail> result = service.deleteSelectedJobs(Arrays.asList(TEST_JOB_ID));

    assertNotNull(result);

    Mockito.verify(jobExplorer, Mockito.times(1)).getJobExecution(TEST_JOB_ID);
    Mockito.verify(jobRepository, Mockito.never()).deleteJobExecution(Mockito.any());
  }
}
