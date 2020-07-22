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

package org.comixedproject.controller.opds;

import static org.junit.Assert.*;

import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.opds.OPDSBookmark;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class OPDSBookmarkControllerTest {

  private static final String TEST_USER_EMAIL = "reader@local";
  private static final String EXPECTED_MESSAGE = "Bookmark Not Found";
  private static final long TEST_COMIC_ID = 100L;
  private static final int TEST_PAGE_COUNT = 10;
  private static final String TEST_BOOKMARK = String.valueOf(TEST_PAGE_COUNT);
  @Rule public ExpectedException expectedException = ExpectedException.none();
  @InjectMocks private OPDSBookmarkController controller;
  @Mock private Authentication principal;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private ComicService comicService;
  @Mock private ComiXedUser user;
  @Mock private Comic comic;

  @Before
  public void setUp() throws ComicException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
  }

  @Test(expected = ComicException.class)
  public void testGetBookmarkComicNotfound() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(null);

    try {
      controller.getBookmark(principal, TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicException.class)
  public void testGetBookmarkNotFound() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(TEST_USER_EMAIL)).thenReturn(user);
    Mockito.when(user.getBookmark(Mockito.any())).thenReturn(null);

    try {
      controller.getBookmark(principal, TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
      Mockito.verify(user, Mockito.times(1)).getBookmark(comic);
    }
  }

  @Test
  public void testGetBookmark() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(TEST_USER_EMAIL)).thenReturn(user);
    Mockito.when(user.getBookmark(Mockito.any(Comic.class))).thenReturn(TEST_BOOKMARK);

    OPDSBookmark result = controller.getBookmark(principal, TEST_COMIC_ID);

    assertEquals(TEST_BOOKMARK, result.getMark());
    assertFalse(result.getIsFinished());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(user, Mockito.times(1)).getBookmark(comic);
  }

  @Test
  public void testGetBookmarkBookFinished() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(TEST_USER_EMAIL)).thenReturn(user);
    Mockito.when(user.getBookmark(comic)).thenReturn(TEST_BOOKMARK);
    Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_COUNT);
    OPDSBookmark result = controller.getBookmark(principal, TEST_COMIC_ID);

    assertEquals(TEST_BOOKMARK, result.getMark());
    assertTrue(result.getIsFinished());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(user, Mockito.times(1)).getBookmark(comic);
  }

  @Test
  public void testSetBookmark() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(TEST_USER_EMAIL)).thenReturn(user);

    ResponseEntity result =
        controller.setBookmark(
            principal, TEST_COMIC_ID, new OPDSBookmark(TEST_COMIC_ID, "1", true));

    assertNotNull(result);
  }
}
