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

import static junit.framework.TestCase.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import java.util.List;
import javax.servlet.http.HttpSession;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.comicbooks.ComicSelectionException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookSelectionControllerTest {
  private static final String TEST_ENCODED_SELECTIONS = "This is the encoded selection set";
  private static final String TEST_REENCODED_SELECTIONS = "This is the selection set re-encoded";
  private static final Long TEST_COMIC_BOOK_ID = 17L;

  @InjectMocks private ComicBookSelectionController controller;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private HttpSession httpSession;
  @Mock private List selectionIdList;

  @Before
  public void setUp() throws ComicSelectionException {
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(selectionIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testGetAllSelections() throws ComicSelectionException {
    final List result = controller.getAllSelections(httpSession);

    assertNotNull(result);
    assertEquals(selectionIdList, result);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
  }

  @Test
  public void testAddSingleSelection() throws ComicSelectionException {
    controller.addSingleSelection(httpSession, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .addComicSelectionForUser(selectionIdList, TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testRemoveSingleSelection() throws ComicSelectionException {
    controller.deleteSingleSelection(httpSession, TEST_COMIC_BOOK_ID);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .removeComicSelectionFromUser(selectionIdList, TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testSelectMultipleComicWithAdded() throws ComicSelectionException {
    controller.selectMultipleComicBooks(
        httpSession,
        new MultipleComicBooksSelectionRequest(
            null, null, null, null, null, false, false, null, true));

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            selectionIdList, null, null, null, null, null, false, false, null, true);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testSelectMultipleComicWithRemoving() throws ComicSelectionException {
    controller.selectMultipleComicBooks(
        httpSession,
        new MultipleComicBooksSelectionRequest(
            null, null, null, null, null, false, false, null, false));

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            selectionIdList, null, null, null, null, null, false, false, null, false);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testClearSelections() throws ComicSelectionException {
    controller.clearSelections(httpSession);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }
}
