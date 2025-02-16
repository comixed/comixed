/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.rest.lists;

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.lists.DeleteReadingListsRequest;
import org.comixedproject.model.net.lists.SaveReadingListRequest;
import org.comixedproject.model.net.lists.UpdateReadingListRequest;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReadingListControllerTest {
  private static final String TEST_READING_LIST_NAME = "Test Reading List";
  private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
  private static final String TEST_USER_EMAIL = "reader@localhost.com";
  private static final long TEST_READING_LIST_ID = 78;
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selected ids";
  private static final String TEST_REENCODED_SELECTIONS = "The re-encoded selected ids";

  @InjectMocks private ReadingListController controller;
  @Mock private ReadingListService readingListService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private ReadingList readingList;
  @Mock private Principal principal;
  @Mock private List<ReadingList> readingLists;
  @Mock private DownloadDocument downloadDocument;
  @Mock private MultipartFile multipartFile;
  @Mock private InputStream inputStream;
  @Mock private List<Long> readingListIdList;
  @Mock private HttpSession session;

  private List selectedIdList = new ArrayList();

  @BeforeEach
  void setUp() throws IOException, ComicBookSelectionException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(multipartFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(multipartFile.getOriginalFilename())
        .thenReturn(String.format("%s.csv", TEST_READING_LIST_NAME));
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicSelectionService.decodeSelections(Mockito.any())).thenReturn(selectedIdList);
    Mockito.when(comicSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_SELECTIONS);
  }

  @Test
  void loadReadingListsForUser() throws ReadingListException {
    Mockito.when(readingListService.loadReadingListsForUser(Mockito.anyString()))
        .thenReturn(readingLists);

    List<ReadingList> result = controller.loadReadingListsForUser(principal);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(readingListService, Mockito.times(1)).loadReadingListsForUser(TEST_USER_EMAIL);
    Mockito.verify(principal, Mockito.atLeast(1)).getName();
  }

  @Test
  void createReadingList() throws ReadingListException {
    Mockito.when(
            readingListService.createReadingList(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(readingList);

    ReadingList result =
        controller.createReadingList(
            principal,
            new SaveReadingListRequest(TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));

    assertNotNull(result);
    assertSame(result, readingList);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(readingListService, Mockito.times(1))
        .createReadingList(TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
  }

  @Test
  void updateReadingList() throws ReadingListException {
    Mockito.when(
            readingListService.updateReadingList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(readingList);

    ReadingList result =
        controller.updateReadingList(
            principal,
            TEST_READING_LIST_ID,
            new UpdateReadingListRequest(TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(principal, Mockito.atLeast(1)).getName();
    Mockito.verify(readingListService, Mockito.times(1))
        .updateReadingList(
            TEST_USER_EMAIL,
            TEST_READING_LIST_ID,
            TEST_READING_LIST_NAME,
            TEST_READING_LIST_SUMMARY);
  }

  @Test
  void loadReadingListForUser() throws ReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(readingList);

    final ReadingList result = controller.loadReadingList(principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(readingListService, Mockito.times(1))
        .loadReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);
  }

  @Test
  void addSelectedComicBooksToReadingList_selectionServiceExceptionOnDecode()
      throws ComicBookSelectionException {
    Mockito.when(comicSelectionService.decodeSelections(Mockito.any()))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        ReadingListException.class,
        () ->
            controller.addSelectedComicBooksToReadingList(
                session, principal, TEST_READING_LIST_ID));
  }

  @Test
  void addSelectedComicBooksToList() throws ReadingListException {
    controller.addSelectedComicBooksToReadingList(session, principal, TEST_READING_LIST_ID);

    Mockito.verify(readingListService, Mockito.times(1))
        .addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, selectedIdList);
  }

  @Test
  void removeComicsFromReadingList_serviceException() throws ReadingListException {
    Mockito.doThrow(ReadingListException.class)
        .when(readingListService)
        .removeComicsFromList(Mockito.anyString(), Mockito.anyLong(), Mockito.anyList());

    assertThrows(
        ReadingListException.class,
        () ->
            controller.removeSelectedComicBooksFromReadingList(
                session, principal, TEST_READING_LIST_ID));
  }

  @Test
  void removeComicsFromList() throws ReadingListException {
    controller.removeSelectedComicBooksFromReadingList(session, principal, TEST_READING_LIST_ID);

    Mockito.verify(readingListService, Mockito.times(1))
        .removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, selectedIdList);
  }

  @Test
  void downloadList_serviceException() throws ReadingListException {
    Mockito.when(readingListService.encodeReadingList(Mockito.anyString(), Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    assertThrows(
        ReadingListException.class,
        () -> controller.downloadReadingList(principal, TEST_READING_LIST_ID));
  }

  @Test
  void downloadList() throws ReadingListException {
    Mockito.when(readingListService.encodeReadingList(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(downloadDocument);

    final DownloadDocument result = controller.downloadReadingList(principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(downloadDocument, result);

    Mockito.verify(readingListService, Mockito.times(1))
        .encodeReadingList(TEST_USER_EMAIL, TEST_READING_LIST_ID);
  }

  @Test
  void uploadListServiceException() throws ReadingListException, IOException {
    Mockito.doThrow(ReadingListException.class)
        .when(readingListService)
        .decodeAndCreateReadingList(
            Mockito.anyString(), Mockito.anyString(), Mockito.any(InputStream.class));

    assertThrows(
        ReadingListException.class, () -> controller.uploadReadingList(principal, multipartFile));
  }

  @Test
  void uploadListService() throws ReadingListException, IOException {
    controller.uploadReadingList(principal, multipartFile);

    Mockito.verify(readingListService, Mockito.times(1))
        .decodeAndCreateReadingList(TEST_USER_EMAIL, TEST_READING_LIST_NAME, inputStream);
  }

  @Test
  void deleteReadingLists_serviceException() throws ReadingListException {
    Mockito.doThrow(ReadingListException.class)
        .when(readingListService)
        .deleteReadingLists(Mockito.anyString(), Mockito.anyList());

    assertThrows(
        ReadingListException.class,
        () ->
            controller.deleteReadingLists(
                principal, new DeleteReadingListsRequest(readingListIdList)));
  }

  @Test
  void deleteReadingLists() throws ReadingListException {
    controller.deleteReadingLists(principal, new DeleteReadingListsRequest(readingListIdList));

    Mockito.verify(readingListService, Mockito.times(1))
        .deleteReadingLists(TEST_USER_EMAIL, readingListIdList);
  }
}
