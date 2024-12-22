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
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.library.LastReadService;
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
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "2024";
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private ComicBookSelectionController controller;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private ComicBookService comicBookService;
  @Mock private LastReadService lastReadService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private HttpSession httpSession;
  @Mock private List selectionIdList;
  @Mock private Principal principal;
  @Mock private List<Long> comicDetailIdList;

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(selectionIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_SELECTIONS);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(lastReadService.getComicBookIdsForUser(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicDetailIdList);
  }

  @Test
  public void testGetAllSelections() throws ComicBookSelectionException {
    final List result = controller.getAllSelections(httpSession);

    assertNotNull(result);
    assertEquals(selectionIdList, result);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
  }

  @Test
  public void testAddSingleSelection_selecting() throws ComicBookSelectionException {
    controller.addSingleSelection(httpSession, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .addComicSelectionForUser(selectionIdList, TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddSingleSelection_deselecting() throws ComicBookSelectionException {
    controller.deleteSingleSelection(httpSession, TEST_COMIC_BOOK_ID);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .removeComicSelectionFromUser(selectionIdList, TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testSelectComicBooksByFilter_selecting() throws ComicBookSelectionException {
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
  public void testSelectComicBooksByFilter_deselecting() throws ComicBookSelectionException {
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
    Mockito.when(opdsUtils.urlDecodeString(TEST_TAG_VALUE)).thenReturn(TEST_TAG_VALUE);

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
    Mockito.when(opdsUtils.urlDecodeString(TEST_TAG_VALUE)).thenReturn(TEST_TAG_VALUE);

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
  public void testAddSelectionsById_selecting() throws ComicBookSelectionException {
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
  public void testAddSelectionsById_deselecting() throws ComicBookSelectionException {
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
  public void testAddSelectionsByPublisherForAddition_selecting()
      throws ComicBookSelectionException {
    Mockito.when(comicBookService.getIdsByPublisher(Mockito.anyString()))
        .thenReturn(selectionIdList);

    controller.addComicBookSelectionsByPublisher(
        httpSession, new AddComicBookSelectionsByPublisherRequest(TEST_PUBLISHER, true));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1)).getIdsByPublisher(TEST_PUBLISHER);
    Mockito.verify(selectionIdList, Mockito.times(1)).addAll(selectionIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddSelectionsByPublisherForAddition_deselecting()
      throws ComicBookSelectionException {
    Mockito.when(comicBookService.getIdsByPublisher(Mockito.anyString()))
        .thenReturn(selectionIdList);

    controller.addComicBookSelectionsByPublisher(
        httpSession, new AddComicBookSelectionsByPublisherRequest(TEST_PUBLISHER, false));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1)).getIdsByPublisher(TEST_PUBLISHER);
    Mockito.verify(selectionIdList, Mockito.times(1)).removeAll(selectionIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddSelectionsByPublisherSeriesVolume_selecting()
      throws ComicBookSelectionException {
    Mockito.when(
            comicBookService.getIdsByPublisherSeriesAndVolume(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(selectionIdList);

    controller.addComicBookSelectionsByPublisherSeriesVolume(
        httpSession,
        new AddComicBookSelectionsByPublisherSeriesVolumeRequest(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, true));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1))
        .getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
    Mockito.verify(selectionIdList, Mockito.times(1)).addAll(selectionIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddSelectionsByPublisherSeriesVolume_deselecting()
      throws ComicBookSelectionException {
    Mockito.when(
            comicBookService.getIdsByPublisherSeriesAndVolume(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(selectionIdList);

    controller.addComicBookSelectionsByPublisherSeriesVolume(
        httpSession,
        new AddComicBookSelectionsByPublisherSeriesVolumeRequest(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, false));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1))
        .getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
    Mockito.verify(selectionIdList, Mockito.times(1)).removeAll(selectionIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddDuplicateComicBooksToSelections() throws ComicBookSelectionException {
    Mockito.when(comicBookService.getDuplicateComicIds()).thenReturn(selectionIdList);

    controller.addDuplicateComicBooksSelection(
        httpSession, new DuplicateComicBooksSelectionRequest(true));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1)).getDuplicateComicIds();
    Mockito.verify(selectionIdList, Mockito.times(1)).addAll(selectionIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testRemoveDuplicateComicBooksToSelections() throws ComicBookSelectionException {
    Mockito.when(comicBookService.getDuplicateComicIds()).thenReturn(selectionIdList);

    controller.addDuplicateComicBooksSelection(
        httpSession, new DuplicateComicBooksSelectionRequest(false));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1)).getDuplicateComicIds();
    Mockito.verify(selectionIdList, Mockito.times(1)).removeAll(selectionIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddUnreadComicBooksSelection_selectingRead() throws ComicBookSelectionException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicBooksSelectionRequest(true, false));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(lastReadService, Mockito.times(1)).getComicBookIdsForUser(TEST_EMAIL, false);
    Mockito.verify(selectionIdList, Mockito.times(1)).addAll(comicDetailIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddUnreadComicBooksSelection_deselectingRead()
      throws ComicBookSelectionException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicBooksSelectionRequest(false, false));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(lastReadService, Mockito.times(1)).getComicBookIdsForUser(TEST_EMAIL, false);
    Mockito.verify(selectionIdList, Mockito.times(1)).removeAll(comicDetailIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddUnreadComicBooksSelection_selectingUnread()
      throws ComicBookSelectionException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicBooksSelectionRequest(true, true));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(lastReadService, Mockito.times(1)).getComicBookIdsForUser(TEST_EMAIL, true);
    Mockito.verify(selectionIdList, Mockito.times(1)).addAll(comicDetailIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectionIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testAddUnreadComicBooksSelection_deselectingUnread()
      throws ComicBookSelectionException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicBooksSelectionRequest(false, true));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(lastReadService, Mockito.times(1)).getComicBookIdsForUser(TEST_EMAIL, true);
    Mockito.verify(selectionIdList, Mockito.times(1)).removeAll(comicDetailIdList);
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
