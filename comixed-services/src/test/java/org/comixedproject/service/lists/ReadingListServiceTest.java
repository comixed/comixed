/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.service.lists;

import static org.comixedproject.service.lists.ReadingListService.*;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.csv.CsvRowDecoder;
import org.comixedproject.adaptors.csv.CsvRowEncoder;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishReadingListDeletedAction;
import org.comixedproject.messaging.lists.PublishReadingListUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.lists.ReadingListRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.state.lists.ReadingListEvent;
import org.comixedproject.state.lists.ReadingListStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ReadingListServiceTest {
  private static final String TEST_READING_LIST_NAME = "Test Reading List";
  private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
  private static final String TEST_USER_EMAIL = "reader@localhost.com";
  private static final long TEST_READING_LIST_ID = 78;
  private static final Long TEST_COMIC_ID = 1000L;
  private static final String TEST_OWNER_EMAIL = "owner@localhost.com";
  private static final ReadingListState TEST_READING_LIST_STATE = ReadingListState.STABLE;
  private static final String TEST_POSITION = "1";
  private static final String TEST_PUBLISHER = "Publisher";
  private static final String TEST_SERIES = "Series";
  private static final String TEST_VOLUME = "Volume";
  private static final String TEST_ISSUE_NUMBER = "Issue#";
  private static final byte[] TEST_ENCODED_READING_LIST =
      "The encoded reading list content".getBytes();

  @InjectMocks private ReadingListService service;
  @Mock private ReadingListStateHandler readingListStateHandler;
  @Mock private ReadingListRepository readingListRepository;
  @Mock private UserService userService;
  @Mock private ComicBookService comicBookService;
  @Mock private CsvAdaptor csvAdaptor;
  @Mock private ReadingList readingList;
  @Mock private ReadingList savedReadingList;
  @Mock private ReadingList loadedReadingList;
  @Mock private ComiXedUser owner;
  @Mock private ComiXedUser user;
  @Mock private List<ReadingList> readingLists;
  @Mock private ComicBook comicBook;
  @Mock private State<ReadingListState, ReadingListEvent> incomingState;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Message<ReadingListEvent> incomingMessage;
  @Mock private PublishReadingListUpdateAction publishReadingListUpdateAction;
  @Mock private PublishReadingListDeletedAction publishReadingListDeletedAction;
  @Mock private InputStream inputStream;

  @Captor private ArgumentCaptor<ReadingList> readingListArgumentCaptor;
  @Captor private ArgumentCaptor<Map<String, Object>> headersArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowEncoder> rowEncoderArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowDecoder> rowDecoderArgumentCaptor;

  private List<Long> idList = new ArrayList<>();
  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingList.getOwner()).thenReturn(owner);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(owner.getEmail()).thenReturn(TEST_OWNER_EMAIL);
    Mockito.when(readingList.getName()).thenReturn(TEST_READING_LIST_NAME);
    Mockito.when(readingList.getComicBooks()).thenReturn(comicBookList);
    Mockito.when(comicBook.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(comicBook.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(comicBook.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(comicBook.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
  }

  @Test(expected = ReadingListException.class)
  public void testLoadReadingListsForUserInvalidEmail()
      throws ComiXedUserException, ReadingListException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.loadReadingListsForUser(TEST_USER_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    }
  }

  @Test
  public void testLoadReadingListsForUser() throws ComiXedUserException, ReadingListException {

    Mockito.when(readingListRepository.getAllReadingListsForOwner(Mockito.any(ComiXedUser.class)))
        .thenReturn(readingLists);

    List<ReadingList> result = service.loadReadingListsForUser(TEST_USER_EMAIL);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1)).getAllReadingListsForOwner(user);
  }

  @Test(expected = ReadingListException.class)
  public void testCreateReadingListInvalidEmail()
      throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.createReadingList(TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testCreateReadingListNameAlreadyUsed()
      throws ReadingListException, ComiXedUserException {

    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(true);

    try {
      service.createReadingList(TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1))
          .checkForExistingReadingList(user, TEST_READING_LIST_NAME);
    }
  }

  @Test
  public void testCreateReadingList() throws ReadingListException, ComiXedUserException {
    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(false);
    Mockito.when(readingListRepository.save(readingListArgumentCaptor.capture()))
        .thenReturn(readingList);
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(savedReadingList);

    ReadingList result =
        service.createReadingList(
            TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(savedReadingList, result);
    assertSame(user, readingListArgumentCaptor.getValue().getOwner());
    assertEquals(TEST_READING_LIST_NAME, readingListArgumentCaptor.getValue().getName());
    assertEquals(TEST_READING_LIST_SUMMARY, readingListArgumentCaptor.getValue().getSummary());
    assertEquals(0, readingListArgumentCaptor.getValue().getComicBooks().size());
    assertNotNull(readingListArgumentCaptor.getValue().getLastModifiedOn());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .checkForExistingReadingList(user, TEST_READING_LIST_NAME);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .save(readingListArgumentCaptor.getValue());
    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }

  @Test
  public void testSave() {
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(loadedReadingList);

    final ReadingList result = service.saveReadingList(readingList);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.updated);
    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }

  @Test(expected = ReadingListException.class)
  public void testUpdateReadingListInvalidId() throws ReadingListException, ComiXedUserException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateReadingList(
          TEST_USER_EMAIL, TEST_READING_LIST_ID, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testUpdateReadingList() throws ReadingListException, ComiXedUserException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);

    ReadingList result =
        service.updateReadingList(
            TEST_OWNER_EMAIL,
            TEST_READING_LIST_ID,
            TEST_READING_LIST_NAME,
            TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingList, Mockito.times(1)).setName(TEST_READING_LIST_NAME);
    Mockito.verify(readingList, Mockito.times(1)).setSummary(TEST_READING_LIST_SUMMARY);
    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.updated);
  }

  @Test(expected = ReadingListException.class)
  public void testLoadReadingListForOtherUser() throws ReadingListException, ComiXedUserException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    try {
      service.loadReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testLoadReadingListForUser() throws ReadingListException, ComiXedUserException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    final ReadingList result =
        service.loadReadingListForUser(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }

  @Test(expected = ReadingListException.class)
  public void testAddComicsToListNoSuchList() throws ReadingListException {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testAddComicsToListNotOwner() throws ReadingListException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    try {
      service.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testAddComicsToListComicNotFound() throws ComicException, ReadingListException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    final ReadingList result =
        service.addComicsToList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testAddComicsToList() throws ComicException, ReadingListException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.doNothing()
        .when(readingListStateHandler)
        .fireEvent(
            Mockito.any(ReadingList.class),
            Mockito.any(ReadingListEvent.class),
            headersArgumentCaptor.capture());

    ReadingList result = service.addComicsToList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    final Map<String, ?> headers = headersArgumentCaptor.getValue();
    assertNotNull(headers);
    assertSame(comicBook, headers.get(HEADER_COMIC));

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.comicAdded, headers);
  }

  @Test(expected = ReadingListException.class)
  public void testRemoveComicsFromListNoSuchList() throws ReadingListException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testRemoveComicsFromListNotOwner() throws ReadingListException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    try {
      service.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testRemoveComicsFromListComicNotFound() throws ComicException, ReadingListException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    final ReadingList result =
        service.removeComicsFromList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(readingListStateHandler, Mockito.never())
        .fireEvent(Mockito.any(), Mockito.any(), Mockito.any());
  }

  @Test
  public void testRemoveComicsFromList() throws ComicException, ReadingListException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.doNothing()
        .when(readingListStateHandler)
        .fireEvent(
            Mockito.any(ReadingList.class),
            Mockito.any(ReadingListEvent.class),
            headersArgumentCaptor.capture());

    ReadingList result =
        service.removeComicsFromList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    final Map<String, Object> headers = headersArgumentCaptor.getValue();
    assertSame(comicBook, headers.get(HEADER_COMIC));

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.comicRemoved, headers);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(readingListStateHandler, Mockito.times(1)).addListener(service);
  }

  @Test
  public void testOnReadingListStateChange() throws PublishingException {
    Mockito.when(incomingMessage.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(readingList);
    Mockito.when(incomingState.getId()).thenReturn(TEST_READING_LIST_STATE);
    Mockito.when(readingListRepository.save(Mockito.any(ReadingList.class)))
        .thenReturn(savedReadingList);

    service.onReadingListStateChange(incomingState, incomingMessage);

    Mockito.verify(readingList, Mockito.times(1)).setReadingListState(TEST_READING_LIST_STATE);
    Mockito.verify(readingList, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
    Mockito.verify(publishReadingListUpdateAction, Mockito.times(1)).publish(savedReadingList);
  }

  @Test
  public void testOnReadingListStateChangePublishingException() throws PublishingException {
    Mockito.when(incomingMessage.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(readingList);
    Mockito.when(incomingState.getId()).thenReturn(TEST_READING_LIST_STATE);
    Mockito.when(readingListRepository.save(Mockito.any(ReadingList.class)))
        .thenReturn(savedReadingList);
    Mockito.doThrow(PublishingException.class)
        .when(publishReadingListUpdateAction)
        .publish(Mockito.any(ReadingList.class));

    service.onReadingListStateChange(incomingState, incomingMessage);

    Mockito.verify(readingList, Mockito.times(1)).setReadingListState(TEST_READING_LIST_STATE);
    Mockito.verify(readingList, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }

  @Test(expected = ReadingListException.class)
  public void testEncodeReadingListNotFound() throws ReadingListException {
    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(null);

    try {
      service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testEncodeReadingListNotOwner() throws ReadingListException {
    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);

    try {
      service.encodeReadingList(TEST_USER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testEncodeReadingListEncodingException() throws IOException, ReadingListException {
    comicBookList.add(comicBook);

    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenThrow(IOException.class);

    try {
      service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
      Mockito.verify(csvAdaptor, Mockito.times(1))
          .encodeRecords(comicBookList, rowEncoderArgumentCaptor.getValue());
    }
  }

  @Test
  public void testEncodeReadingList() throws ReadingListException, IOException {
    comicBookList.add(comicBook);

    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_READING_LIST);

    final DownloadDocument result =
        service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertFalse(StringUtils.isEmpty(result.getFilename()));
    assertEquals("text/csv", result.getMediaType());
    assertSame(TEST_ENCODED_READING_LIST, result.getContent());

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    assertNotNull(encoder);
    String[] row = encoder.createRow(0, comicBook);
    assertArrayEquals(
        new String[] {
          POSITION_HEADER, PUBLISHER_HEADER, SERIES_HEADER, VOLUME_HEADER, ISSUE_NUMBER_HEADER
        },
        row);
    row = encoder.createRow(1, comicBook);
    assertArrayEquals(
        new String[] {"1", TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER}, row);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(csvAdaptor, Mockito.times(1)).encodeRecords(comicBookList, encoder);
  }

  @Test(expected = ReadingListException.class)
  public void testDecodeAndCreateReadingListInvalidEmail()
      throws ComiXedUserException, ReadingListException, IOException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.decodeAndCreateReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_OWNER_EMAIL);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testDecodeAndCreateReadingListNameUsed()
      throws ComiXedUserException, ReadingListException, IOException {

    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(true);

    try {
      service.decodeAndCreateReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_OWNER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1))
          .checkForExistingReadingList(user, TEST_READING_LIST_NAME);
    }
  }

  @Test
  public void testDecodeAndCreateReadingListComicNotFound()
      throws ComiXedUserException, ComicException, ReadingListException, IOException {
    final List<String> decodingRow = new ArrayList<>();
    decodingRow.add(TEST_POSITION);
    decodingRow.add(TEST_PUBLISHER);
    decodingRow.add(TEST_SERIES);
    decodingRow.add(TEST_VOLUME);
    decodingRow.add(TEST_ISSUE_NUMBER);

    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(false);
    Mockito.when(readingListRepository.save(readingListArgumentCaptor.capture()))
        .thenReturn(readingList);
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(savedReadingList);
    Mockito.doNothing()
        .when(csvAdaptor)
        .decodeRecords(
            Mockito.any(InputStream.class), Mockito.any(), rowDecoderArgumentCaptor.capture());
    Mockito.when(
            comicBookService.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    service.decodeAndCreateReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_OWNER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .checkForExistingReadingList(user, TEST_READING_LIST_NAME);

    final CsvRowDecoder decoder = rowDecoderArgumentCaptor.getValue();
    decoder.processRow(1, decodingRow);

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
    Mockito.verify(readingListStateHandler, Mockito.never())
        .fireEvent(Mockito.any(), Mockito.any(), Mockito.any());
    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }

  @Test
  public void testDecodeAndCreateReadingList()
      throws ComiXedUserException, ComicException, ReadingListException, IOException {
    final List<String> decodingRow = new ArrayList<>();
    decodingRow.add(TEST_POSITION);
    decodingRow.add(TEST_PUBLISHER);
    decodingRow.add(TEST_SERIES);
    decodingRow.add(TEST_VOLUME);
    decodingRow.add(TEST_ISSUE_NUMBER);

    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(false);
    Mockito.when(readingListRepository.save(readingListArgumentCaptor.capture()))
        .thenReturn(savedReadingList);
    Mockito.doNothing()
        .when(csvAdaptor)
        .decodeRecords(
            Mockito.any(InputStream.class), Mockito.any(), rowDecoderArgumentCaptor.capture());
    Mockito.when(
            comicBookService.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBook);
    Mockito.when(savedReadingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);
    Mockito.doNothing()
        .when(readingListStateHandler)
        .fireEvent(
            Mockito.any(ReadingList.class),
            Mockito.any(ReadingListEvent.class),
            headersArgumentCaptor.capture());

    service.decodeAndCreateReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_OWNER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .checkForExistingReadingList(user, TEST_READING_LIST_NAME);

    final CsvRowDecoder decoder = rowDecoderArgumentCaptor.getValue();
    decoder.processRow(1, decodingRow);

    final Map<String, Object> headers = headersArgumentCaptor.getValue();
    assertFalse(headers.isEmpty());
    assertSame(comicBook, headers.get(HEADER_COMIC));

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicBookService, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.comicAdded, headers);
  }

  @Test
  public void testDeleteReadingListsInvalidReadingList()
      throws ReadingListException, ComiXedUserException {
    idList.add(TEST_READING_LIST_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListRepository, Mockito.never()).delete(Mockito.any());
  }

  @Test
  public void testDeleteReadingListsNotOwner() throws ReadingListException, ComiXedUserException {
    idList.add(TEST_READING_LIST_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    service.deleteReadingLists(TEST_USER_EMAIL, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListRepository, Mockito.never()).delete(Mockito.any());
  }

  @Test
  public void testDeleteReadingListsPublishException()
      throws ReadingListException, ComiXedUserException, PublishingException {
    idList.add(TEST_READING_LIST_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);
    Mockito.doThrow(PublishingException.class)
        .when(publishReadingListDeletedAction)
        .publish(Mockito.any());

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListRepository, Mockito.times(1)).delete(readingList);
    Mockito.verify(publishReadingListDeletedAction, Mockito.times(1)).publish(readingList);
  }

  @Test
  public void testDeleteReadingLists()
      throws ReadingListException, ComiXedUserException, PublishingException {
    idList.add(TEST_READING_LIST_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListRepository, Mockito.times(1)).delete(readingList);
    Mockito.verify(publishReadingListDeletedAction, Mockito.times(1)).publish(readingList);
  }
}
