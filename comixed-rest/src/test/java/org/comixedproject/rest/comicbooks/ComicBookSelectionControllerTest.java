/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.rest.comicbooks;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.security.Principal;
import java.util.Set;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.model.net.comicbooks.SingleComicBookSelectionRequest;
import org.comixedproject.service.comicbooks.ComicSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookSelectionControllerTest {
  private static final String TEST_EMAIL = "comixedreader@localhost";
  private static final Long TEST_COMIC_BOOK_ID = 17L;
  private static final Integer TEST_COVER_YEAR = RandomUtils.nextInt(50) + 1970;
  private static final Integer TEST_COVER_MONTH = RandomUtils.nextInt(12);
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;
  private static final ComicType TEST_COMIC_TYPE = ComicType.ISSUE;
  private static final ComicState TEST_COMIC_STATE = ComicState.REMOVED;
  private static final Boolean TEST_READ_STATE = RandomUtils.nextBoolean();
  private static final Boolean TEST_UNSCRAPED_STATE = RandomUtils.nextBoolean();
  private static final String TEST_SEARCH_TEXT = "The search text";
  private static final Boolean TEST_SELECT = RandomUtils.nextBoolean();

  @InjectMocks private ComicBookSelectionController controller;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private Principal principal;
  @Mock private Set<Long> selectionIdList;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test(expected = ComicSelectionException.class)
  public void testLoadComicSelectionsWithException() throws ComicSelectionException {
    Mockito.when(comicSelectionService.getAllForEmail(Mockito.anyString()))
        .thenThrow(ComicSelectionException.class);

    try {
      controller.getAllForEmail(principal);
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1)).getAllForEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testLoadComicSelections() throws ComicSelectionException {
    Mockito.when(comicSelectionService.getAllForEmail(Mockito.anyString()))
        .thenReturn(selectionIdList);

    final Set<Long> result = controller.getAllForEmail(principal);

    assertNotNull(result);
    assertSame(selectionIdList, result);

    Mockito.verify(comicSelectionService, Mockito.times(1)).getAllForEmail(TEST_EMAIL);
  }

  @Test(expected = ComicSelectionException.class)
  public void testSelectSingleComicAddingWithException() throws ComicSelectionException {
    Mockito.doThrow(ComicSelectionException.class)
        .when(comicSelectionService)
        .addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    try {
      controller.selectSingleComicBook(
          principal, new SingleComicBookSelectionRequest(TEST_COMIC_BOOK_ID, true));
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1))
          .addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testSelectSingleComicWithAdded() throws ComicSelectionException {
    controller.selectSingleComicBook(
        principal, new SingleComicBookSelectionRequest(TEST_COMIC_BOOK_ID, true));

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
  }

  @Test(expected = ComicSelectionException.class)
  public void testSelectSingleComicRemovingWithException() throws ComicSelectionException {
    Mockito.doThrow(ComicSelectionException.class)
        .when(comicSelectionService)
        .removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    try {
      controller.selectSingleComicBook(
          principal, new SingleComicBookSelectionRequest(TEST_COMIC_BOOK_ID, false));
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1))
          .removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testSelectSingleComicWithRemoving() throws ComicSelectionException {
    controller.selectSingleComicBook(
        principal, new SingleComicBookSelectionRequest(TEST_COMIC_BOOK_ID, false));

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
  }

  @Test
  public void testSelectMultipleComicWithAdded() throws ComicSelectionException {
    controller.selectMultipleComicBooks(
        principal,
        new MultipleComicBooksSelectionRequest(
            null, null, null, null, null, false, false, null, true));

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            TEST_EMAIL, null, null, null, null, null, false, false, null, true);
  }

  @Test
  public void testSelectMultipleComicWithRemoving() throws ComicSelectionException {
    controller.selectMultipleComicBooks(
        principal,
        new MultipleComicBooksSelectionRequest(
            null, null, null, null, null, false, false, null, false));

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            TEST_EMAIL, null, null, null, null, null, false, false, null, false);
  }

  @Test
  public void testClearSelections() {
    controller.clearSelections(principal);

    Mockito.verify(comicSelectionService, Mockito.times(1)).clearSelectedComicBooks(TEST_EMAIL);
  }
}
