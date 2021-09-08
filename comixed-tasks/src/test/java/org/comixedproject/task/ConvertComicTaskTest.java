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

package org.comixedproject.task;

import static junit.framework.TestCase.assertNotNull;

import java.io.IOException;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

@PowerMockIgnore({"com.sun.org.apache.xerces.*", "javax.xml.*", "org.xml.*", "javax.management.*"})
@RunWith(PowerMockRunner.class)
@PrepareForTest({ArchiveType.class, FileUtils.class})
public class ConvertComicTaskTest {
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();
  private static final String TEST_ORIGINAL_COMIC_FILENAME = "src/test/resources/original.cbz";
  private static final Long TEST_COMIC_ID = 17L;

  @InjectMocks private ConvertComicTask task;
  @Mock private ComicService comicService;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private Comic sourceComic;
  @Mock private Comic savedComic;
  @Mock private Comic convertedComic;
  @Mock private ArchiveType targetArchiveType;
  @Mock private ArchiveAdaptor targetArchiveAdaptor;
  @Mock private PersistedTask processComicPersistedTask;
  @Mock private TaskService taskService;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ReadingListService readingListService;

  @Before
  public void setUp() throws IOException, ArchiveAdaptorException, ComicException {
    Mockito.when(targetArchiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(convertedComic);
    Mockito.when(sourceComic.getId()).thenReturn(TEST_COMIC_ID);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(savedComic);
  }

  @Test
  public void testCreateDescription() {
    task.setComic(sourceComic);
    assertNotNull(task.createDescription());
  }

  @Test
  public void testStartTaskWithoutDeleteOriginal()
      throws IOException, ArchiveAdaptorException, TaskException, ComicException {
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
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(savedComic);
    Mockito.when(taskService.save(Mockito.any(PersistedTask.class)))
        .thenReturn(processComicPersistedTask);

    Mockito.when(sourceComic.getReadingLists()).thenReturn(readingListSet);
    Mockito.when(readingListService.saveReadingList(Mockito.any(ReadingList.class)))
        .thenReturn(readingList);

    task.startTask();

    Mockito.verify(sourceComic, Mockito.times(1)).removeDeletedPages(TEST_DELETE_PAGES);
    Mockito.verify(targetArchiveAdaptor, Mockito.times(1))
        .saveComic(sourceComic, TEST_RENAME_PAGES);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(convertedComic, ComicEvent.archiveRecreated);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(readingListService, Mockito.times(1)).saveReadingList(readingList);

    Assert.assertTrue(
        "Reading list don't contain original comic", readingList.getComics().contains(sourceComic));
    Assert.assertTrue(
        "Reading list don't contain converted comic", readingList.getComics().contains(savedComic));
  }

  @Test
  public void testStartTaskWithDeleteOriginal()
      throws IOException, ArchiveAdaptorException, TaskException {
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
    Mockito.when(taskService.save(Mockito.any(PersistedTask.class)))
        .thenReturn(processComicPersistedTask);

    Mockito.when(sourceComic.getReadingLists()).thenReturn(readingListSet);
    Mockito.when(readingListService.saveReadingList(Mockito.any(ReadingList.class)))
        .thenReturn(readingList);

    Mockito.when(sourceComic.getFilename()).thenReturn(TEST_ORIGINAL_COMIC_FILENAME);
    PowerMockito.mockStatic(FileUtils.class);
    PowerMockito.doNothing().when(FileUtils.class);
    FileUtils.forceDelete(Mockito.any());

    task.startTask();

    Mockito.verify(sourceComic, Mockito.times(1)).removeDeletedPages(TEST_DELETE_PAGES);
    Mockito.verify(targetArchiveAdaptor, Mockito.times(1))
        .saveComic(sourceComic, TEST_RENAME_PAGES);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(convertedComic, ComicEvent.archiveRecreated);

    Assert.assertFalse(
        "Reading list contain original comic", readingList.getComics().contains(sourceComic));
    Assert.assertTrue(
        "Reading list don't contain converted comic", readingList.getComics().contains(savedComic));
  }
}
