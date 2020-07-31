/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.task.model;

import static junit.framework.TestCase.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.RandomStringUtils;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.AddComicWorkerTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:application.properties")
@SpringBootTest
public class QueueComicsWorkerTaskTest {
  @InjectMocks private QueueComicsWorkerTask workerTask;
  @Mock private TaskService taskService;
  @Captor private ArgumentCaptor<Task> taskArgumentCaptor;
  @Mock private Task task;

  private List<String> filenames = new ArrayList<>();

  @Test
  public void testAddFiles() {
    for (int index = 0; index < 1000; index++) {
      filenames.add(RandomStringUtils.random(128, true, true));
    }
    workerTask.setFilenames(filenames);

    assertFalse(workerTask.gettFilenames().isEmpty());
    for (String filename : filenames) {
      assertTrue(workerTask.gettFilenames().contains(filename));
    }
  }

  @Test
  public void testStartTaskDeleteBlockedPages() throws WorkerTaskException {
    filenames.add(RandomStringUtils.random(128, true, true));

    Mockito.when(taskService.save(taskArgumentCaptor.capture())).thenReturn(task);

    workerTask.setFilenames(filenames);
    workerTask.setDeleteBlockedPages(true);
    workerTask.setIgnoreMetadata(false);

    workerTask.startTask();

    final Task record = taskArgumentCaptor.getValue();
    assertEquals(TaskType.ADD_COMIC, record.getTaskType());
    assertEquals(filenames.get(0), record.getProperty(AddComicWorkerTaskEncoder.FILENAME));
    assertEquals(
        Boolean.TRUE.toString(),
        record.getProperty(AddComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(
        Boolean.FALSE.toString(), record.getProperty(AddComicWorkerTaskEncoder.IGNORE_METADATA));
  }

  @Test
  public void testStartTaskIgnoreMetadata() throws WorkerTaskException {
    filenames.add(RandomStringUtils.random(128, true, true));

    Mockito.when(taskService.save(taskArgumentCaptor.capture())).thenReturn(task);

    workerTask.setFilenames(filenames);
    workerTask.setDeleteBlockedPages(false);
    workerTask.setIgnoreMetadata(true);

    workerTask.startTask();

    final Task record = taskArgumentCaptor.getValue();
    assertEquals(TaskType.ADD_COMIC, record.getTaskType());
    assertEquals(filenames.get(0), record.getProperty(AddComicWorkerTaskEncoder.FILENAME));
    assertEquals(
        Boolean.FALSE.toString(),
        record.getProperty(AddComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(
        Boolean.TRUE.toString(), record.getProperty(AddComicWorkerTaskEncoder.IGNORE_METADATA));
  }

  @Test
  public void testStartTaskDeleteBlockedPagesAndIgnoreMetadata() throws WorkerTaskException {
    filenames.add(RandomStringUtils.random(128, true, true));

    Mockito.when(taskService.save(taskArgumentCaptor.capture())).thenReturn(task);

    workerTask.setFilenames(filenames);
    workerTask.setDeleteBlockedPages(true);
    workerTask.setIgnoreMetadata(true);

    workerTask.startTask();

    final Task record = taskArgumentCaptor.getValue();
    assertEquals(TaskType.ADD_COMIC, record.getTaskType());
    assertEquals(filenames.get(0), record.getProperty(AddComicWorkerTaskEncoder.FILENAME));
    assertEquals(
        Boolean.TRUE.toString(),
        record.getProperty(AddComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(
        Boolean.TRUE.toString(), record.getProperty(AddComicWorkerTaskEncoder.IGNORE_METADATA));
  }
}
