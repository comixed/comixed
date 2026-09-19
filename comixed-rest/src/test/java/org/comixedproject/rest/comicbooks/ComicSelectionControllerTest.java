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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;
import static org.comixedproject.rest.comicbooks.ComicSelectionController.LIBRARY_SELECTIONS;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicSelectionControllerTest {
  private static final String TEST_ENCODED_SELECTIONS = "This is the encoded selection set";
  private static final String TEST_REENCODED_SELECTIONS = "This is the selection set re-encoded";
  private static final Long TEST_COMIC_ID = 17L;
  private static final ComicTagType TEST_TAG_TYPE = ComicTagType.CHARACTER;
  private static final String TEST_TAG_VALUE = "The Batman";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "2024";
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private ComicSelectionController controller;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private UserService userService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private HttpSession httpSession;
  @Mock private List<Long> selectedIds;
  @Mock private Principal principal;

  private List<Long> comicIdList = new ArrayList<>();

  @BeforeEach
  void setUp() throws ComicSelectionException, ComiXedUserException {
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS)).thenReturn(selectedIds);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_SELECTIONS);
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(userService.getComicIdsForUser(anyString(), anyBoolean())).thenReturn(comicIdList);
  }

  @Test
  void getAllSelections() throws ComicSelectionException {
    final List result = controller.getAllSelections(httpSession);

    assertNotNull(result);
    assertEquals(selectedIds, result);

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
  }

  @Test
  void addSingleSelection_selecting() throws ComicSelectionException {
    controller.addSingleSelection(httpSession, principal, TEST_COMIC_ID);

    verify(comicSelectionService).addComicSelectionForUser(TEST_EMAIL, selectedIds, TEST_COMIC_ID);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addSingleSelection_deselecting() throws ComicSelectionException {
    controller.deleteSingleSelection(httpSession, principal, TEST_COMIC_ID);

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(comicSelectionService)
        .removeComicSelectionFromUser(TEST_EMAIL, selectedIds, TEST_COMIC_ID);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void selectComicBooksByFilter_selecting() throws ComicSelectionException {
    controller.selectComicBooksByFilter(
        httpSession,
        principal,
        new MultipleComicsSelectionRequest(
            null, null, null, null, null, false, false, null, null, true));

    verify(comicSelectionService)
        .selectByFilter(
            TEST_EMAIL, selectedIds, null, null, null, null, null, false, false, null, null, true);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void selectComicBooksByFilter_deselecting() throws ComicSelectionException {
    controller.selectComicBooksByFilter(
        httpSession,
        principal,
        new MultipleComicsSelectionRequest(
            null, null, null, null, null, false, false, null, null, false));

    verify(comicSelectionService)
        .selectByFilter(
            TEST_EMAIL, selectedIds, null, null, null, null, null, false, false, null, null, false);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addComicBooksByTagTypeAndValue() throws ComicSelectionException {
    when(opdsUtils.urlDecodeString(TEST_TAG_VALUE)).thenReturn(TEST_TAG_VALUE);

    controller.addComicBooksByTagTypeAndValue(
        httpSession, principal, TEST_TAG_TYPE, TEST_TAG_VALUE);

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(comicSelectionService).addByTagTypeAndValue(selectedIds, TEST_TAG_TYPE, TEST_TAG_VALUE);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void removeComicBooksByTagTypeAndValue() throws ComicSelectionException {
    when(opdsUtils.urlDecodeString(TEST_TAG_VALUE)).thenReturn(TEST_TAG_VALUE);

    controller.removeComicBooksByTagTypeAndValue(
        httpSession, principal, TEST_TAG_TYPE, TEST_TAG_VALUE);

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(comicSelectionService)
        .removeByTagTypeAndValue(selectedIds, TEST_TAG_TYPE, TEST_TAG_VALUE);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addSelectionsById_selecting() throws ComicSelectionException {
    for (long index = 1000L; index < 2000L; index++) comicIdList.add(index);

    controller.addComicBookSelectionsById(
        httpSession, principal, new AddComicSelectionsByIdRequest(comicIdList, true));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(selectedIds).addAll(comicIdList);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addSelectionsById_deselecting() throws ComicSelectionException {
    for (long index = 1000L; index < 2000L; index++) comicIdList.add(index);

    controller.addComicBookSelectionsById(
        httpSession, principal, new AddComicSelectionsByIdRequest(comicIdList, false));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(selectedIds).removeAll(comicIdList);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addSelectionsByPublisherForAddition_selecting() throws ComicSelectionException {
    when(displayableComicService.getIdsByPublisher(anyString())).thenReturn(selectedIds);

    controller.addComicBookSelectionsByPublisher(
        httpSession, principal, new AddComicSelectionsByPublisherRequest(TEST_PUBLISHER, true));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(displayableComicService).getIdsByPublisher(TEST_PUBLISHER);
    verify(selectedIds).addAll(selectedIds);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addSelectionsByPublisherForAddition_deselecting() throws ComicSelectionException {
    when(displayableComicService.getIdsByPublisher(anyString())).thenReturn(selectedIds);

    controller.addComicBookSelectionsByPublisher(
        httpSession, principal, new AddComicSelectionsByPublisherRequest(TEST_PUBLISHER, false));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(displayableComicService).getIdsByPublisher(TEST_PUBLISHER);
    verify(selectedIds).removeAll(selectedIds);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addSelectionsByPublisherSeriesVolume_selecting() throws ComicSelectionException {
    when(this.displayableComicService.getIdsByPublisherSeriesAndVolume(
            anyString(), anyString(), anyString()))
        .thenReturn(selectedIds);

    controller.addComicBookSelectionsByPublisherSeriesVolume(
        httpSession,
        principal,
        new AddComicSelectionsByPublisherSeriesVolumeRequest(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, true));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(displayableComicService)
        .getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
    verify(selectedIds).addAll(selectedIds);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addSelectionsByPublisherSeriesVolume_deselecting() throws ComicSelectionException {
    when(displayableComicService.getIdsByPublisherSeriesAndVolume(
            anyString(), anyString(), anyString()))
        .thenReturn(selectedIds);

    controller.addComicBookSelectionsByPublisherSeriesVolume(
        httpSession,
        principal,
        new AddComicSelectionsByPublisherSeriesVolumeRequest(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, false));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(displayableComicService)
        .getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
    verify(selectedIds).removeAll(selectedIds);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addUnreadComicBooksSelection_selectingRead()
      throws ComicSelectionException, ComiXedUserException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicsSelectionRequest(true, false));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(userService).getComicIdsForUser(TEST_EMAIL, false);
    verify(selectedIds).addAll(comicIdList);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addUnreadComicBooksSelection_deselectingRead()
      throws ComicSelectionException, ComiXedUserException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicsSelectionRequest(false, false));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(userService).getComicIdsForUser(TEST_EMAIL, false);
    verify(selectedIds).removeAll(comicIdList);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addUnreadComicBooksSelection_selectingUnread()
      throws ComicSelectionException, ComiXedUserException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicsSelectionRequest(true, true));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(userService).getComicIdsForUser(TEST_EMAIL, true);
    verify(selectedIds).addAll(comicIdList);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void addUnreadComicBooksSelection_deselectingUnread()
      throws ComicSelectionException, ComiXedUserException {
    controller.addUnreadComicBooksSelection(
        httpSession, principal, new UnreadComicsSelectionRequest(false, true));

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(userService).getComicIdsForUser(TEST_EMAIL, true);
    verify(selectedIds).removeAll(comicIdList);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void clearSelections() throws ComicSelectionException {
    controller.clearSelections(httpSession, principal);

    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(comicSelectionService).encodeSelections(selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }
}
