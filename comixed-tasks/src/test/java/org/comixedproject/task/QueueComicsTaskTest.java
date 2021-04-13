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

package org.comixedproject.task;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.RandomStringUtils;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.AddComicTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:application.properties")
@SpringBootTest
public class QueueComicsTaskTest {
  @InjectMocks private QueueComicsTask task;
  @Mock private TaskService taskService;
  @Mock private PersistedTask persistedTask;

  @Captor private ArgumentCaptor<PersistedTask> persistedTaskArgumentCaptor;

  private List<String> filenames = new ArrayList<>();

  @Test
  public void testCreateDescription() {
    task.setFilenames(filenames);
    assertNotNull(task.createDescription());
  }

  @Test
  public void testAddFiles() {
    for (int index = 0; index < 1000; index++) {
      filenames.add(RandomStringUtils.random(128, true, true));
    }
    task.setFilenames(filenames);

    assertFalse(task.getFilenames().isEmpty());
    for (String filename : filenames) {
      assertTrue(task.getFilenames().contains(filename));
    }
  }

  @Test
  public void testStartTaskDeleteBlockedPages() throws TaskException {
    filenames.add(RandomStringUtils.random(128, true, true));

    Mockito.when(taskService.save(persistedTaskArgumentCaptor.capture())).thenReturn(persistedTask);

    task.setFilenames(filenames);
    task.setDeleteBlockedPages(true);
    task.setIgnoreMetadata(false);

    task.startTask();

    final PersistedTask record = persistedTaskArgumentCaptor.getValue();
    assertEquals(PersistedTaskType.ADD_COMIC, record.getTaskType());
    assertEquals(filenames.get(0), record.getProperty(AddComicTaskEncoder.FILENAME));
    assertEquals(
        Boolean.TRUE.toString(), record.getProperty(AddComicTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(Boolean.FALSE.toString(), record.getProperty(AddComicTaskEncoder.IGNORE_METADATA));
  }

  @Test
  public void testStartTaskIgnoreMetadata() throws TaskException {
    filenames.add(RandomStringUtils.random(128, true, true));

    Mockito.when(taskService.save(persistedTaskArgumentCaptor.capture())).thenReturn(persistedTask);

    task.setFilenames(filenames);
    task.setDeleteBlockedPages(false);
    task.setIgnoreMetadata(true);

    task.startTask();

    final PersistedTask record = persistedTaskArgumentCaptor.getValue();
    assertEquals(PersistedTaskType.ADD_COMIC, record.getTaskType());
    assertEquals(filenames.get(0), record.getProperty(AddComicTaskEncoder.FILENAME));
    assertEquals(
        Boolean.FALSE.toString(), record.getProperty(AddComicTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(Boolean.TRUE.toString(), record.getProperty(AddComicTaskEncoder.IGNORE_METADATA));
  }

  @Test
  public void testStartTaskDeleteBlockedPagesAndIgnoreMetadata() throws TaskException {
    filenames.add(RandomStringUtils.random(128, true, true));

    Mockito.when(taskService.save(persistedTaskArgumentCaptor.capture())).thenReturn(persistedTask);

    task.setFilenames(filenames);
    task.setDeleteBlockedPages(true);
    task.setIgnoreMetadata(true);

    task.startTask();

    final PersistedTask record = persistedTaskArgumentCaptor.getValue();
    assertEquals(PersistedTaskType.ADD_COMIC, record.getTaskType());
    assertEquals(filenames.get(0), record.getProperty(AddComicTaskEncoder.FILENAME));
    assertEquals(
        Boolean.TRUE.toString(), record.getProperty(AddComicTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(Boolean.TRUE.toString(), record.getProperty(AddComicTaskEncoder.IGNORE_METADATA));
  }
}
