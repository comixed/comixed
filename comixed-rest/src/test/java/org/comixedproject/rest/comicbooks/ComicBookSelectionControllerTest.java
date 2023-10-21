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
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
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
  public void testAddSingleSelectionThrowsException() throws ComicSelectionException {
    Mockito.doThrow(ComicSelectionException.class)
        .when(comicSelectionService)
        .addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    try {
      controller.addSingleSelection(principal, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1))
          .addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testAddSingleSelection() throws ComicSelectionException {
    controller.addSingleSelection(principal, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
  }

  @Test(expected = ComicSelectionException.class)
  public void testRemoveSingleSelectionThrowsException() throws ComicSelectionException {
    Mockito.doThrow(ComicSelectionException.class)
        .when(comicSelectionService)
        .removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    try {
      controller.deleteSingleSelection(principal, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1))
          .removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testRemoveSingleSelection() throws ComicSelectionException {
    controller.deleteSingleSelection(principal, TEST_COMIC_BOOK_ID);

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
  public void testClearSelections() throws ComicSelectionException {
    controller.clearSelections(principal);

    Mockito.verify(comicSelectionService, Mockito.times(1)).clearSelectedComicBooks(TEST_EMAIL);
  }
}
