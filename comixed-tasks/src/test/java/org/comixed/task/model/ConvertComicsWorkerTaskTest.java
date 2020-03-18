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

package org.comixed.task.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.library.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.encoders.ConvertComicTaskEncoder;
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

  @InjectMocks private ConvertComicsWorkerTask task;
  @Mock private TaskRepository taskRepository;
  @Mock private ObjectFactory<ConvertComicTaskEncoder> saveComicTaskEncoderObjectFactory;
  @Mock private ConvertComicTaskEncoder convertComicTaskEncoder;
  @Mock private Comic comic;
  @Mock private Task savedTask;
  @Captor private ArgumentCaptor<Task> taskArgumentCaptor;

  private List<Comic> comicList = new ArrayList<>();

  @Test
  public void testStartTask() throws WorkerTaskException {
    for (int index = 0; index < 25; index++) {
      comicList.add(comic);
    }
    task.setComicList(comicList);
    task.setTargetArchiveType(TEST_ARCHIVE_TYPE);
    task.setRenamePages(TEST_RENAME_PAGES);

    Mockito.when(saveComicTaskEncoderObjectFactory.getObject()).thenReturn(convertComicTaskEncoder);
    Mockito.when(taskRepository.save(taskArgumentCaptor.capture())).thenReturn(savedTask);

    task.startTask();

    Mockito.verify(saveComicTaskEncoderObjectFactory, Mockito.times(comicList.size())).getObject();
    Mockito.verify(convertComicTaskEncoder, Mockito.times(comicList.size())).setComic(comic);
    Mockito.verify(convertComicTaskEncoder, Mockito.times(comicList.size()))
        .setTargetArchiveType(TEST_ARCHIVE_TYPE);
    Mockito.verify(convertComicTaskEncoder, Mockito.times(comicList.size()))
        .setRenamePages(TEST_RENAME_PAGES);
    Mockito.verify(taskRepository, Mockito.times(comicList.size()))
        .save(taskArgumentCaptor.getValue());
  }
}
