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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.batch.BatchProcess;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobInstance;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.NoSuchJobException;

@RunWith(MockitoJUnitRunner.class)
public class BatchProcessesServiceTest {
  private static final String TEST_JOB_NAME = "jobName:";
  private static final int TEST_INSTANCE_COUNT = 1;
  private static final Long TEST_INSTANCE_ID = RandomUtils.nextLong();
  private static final Long TEST_JOB_ID = RandomUtils.nextLong();
  private static final BatchStatus TEST_STATUS =
      BatchStatus.values()[RandomUtils.nextInt(BatchStatus.values().length)];
  private static final Date TEST_START_TIME = new Date();
  private static final Date TEST_END_TIME = new Date();
  private static final ExitStatus TEST_EXIT_STATUS = ExitStatus.COMPLETED;

  @InjectMocks private BatchProcessesService service;
  @Mock private JobExplorer jobExplorer;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;

  private List<String> jobNames = new ArrayList<>();
  private List<JobInstance> jobInstanceList = new ArrayList<>();
  private List<JobExecution> jobExecutionList = new ArrayList<>();

  @Before
  public void setUp() throws NoSuchJobException {
    jobNames.add(TEST_JOB_NAME);
    Mockito.when(jobExplorer.getJobNames()).thenReturn(jobNames);
    Mockito.when(jobExplorer.getJobInstanceCount(Mockito.anyString()))
        .thenReturn(TEST_INSTANCE_COUNT);
    Mockito.when(jobInstance.getInstanceId()).thenReturn(TEST_INSTANCE_ID);
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
  }

  @Test
  public void testGetAllBatchProcessesNoSuchJobException() throws NoSuchJobException {
    Mockito.when(jobExplorer.getJobInstanceCount(Mockito.anyString()))
        .thenThrow(NoSuchJobException.class);

    final List<BatchProcess> result = service.getAllBatchProcesses();

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetAllBatchProcesses() {
    final List<BatchProcess> result = service.getAllBatchProcesses();

    assertNotNull(result);
    assertEquals(TEST_INSTANCE_COUNT, result.size());

    final BatchProcess batchProcess = result.get(0);
    assertEquals(TEST_JOB_NAME, batchProcess.getName());
    assertEquals(TEST_INSTANCE_ID, batchProcess.getInstanceId());
    assertEquals(TEST_JOB_ID, batchProcess.getJobId());
    assertSame(TEST_STATUS, batchProcess.getStatus());
    assertEquals(TEST_START_TIME, batchProcess.getStartTime());
    assertEquals(TEST_END_TIME, batchProcess.getEndTime());
    assertSame(TEST_EXIT_STATUS.getExitCode(), batchProcess.getExitCode());
    assertEquals(TEST_EXIT_STATUS.getExitDescription(), batchProcess.getExitDescription());

    Mockito.verify(jobExplorer, Mockito.times(1)).getJobNames();
    Mockito.verify(jobExplorer, Mockito.times(1))
        .getJobInstances(TEST_JOB_NAME, 0, TEST_INSTANCE_COUNT);
    Mockito.verify(jobExplorer, Mockito.times(TEST_INSTANCE_COUNT)).getJobExecutions(jobInstance);
  }
}
