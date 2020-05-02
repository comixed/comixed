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

package org.comixed.controller.library;

import static junit.framework.TestCase.*;

import java.security.Principal;
import java.util.Date;
import java.util.List;
import java.util.Random;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.comic.Comic;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.comixed.net.ConsolidateLibraryRequest;
import org.comixed.net.ConvertComicsRequest;
import org.comixed.net.GetUpdatedComicsRequest;
import org.comixed.net.GetUpdatedComicsResponse;
import org.comixed.service.comic.ComicService;
import org.comixed.service.library.LibraryService;
import org.comixed.service.user.UserService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

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

  @InjectMocks private LibraryController libraryController;
  @Mock private LibraryService libraryService;
  @Mock private UserService userService;
  @Mock private ComicService comicService;
  @Mock private List<Comic> comicList;
  @Mock private Comic comic;
  @Mock private List<LastReadDate> lastReadList;
  @Mock private Principal principal;
  @Mock private ComiXedUser user;
  @Mock private List<Long> comicIdList;

  @Test
  public void testGetUpdatedComics() {
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

    Mockito.verify(libraryService, Mockito.times(1))
        .getComicsUpdatedSince(
            TEST_USER_EMAIL,
            TEST_LATEST_UPDATED_DATE,
            TEST_MAXIMUM_COMICS + 1,
            TEST_MOST_RECENT_COMIC_ID);
    Mockito.verify(libraryService, Mockito.times(1))
        .getLastReadDatesSince(TEST_USER_EMAIL, TEST_LATEST_UPDATED_DATE);
  }

  @Test
  public void testGetUpdatedComicsMoreRemaining() {
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
  public void testGetUpdatedComicsNoResult() {
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
    libraryController.convertComics(
        new ConvertComicsRequest(comicIdList, TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES));

    Mockito.verify(libraryService, Mockito.times(1))
        .convertComics(comicIdList, TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES);
  }

  @Test
  public void testConsolidate() {
    Mockito.when(libraryService.consolidateLibrary(Mockito.anyBoolean())).thenReturn(comicList);

    List<Comic> response =
        libraryController.consolidateLibrary(
            new ConsolidateLibraryRequest(TEST_DELETE_PHYSICAL_FILES));
k
    assertNotNull(response);
    assertSame(comicList, response);

    Mockito.verify(libraryService, Mockito.times(1)).consolidateLibrary(TEST_DELETE_PHYSICAL_FILES);
  }
}
