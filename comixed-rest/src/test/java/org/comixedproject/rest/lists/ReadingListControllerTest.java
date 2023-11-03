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

import static junit.framework.TestCase.assertEquals;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.lists.DeleteReadingListsRequest;
import org.comixedproject.model.net.lists.SaveReadingListRequest;
import org.comixedproject.model.net.lists.UpdateReadingListRequest;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.multipart.MultipartFile;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ReadingListControllerTest {
  private static final String TEST_READING_LIST_NAME = "Test Reading List";
  private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
  private static final String TEST_USER_EMAIL = "reader@localhost.com";
  private static final long TEST_READING_LIST_ID = 78;
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selected ids";
  private static final String TEST_REENCODED_SELECTIONS = "The re-encoded selected ids";

  @InjectMocks private ReadingListController controller;
  @Mock private ReadingListService readingListService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private ReadingList readingList;
  @Mock private Principal principal;
  @Mock private List<ReadingList> readingLists;
  @Mock private DownloadDocument downloadDocument;
  @Mock private MultipartFile multipartFile;
  @Mock private InputStream inputStream;
  @Mock private List<Long> readingListIdList;
  @Mock private HttpSession session;
  @Mock private List selectedIdList;

  @Before
  public void setUp() throws IOException, ComicBookSelectionException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(multipartFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(multipartFile.getOriginalFilename())
        .thenReturn(String.format("%s.csv", TEST_READING_LIST_NAME));
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicBookSelectionService.decodeSelections(Mockito.any()))
        .thenReturn(selectedIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testLoadReadingListsForUser() throws ReadingListException {
    Mockito.when(readingListService.loadReadingListsForUser(Mockito.anyString()))
        .thenReturn(readingLists);

    List<ReadingList> result = controller.loadReadingListsForUser(principal);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(readingListService, Mockito.times(1)).loadReadingListsForUser(TEST_USER_EMAIL);
    Mockito.verify(principal, Mockito.atLeast(1)).getName();
  }

  @Test
  public void testCreateReadingList() throws ReadingListException {
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
  public void testUpdateReadingList() throws ReadingListException, ComicBookException {
    Set<ComicBook> entries = new HashSet<>();

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
  public void testLoadReadingListForUser() throws ReadingListException {
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

  @Test(expected = ReadingListException.class)
  public void testAddSelectedComicBooksToReadingListSelectionServiceExceptionOnDecode()
      throws ReadingListException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(Mockito.any()))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.addSelectedComicBooksToReadingList(session, principal, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(comicBookSelectionService, Mockito.times(1))
          .decodeSelections(TEST_ENCODED_SELECTIONS);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testAddSelectedComicBooksToReadingListServiceException() throws ReadingListException {
    Mockito.when(
            readingListService.addComicsToList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyList()))
        .thenThrow(ReadingListException.class);

    try {
      controller.addSelectedComicBooksToReadingList(session, principal, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1))
          .addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, selectedIdList);
    }
  }

  @Test
  public void testAddSelectedComicBooksToList() throws ReadingListException {
    Mockito.when(
            readingListService.addComicsToList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyList()))
        .thenReturn(readingList);

    final ReadingList result =
        controller.addSelectedComicBooksToReadingList(session, principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertEquals(readingList, result);

    Mockito.verify(readingListService, Mockito.times(1))
        .addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, selectedIdList);
  }

  @Test(expected = ReadingListException.class)
  public void testAddSelectedComicBooksToReadingListSelectionServiceExceptionOnEncode()
      throws ReadingListException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.addSelectedComicBooksToReadingList(session, principal, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectedIdList);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testRemoveComicsFromReadingListServiceException() throws ReadingListException {
    Mockito.when(
            readingListService.removeComicsFromList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyList()))
        .thenThrow(ReadingListException.class);

    try {
      controller.removeSelectedComicBooksFromReadingList(session, principal, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1))
          .removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, selectedIdList);
    }
  }

  @Test
  public void testRemoveComicsFromList() throws ReadingListException {
    Mockito.when(
            readingListService.removeComicsFromList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyList()))
        .thenReturn(readingList);

    final ReadingList result =
        controller.removeSelectedComicBooksFromReadingList(
            session, principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertEquals(readingList, result);

    Mockito.verify(readingListService, Mockito.times(1))
        .removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, selectedIdList);
  }

  @Test(expected = ReadingListException.class)
  public void testDownloadListServiceException() throws ReadingListException {
    Mockito.when(readingListService.encodeReadingList(Mockito.anyString(), Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    try {
      controller.downloadReadingList(principal, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1))
          .encodeReadingList(TEST_USER_EMAIL, TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testDownloadList() throws ReadingListException {
    Mockito.when(readingListService.encodeReadingList(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(downloadDocument);

    final DownloadDocument result = controller.downloadReadingList(principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(downloadDocument, result);

    Mockito.verify(readingListService, Mockito.times(1))
        .encodeReadingList(TEST_USER_EMAIL, TEST_READING_LIST_ID);
  }

  @Test(expected = ReadingListException.class)
  public void testUploadListServiceException() throws ReadingListException, IOException {
    Mockito.doThrow(ReadingListException.class)
        .when(readingListService)
        .decodeAndCreateReadingList(
            Mockito.anyString(), Mockito.anyString(), Mockito.any(InputStream.class));

    try {
      controller.uploadReadingList(principal, multipartFile);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1))
          .decodeAndCreateReadingList(TEST_USER_EMAIL, TEST_READING_LIST_NAME, inputStream);
    }
  }

  @Test
  public void testUploadListService() throws ReadingListException, IOException {
    controller.uploadReadingList(principal, multipartFile);

    Mockito.verify(readingListService, Mockito.times(1))
        .decodeAndCreateReadingList(TEST_USER_EMAIL, TEST_READING_LIST_NAME, inputStream);
  }

  @Test(expected = ReadingListException.class)
  public void testDeleteReadingListsServiceException() throws ReadingListException {
    Mockito.doThrow(ReadingListException.class)
        .when(readingListService)
        .deleteReadingLists(Mockito.anyString(), Mockito.anyList());

    try {
      controller.deleteReadingLists(principal, new DeleteReadingListsRequest(readingListIdList));
    } finally {
      Mockito.verify(readingListService, Mockito.times(1))
          .deleteReadingLists(TEST_USER_EMAIL, readingListIdList);
    }
  }

  @Test
  public void testDeleteReadingLists() throws ReadingListException {
    controller.deleteReadingLists(principal, new DeleteReadingListsRequest(readingListIdList));

    Mockito.verify(readingListService, Mockito.times(1))
        .deleteReadingLists(TEST_USER_EMAIL, readingListIdList);
  }
}
