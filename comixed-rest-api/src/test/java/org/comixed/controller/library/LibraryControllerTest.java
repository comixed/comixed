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
import org.comixed.model.library.Comic;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.comixed.net.GetComicsRequest;
import org.comixed.net.GetComicsResponse;
import org.comixed.service.library.ComicService;
import org.comixed.service.library.LibraryService;
import org.comixed.service.user.ComiXedUserException;
import org.comixed.service.user.UserService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibraryControllerTest {
  private static final int TEST_PAGE = 29;
  private static final int TEST_COUNT = 50;
  private static final String TEST_SORT_FIELD = "sortableIssueNumber";
  private static final Date TEST_LATEST_UPDATED_DATE = new Date();
  private static final long TEST_COMIC_COUNT = 71765L;
  private static final boolean TEST_ASCENDING = false;
  private static final String TEST_USER_EMAIL = "reader@localhost";

  @InjectMocks private LibraryController libraryController;
  @Mock private LibraryService libraryService;
  @Mock private UserService userService;
  @Mock private ComicService comicService;
  @Mock private List<Comic> comicList;
  @Mock private List<LastReadDate> lastReadList;
  @Mock private Principal principal;
  @Mock private ComiXedUser user;

  @Test
  public void testGetComics() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            libraryService.getComics(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicList);
    Mockito.when(comicService.getLastReadDates(Mockito.anyList(), Mockito.any()))
        .thenReturn(lastReadList);
    Mockito.when(libraryService.getLatestUpdatedDate()).thenReturn(TEST_LATEST_UPDATED_DATE);
    Mockito.when(libraryService.getComicCount()).thenReturn(TEST_COMIC_COUNT);

    final GetComicsResponse result =
        libraryController.getComics(
            principal,
            new GetComicsRequest(TEST_PAGE, TEST_COUNT, TEST_SORT_FIELD, TEST_ASCENDING));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(lastReadList, result.getLastReadDates());
    assertEquals(TEST_LATEST_UPDATED_DATE, result.getLatestUpdatedDate());
    assertEquals(TEST_COMIC_COUNT, result.getComicCount());

    Mockito.verify(libraryService, Mockito.times(1))
        .getComics(TEST_PAGE, TEST_COUNT, TEST_SORT_FIELD, TEST_ASCENDING);
    Mockito.verify(comicService, Mockito.times(1)).getLastReadDates(comicList, user);
    Mockito.verify(libraryService, Mockito.times(1)).getLatestUpdatedDate();
    Mockito.verify(libraryService, Mockito.times(1)).getComicCount();
  }
}
