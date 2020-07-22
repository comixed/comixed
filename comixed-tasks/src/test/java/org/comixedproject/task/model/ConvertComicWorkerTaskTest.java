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

import java.io.IOException;
import java.util.Date;
import java.util.Random;
import org.comixedproject.adaptors.ArchiveType;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.task.encoders.ProcessComicTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.beans.factory.ObjectFactory;

@PowerMockIgnore({"com.sun.org.apache.xerces.*", "javax.xml.*", "org.xml.*", "javax.management.*"})
@RunWith(PowerMockRunner.class)
@PrepareForTest({ArchiveType.class})
class ConvertComicWorkerTaskTest {
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();

  @InjectMocks private ConvertComicWorkerTask task;
  @Mock private ComicRepository comicRepository;
  @Mock private Comic sourceComic;
  @Mock private Comic savedComic;
  @Mock private Comic storedComic;
  @Mock private ArchiveType targetArchiveType;
  @Mock private ArchiveAdaptor targetArchiveAdaptor;
  @Mock private ObjectFactory<ProcessComicTaskEncoder> processComicTaskEncoderObjectFactory;
  @Mock private ProcessComicTaskEncoder processComicTaskEncoder;
  @Mock private Task processComicTask;
  @Mock private TaskRepository taskRepository;

  public ConvertComicWorkerTaskTest() {}

  @Test
  public void testSetComic() {
    task.setComic(sourceComic);

    assertSame(sourceComic, task.getComic());
  }

  @Test
  public void testSetTargetArchiveType() {
    task.setTargetArchiveType(targetArchiveType);

    assertSame(targetArchiveType, task.getTargetArchiveType());
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
  public void testExecute() throws IOException, ArchiveAdaptorException, WorkerTaskException {
    task.setComic(sourceComic);
    task.setTargetArchiveType(targetArchiveType);
    task.setRenamePages(TEST_RENAME_PAGES);
    task.setDeletePages(TEST_DELETE_PAGES);

    Mockito.when(targetArchiveType.getArchiveAdaptor()).thenReturn(targetArchiveAdaptor);
    Mockito.when(targetArchiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(savedComic);
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(storedComic);
    Mockito.when(processComicTaskEncoderObjectFactory.getObject())
        .thenReturn(processComicTaskEncoder);
    Mockito.when(processComicTaskEncoder.encode()).thenReturn(processComicTask);
    Mockito.when(taskRepository.save(Mockito.any(Task.class))).thenReturn(processComicTask);

    task.startTask();

    Mockito.verify(sourceComic, Mockito.times(1)).removeDeletedPages(TEST_DELETE_PAGES);
    Mockito.verify(targetArchiveAdaptor, Mockito.times(1))
        .saveComic(sourceComic, TEST_RENAME_PAGES);
    Mockito.verify(savedComic, Mockito.times(1)).setDateLastUpdated(Mockito.any(Date.class));
    Mockito.verify(comicRepository, Mockito.times(1)).save(savedComic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setComic(savedComic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setDeleteBlockedPages(false);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setIgnoreMetadata(false);
    Mockito.verify(taskRepository, Mockito.times(1)).save(processComicTask);
  }
}
