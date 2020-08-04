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
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.library.ReadingListService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.ProcessComicWorkerTaskEncoder;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.beans.factory.ObjectFactory;

@PowerMockIgnore({"com.sun.org.apache.xerces.*", "javax.xml.*", "org.xml.*", "javax.management.*"})
@RunWith(PowerMockRunner.class)
@PrepareForTest({ArchiveType.class, FileUtils.class})
class ConvertComicWorkerTaskTest {
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_ORIGINAL_COMIC = RANDOM.nextBoolean();
  private static final String TEST_ORIGINAL_COMIC_FILENAME = "src/test/resources/original.cbz";

  @InjectMocks private ConvertComicWorkerTask task;
  @Mock private ComicService comicService;
  @Mock private Comic sourceComic;
  @Mock private Comic savedComic;
  @Mock private Comic convertedComic;
  @Mock private ArchiveType targetArchiveType;
  @Mock private ArchiveAdaptor targetArchiveAdaptor;
  @Mock private ObjectFactory<ProcessComicWorkerTaskEncoder> processComicTaskEncoderObjectFactory;
  @Mock private ProcessComicWorkerTaskEncoder processComicTaskEncoder;
  @Mock private Task processComicTask;
  @Mock private TaskService taskService;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ReadingListService readingListService;

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
  public void testSetDeleteOriginal() {
    task.setDeleteOriginal(TEST_DELETE_ORIGINAL_COMIC);

    assertEquals(TEST_DELETE_ORIGINAL_COMIC, task.isDeleteOriginal());
  }

  @Test
  public void testStartTaskWithoutDeleteOriginal()
      throws IOException, ArchiveAdaptorException, WorkerTaskException {
    task.setComic(sourceComic);
    task.setTargetArchiveType(targetArchiveType);
    task.setRenamePages(TEST_RENAME_PAGES);
    task.setDeletePages(TEST_DELETE_PAGES);
    task.setDeleteOriginal(false);

    Set<ReadingList> readingListSet = new HashSet<>();
    ReadingList readingList = new ReadingList();
    readingList.setName("test");
    readingList.getComics().add(sourceComic);
    readingListSet.add(readingList);

    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(targetArchiveAdaptor);
    Mockito.when(targetArchiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(savedComic);
    Mockito.when(comicService.save(Mockito.any(Comic.class))).thenReturn(savedComic);
    Mockito.when(processComicTaskEncoderObjectFactory.getObject())
        .thenReturn(processComicTaskEncoder);
    Mockito.when(processComicTaskEncoder.encode()).thenReturn(processComicTask);
    Mockito.when(taskService.save(Mockito.any(Task.class))).thenReturn(processComicTask);

    Mockito.when(sourceComic.getReadingLists()).thenReturn(readingListSet);
    Mockito.when(readingListService.save(Mockito.any(ReadingList.class))).thenReturn(readingList);
    /*
    Mockito.when(sourceComic.getFilename()).thenReturn(TEST_ORIGINAL_COMIC_FILENAME);
    PowerMockito.mockStatic(FileUtils.class);
     */

    task.startTask();

    Mockito.verify(sourceComic, Mockito.times(1)).removeDeletedPages(TEST_DELETE_PAGES);
    Mockito.verify(targetArchiveAdaptor, Mockito.times(1))
        .saveComic(sourceComic, TEST_RENAME_PAGES);
    Mockito.verify(savedComic, Mockito.times(1)).setDateLastUpdated(Mockito.any(Date.class));
    Mockito.verify(comicService, Mockito.times(1)).save(savedComic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setComic(convertedComic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setDeleteBlockedPages(false);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setIgnoreMetadata(false);
    Mockito.verify(taskService, Mockito.times(1)).save(processComicTask);
    Mockito.verify(readingListService, Mockito.times(1)).save(readingList);

    Assert.assertTrue(
        "Reading list don't contain original comic", readingList.getComics().contains(sourceComic));
    Assert.assertTrue(
        "Reading list don't contain converted comic",
        readingList.getComics().contains(convertedComic));
  }

  @Test
  public void testStartTaskWithDeleteOriginal()
      throws IOException, ArchiveAdaptorException, WorkerTaskException {
    task.setComic(sourceComic);
    task.setTargetArchiveType(targetArchiveType);
    task.setRenamePages(TEST_RENAME_PAGES);
    task.setDeletePages(TEST_DELETE_PAGES);
    task.setDeleteOriginal(true);

    Set<ReadingList> readingListSet = new HashSet<>();
    ReadingList readingList = new ReadingList();
    readingList.setName("test");
    readingList.getComics().add(sourceComic);
    readingListSet.add(readingList);

    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(targetArchiveAdaptor);
    Mockito.when(targetArchiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(savedComic);
    Mockito.when(comicService.save(Mockito.any(Comic.class))).thenReturn(convertedComic);
    Mockito.when(processComicTaskEncoderObjectFactory.getObject())
        .thenReturn(processComicTaskEncoder);
    Mockito.when(processComicTaskEncoder.encode()).thenReturn(processComicTask);
    Mockito.when(taskService.save(Mockito.any(Task.class))).thenReturn(processComicTask);

    Mockito.when(sourceComic.getReadingLists()).thenReturn(readingListSet);
    Mockito.when(readingListService.save(Mockito.any(ReadingList.class))).thenReturn(readingList);

    Mockito.when(sourceComic.getFilename()).thenReturn(TEST_ORIGINAL_COMIC_FILENAME);
    PowerMockito.mockStatic(FileUtils.class);
    PowerMockito.doNothing().when(FileUtils.class);
    FileUtils.forceDelete(Mockito.any());

    task.startTask();

    Mockito.verify(sourceComic, Mockito.times(1)).removeDeletedPages(TEST_DELETE_PAGES);
    Mockito.verify(targetArchiveAdaptor, Mockito.times(1))
        .saveComic(sourceComic, TEST_RENAME_PAGES);
    Mockito.verify(savedComic, Mockito.times(1)).setDateLastUpdated(Mockito.any(Date.class));
    Mockito.verify(comicService, Mockito.times(1)).save(savedComic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setComic(savedComic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setDeleteBlockedPages(false);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setIgnoreMetadata(false);
    Mockito.verify(taskService, Mockito.times(1)).save(processComicTask);

    Assert.assertFalse(
        "Reading list contain original comic", readingList.getComics().contains(sourceComic));
    Assert.assertTrue(
        "Reading list don't contain converted comic",
        readingList.getComics().contains(convertedComic));
  }
}
