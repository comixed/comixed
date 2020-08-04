/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.ConvertComicWorkerTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ConvertComicsWorkerTaskTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_ORIGINAL_COMIC = RANDOM.nextBoolean();

  @InjectMocks private ConvertComicsWorkerTask task;
  @Mock private TaskService taskService;
  @Mock private ObjectFactory<ConvertComicWorkerTaskEncoder> saveComicTaskEncoderObjectFactory;
  @Mock private ConvertComicWorkerTaskEncoder convertComicTaskEncoder;
  @Mock private Comic comic;
  @Mock private Task savedTask;
  @Captor private ArgumentCaptor<Task> taskArgumentCaptor;
  @Mock private ComicService comicService;

  private List<Long> idList = new ArrayList<>();

  @Test
  public void testSetIdList() {
    task.setIdList(idList);

    assertSame(idList, task.getIdList());
  }

  @Test
  public void testSetTargetArchiveType() {
    task.setTargetArchiveType(TEST_ARCHIVE_TYPE);

    assertSame(task.getTargetArchiveType(), TEST_ARCHIVE_TYPE);
  }

  @Test
  public void testSetRenamePages() {
    task.setRenamePages(TEST_RENAME_PAGES);

    assertEquals(TEST_RENAME_PAGES, task.isRenamePages());
  }

  @Test
  public void testSetDeletePages() {
    task.setDeletePages(TEST_DELETE_PAGES);

    assertEquals(TEST_DELETE_PAGES, task.isDeletePages());
  }

  @Test
  public void testSetDeleteOriginal() {
    task.setDeleteOriginal(TEST_DELETE_ORIGINAL_COMIC);

    assertEquals(TEST_DELETE_ORIGINAL_COMIC, task.isDeleteOriginal());
  }

  @Test
  public void testGetDescription() {
    task.setIdList(idList);
    task.setTargetArchiveType(TEST_ARCHIVE_TYPE);
    task.setRenamePages(TEST_RENAME_PAGES);
    task.setDeletePages(TEST_DELETE_PAGES);
    task.setDeleteOriginal(TEST_DELETE_ORIGINAL_COMIC);

    String expectedDescription =
        String.format(
            "Preparing to save %d comic%s", this.idList.size(), this.idList.size() == 1 ? "" : "s");
    assertEquals(expectedDescription, task.getDescription());
  }

  @Test
  public void testStartTask() throws WorkerTaskException, ComicException {
    for (int index = 0; index < 25; index++) {
      idList.add((long) index);
    }
    task.setIdList(idList);
    task.setTargetArchiveType(TEST_ARCHIVE_TYPE);
    task.setRenamePages(TEST_RENAME_PAGES);
    task.setDeletePages(TEST_DELETE_PAGES);
    task.setDeleteOriginal(TEST_DELETE_ORIGINAL_COMIC);

    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(saveComicTaskEncoderObjectFactory.getObject()).thenReturn(convertComicTaskEncoder);
    Mockito.when(taskService.save(taskArgumentCaptor.capture())).thenReturn(savedTask);

    task.startTask();

    for (int index = 0; index < idList.size(); index++)
      Mockito.verify(comicService, Mockito.times(1)).getComic(idList.get(index));
    Mockito.verify(saveComicTaskEncoderObjectFactory, Mockito.times(idList.size())).getObject();
    Mockito.verify(convertComicTaskEncoder, Mockito.times(idList.size())).setComic(comic);
    Mockito.verify(convertComicTaskEncoder, Mockito.times(idList.size()))
        .setTargetArchiveType(TEST_ARCHIVE_TYPE);
    Mockito.verify(convertComicTaskEncoder, Mockito.times(idList.size()))
        .setRenamePages(TEST_RENAME_PAGES);
    Mockito.verify(convertComicTaskEncoder, Mockito.times(idList.size()))
        .setDeletePages(TEST_DELETE_PAGES);
    Mockito.verify(convertComicTaskEncoder, Mockito.times(idList.size()))
        .setDeleteOriginal(TEST_DELETE_ORIGINAL_COMIC);
    Mockito.verify(taskService, Mockito.times(idList.size())).save(taskArgumentCaptor.getValue());
  }
}
