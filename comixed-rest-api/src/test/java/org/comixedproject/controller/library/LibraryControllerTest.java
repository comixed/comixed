/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.controller.library;

import static junit.framework.TestCase.*;

import java.security.Principal;
import java.util.Date;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.net.*;
import org.comixedproject.model.net.library.MoveComicsRequest;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.library.LibraryService;
import org.comixedproject.service.library.ReadingListService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.task.model.ConvertComicsWorkerTask;
import org.comixedproject.task.model.MoveComicsWorkerTask;
import org.comixedproject.task.model.WorkerTask;
import org.comixedproject.task.runner.TaskManager;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class LibraryControllerTest {
  private static final Date TEST_LATEST_UPDATED_DATE = new Date();
  private static final String TEST_USER_EMAIL = "reader@localhost";
  private static final int TEST_MAXIMUM_COMICS = 1000;
  private static final Long TEST_MOST_RECENT_COMIC_ID = 71765L;
  private static final long TEST_PROCESSING_COUNT = 797L;
  private static final Long TEST_TIMEOUT = 1L;
  private static final Date TEST_LAST_UPDATED_DATE = new Date();
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_PHYSICAL_FILES = RANDOM.nextBoolean();
  private static final String TEST_RENAMING_RULE = "PUBLISHER/SERIES/VOLUME/SERIES vVOLUME #ISSUE";
  private static final String TEST_DESTINATION_DIRECTORY = "/home/comixedreader/Documents/comics";
  private static final Boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_ORIGINAL_COMIC = RANDOM.nextBoolean();

  @InjectMocks private LibraryController libraryController;
  @Mock private LibraryService libraryService;
  @Mock private UserService userService;
  @Mock private ComicService comicService;
  @Mock private List<Comic> comicList;
  @Mock private Comic comic;
  @Mock private List<LastReadDate> lastReadList;
  @Mock private Principal principal;
  @Mock private ComiXedUser user;
  @Mock private List<Long> idList;
  @Mock private ReadingListService readingListService;
  @Mock private List<ReadingList> readingLists;
  @Mock private TaskManager taskManager;
  @Mock private ObjectFactory<ConvertComicsWorkerTask> convertComicsWorkerTaskObjectFactory;
  @Mock private ConvertComicsWorkerTask convertComicsWorkerTask;
  @Mock private ObjectFactory<MoveComicsWorkerTask> moveComicsWorkerTaskObjectFactory;
  @Mock private MoveComicsWorkerTask moveComicsWorkerTask;

  @Test
  public void testGetUpdatedComics() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            libraryService.getComicsUpdatedSince(
                Mockito.anyString(), Mockito.any(Date.class), Mockito.anyInt(), Mockito.anyLong()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(false);
    Mockito.when(comicList.size()).thenReturn(TEST_MAXIMUM_COMICS);
    Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);
    Mockito.when(comic.getId()).thenReturn(TEST_MOST_RECENT_COMIC_ID);
    Mockito.when(comic.getDateLastUpdated()).thenReturn(TEST_LAST_UPDATED_DATE);
    Mockito.when(libraryService.getLastReadDatesSince(Mockito.anyString(), Mockito.any(Date.class)))
        .thenReturn(lastReadList);
    Mockito.when(libraryService.getProcessingCount()).thenReturn(TEST_PROCESSING_COUNT);
    Mockito.when(
            readingListService.getReadingListsForUser(Mockito.anyString(), Mockito.any(Date.class)))
        .thenReturn(readingLists);

    GetUpdatedComicsResponse result =
        libraryController.getUpdatedComics(
            principal,
            new GetUpdatedComicsRequest(
                TEST_LATEST_UPDATED_DATE.getTime(),
                TEST_MAXIMUM_COMICS,
                TEST_MOST_RECENT_COMIC_ID,
                TEST_PROCESSING_COUNT,
                TEST_TIMEOUT));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertEquals(TEST_MOST_RECENT_COMIC_ID, result.getLastComicId());
    assertEquals(TEST_LAST_UPDATED_DATE, result.getMostRecentUpdate());
    assertSame(lastReadList, result.getLastReadDates());
    assertFalse(result.hasMoreUpdates());
    assertEquals(TEST_PROCESSING_COUNT, result.getProcessingCount());
    assertEquals(readingLists, result.getReadingLists());

    Mockito.verify(libraryService, Mockito.times(1))
        .getComicsUpdatedSince(
            TEST_USER_EMAIL,
            TEST_LATEST_UPDATED_DATE,
            TEST_MAXIMUM_COMICS + 1,
            TEST_MOST_RECENT_COMIC_ID);
    Mockito.verify(libraryService, Mockito.times(1))
        .getLastReadDatesSince(TEST_USER_EMAIL, TEST_LATEST_UPDATED_DATE);
    Mockito.verify(readingListService, Mockito.times(1))
        .getReadingListsForUser(TEST_USER_EMAIL, TEST_LAST_UPDATED_DATE);
  }

  @Test
  public void testGetUpdatedComicsMoreRemaining() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            libraryService.getComicsUpdatedSince(
                Mockito.anyString(), Mockito.any(Date.class), Mockito.anyInt(), Mockito.anyLong()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(false);
    Mockito.when(comicList.size()).thenReturn(TEST_MAXIMUM_COMICS + 1);
    Mockito.when(comicList.remove(Mockito.anyInt())).thenReturn(comic);
    Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);
    Mockito.when(comic.getId()).thenReturn(TEST_MOST_RECENT_COMIC_ID);
    Mockito.when(comic.getDateLastUpdated()).thenReturn(TEST_LAST_UPDATED_DATE);
    Mockito.when(libraryService.getLastReadDatesSince(Mockito.anyString(), Mockito.any(Date.class)))
        .thenReturn(lastReadList);
    Mockito.when(libraryService.getProcessingCount()).thenReturn(TEST_PROCESSING_COUNT);

    GetUpdatedComicsResponse result =
        libraryController.getUpdatedComics(
            principal,
            new GetUpdatedComicsRequest(
                TEST_LATEST_UPDATED_DATE.getTime(),
                TEST_MAXIMUM_COMICS,
                TEST_MOST_RECENT_COMIC_ID,
                TEST_PROCESSING_COUNT,
                TEST_TIMEOUT));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertEquals(TEST_MOST_RECENT_COMIC_ID, result.getLastComicId());
    assertEquals(TEST_LAST_UPDATED_DATE, result.getMostRecentUpdate());
    assertSame(lastReadList, result.getLastReadDates());
    assertTrue(result.hasMoreUpdates());
    assertEquals(TEST_PROCESSING_COUNT, result.getProcessingCount());

    Mockito.verify(libraryService, Mockito.times(1))
        .getComicsUpdatedSince(
            TEST_USER_EMAIL,
            TEST_LATEST_UPDATED_DATE,
            TEST_MAXIMUM_COMICS + 1,
            TEST_MOST_RECENT_COMIC_ID);
    Mockito.verify(comicList, Mockito.times(1)).remove(TEST_MAXIMUM_COMICS);
    Mockito.verify(libraryService, Mockito.times(1))
        .getLastReadDatesSince(TEST_USER_EMAIL, TEST_LATEST_UPDATED_DATE);
  }

  @Test
  public void testGetUpdatedComicsNoResult() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            libraryService.getComicsUpdatedSince(
                Mockito.anyString(), Mockito.any(Date.class), Mockito.anyInt(), Mockito.anyLong()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(true);
    Mockito.when(comicList.size()).thenReturn(0);
    Mockito.when(libraryService.getLastReadDatesSince(Mockito.anyString(), Mockito.any(Date.class)))
        .thenReturn(lastReadList);
    Mockito.when(libraryService.getProcessingCount()).thenReturn(TEST_PROCESSING_COUNT);

    GetUpdatedComicsResponse result =
        libraryController.getUpdatedComics(
            principal,
            new GetUpdatedComicsRequest(
                TEST_LATEST_UPDATED_DATE.getTime(),
                TEST_MAXIMUM_COMICS,
                TEST_MOST_RECENT_COMIC_ID,
                TEST_PROCESSING_COUNT,
                TEST_TIMEOUT));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertNull(result.getLastComicId());
    assertNull(result.getMostRecentUpdate());
    assertSame(lastReadList, result.getLastReadDates());
    assertFalse(result.hasMoreUpdates());
    assertEquals(TEST_PROCESSING_COUNT, result.getProcessingCount());

    Mockito.verify(libraryService, Mockito.atLeast(1))
        .getComicsUpdatedSince(
            TEST_USER_EMAIL,
            TEST_LATEST_UPDATED_DATE,
            TEST_MAXIMUM_COMICS + 1,
            TEST_MOST_RECENT_COMIC_ID);
    Mockito.verify(libraryService, Mockito.times(1))
        .getLastReadDatesSince(TEST_USER_EMAIL, TEST_LATEST_UPDATED_DATE);
  }

  @Test
  public void testConvertComics() {
    Mockito.when(convertComicsWorkerTaskObjectFactory.getObject())
        .thenReturn(convertComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    libraryController.convertComics(
        new ConvertComicsRequest(
            idList,
            TEST_ARCHIVE_TYPE,
            TEST_RENAME_PAGES,
            TEST_DELETE_PAGES,
            TEST_DELETE_ORIGINAL_COMIC));

    Mockito.verify(taskManager, Mockito.times(1)).runTask(convertComicsWorkerTask);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1)).setIdList(idList);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1))
        .setTargetArchiveType(TEST_ARCHIVE_TYPE);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1)).setRenamePages(TEST_RENAME_PAGES);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1)).setDeletePages(TEST_DELETE_PAGES);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1))
        .setDeleteOriginal(TEST_DELETE_ORIGINAL_COMIC);
  }

  @Test
  public void testConsolidate() {
    Mockito.when(libraryService.consolidateLibrary(Mockito.anyBoolean())).thenReturn(comicList);

    List<Comic> response =
        libraryController.consolidateLibrary(
            new ConsolidateLibraryRequest(TEST_DELETE_PHYSICAL_FILES));

    assertNotNull(response);
    assertSame(comicList, response);

    Mockito.verify(libraryService, Mockito.times(1)).consolidateLibrary(TEST_DELETE_PHYSICAL_FILES);
  }

  @Test
  public void testClearImageCache() throws LibraryException {
    Mockito.doNothing().when(libraryService).clearImageCache();

    ClearImageCacheResponse result = libraryController.clearImageCache();

    assertNotNull(result);
    assertTrue(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
    ;
  }

  @Test
  public void testClearImageCacheWithError() throws LibraryException {
    Mockito.doThrow(LibraryException.class).when(libraryService).clearImageCache();

    ClearImageCacheResponse result = libraryController.clearImageCache();

    assertNotNull(result);
    assertFalse(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
  }

  @Test
  public void testMoveLibrary() {
    Mockito.when(moveComicsWorkerTaskObjectFactory.getObject()).thenReturn(moveComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    final ApiResponse<Void> result =
        libraryController.moveComics(
            new MoveComicsRequest(
                TEST_DELETE_PHYSICAL_FILES, TEST_DESTINATION_DIRECTORY, TEST_RENAMING_RULE));

    assertNotNull(result);
    assertTrue(result.isSuccess());

    Mockito.verify(moveComicsWorkerTask, Mockito.times(1)).setDirectory(TEST_DESTINATION_DIRECTORY);
    Mockito.verify(moveComicsWorkerTask, Mockito.times(1)).setRenamingRule(TEST_RENAMING_RULE);
    Mockito.verify(taskManager, Mockito.times(1)).runTask(moveComicsWorkerTask);
  }
}
