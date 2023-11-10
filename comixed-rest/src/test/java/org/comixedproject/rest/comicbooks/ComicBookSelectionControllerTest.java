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

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.comicbooks.AddComicBookSelectionsByIdRequest;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
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
  private static final ComicTagType TEST_TAG_TYPE = ComicTagType.CHARACTER;
  private static final String TEST_TAG_VALUE = "The Batman";

  @InjectMocks private ComicBookSelectionController controller;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private HttpSession httpSession;
  @Mock private List selectionIdList;

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(selectionIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testGetAllSelections() throws ComicBookSelectionException {
    final List result = controller.getAllSelections(httpSession);

    assertNotNull(result);
    assertEquals(selectionIdList, result);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
  }

  @Test
  public void testAddSingleSelection() throws ComicBookSelectionException {
    controller.addSingleSelection(httpSession, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .addComicSelectionForUser(selectionIdList, TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testRemoveSingleSelection() throws ComicBookSelectionException {
    controller.deleteSingleSelection(httpSession, TEST_COMIC_BOOK_ID);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .removeComicSelectionFromUser(selectionIdList, TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testSelectMultipleComicWithAdded() throws ComicBookSelectionException {
    controller.selectComicBooksByFilter(
        httpSession,
        new MultipleComicBooksSelectionRequest(null, null, null, null, null, false, null, true));

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectByFilter(selectionIdList, null, null, null, null, null, false, null, true);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testSelectMultipleComicWithRemoving() throws ComicBookSelectionException {
    controller.selectComicBooksByFilter(
        httpSession,
        new MultipleComicBooksSelectionRequest(null, null, null, null, null, false, null, false));

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectByFilter(selectionIdList, null, null, null, null, null, false, null, false);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddComicBooksByTagTypeAndValue() throws ComicBookSelectionException {
    Mockito.when(opdsUtils.urlDecodeString(TEST_TAG_VALUE.toString()))
        .thenReturn(TEST_TAG_VALUE.toString());

    controller.addComicBooksByTagTypeAndValue(
        httpSession, TEST_TAG_TYPE.getValue(), TEST_TAG_VALUE);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .addByTagTypeAndValue(selectionIdList, TEST_TAG_TYPE, TEST_TAG_VALUE);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testRemoveComicBooksByTagTypeAndValue() throws ComicBookSelectionException {
    Mockito.when(opdsUtils.urlDecodeString(TEST_TAG_VALUE.toString()))
        .thenReturn(TEST_TAG_VALUE.toString());

    controller.removeComicBooksByTagTypeAndValue(
        httpSession, TEST_TAG_TYPE.getValue(), TEST_TAG_VALUE);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .removeByTagTypeAndValue(selectionIdList, TEST_TAG_TYPE, TEST_TAG_VALUE);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddSelectionsByIdForAddition() throws ComicBookSelectionException {
    final List<Long> comicBookIdList = new ArrayList<Long>();
    for (long index = 1000L; index < 2000L; index++) comicBookIdList.add(index);

    controller.addComicBookSelectionsById(
        httpSession, new AddComicBookSelectionsByIdRequest(comicBookIdList, true));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(selectionIdList, Mockito.times(1)).addAll(comicBookIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddSelectionsByIdForRemoval() throws ComicBookSelectionException {
    final List<Long> comicBookIdList = new ArrayList<Long>();
    for (long index = 1000L; index < 2000L; index++) comicBookIdList.add(index);

    controller.addComicBookSelectionsById(
        httpSession, new AddComicBookSelectionsByIdRequest(comicBookIdList, false));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(selectionIdList, Mockito.times(1)).removeAll(comicBookIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testClearSelections() throws ComicBookSelectionException {
    controller.clearSelections(httpSession);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }
}
