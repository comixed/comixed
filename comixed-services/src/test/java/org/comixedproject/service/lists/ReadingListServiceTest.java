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
import java.util.*;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.csv.CsvRowDecoder;
import org.comixedproject.adaptors.csv.CsvRowEncoder;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishReadingListDeletedAction;
import org.comixedproject.messaging.lists.PublishReadingListUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.lists.ReadingListRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.state.lists.ReadingListEvent;
import org.comixedproject.state.lists.ReadingListStateHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReadingListServiceTest {
  private static final String TEST_READING_LIST_NAME = "Test Reading List";
  private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
  private static final String TEST_USER_EMAIL = "reader@localhost.com";
  private static final long TEST_READING_LIST_ID = 78;
  private static final Long TEST_COMIC_ID = 1000L;
  private static final String TEST_OWNER_EMAIL = "owner@localhost.com";
  private static final ReadingListState TEST_READING_LIST_STATE = ReadingListState.STABLE;
  private static final String TEST_POSITION = "1";
  private static final String TEST_PUBLISHER = "Publisher";
  private static final String TEST_SERIES = "SeriesDetail";
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
  @Mock private ComicDetail comicDetail;
  @Mock private State<ReadingListState, ReadingListEvent> incomingState;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Message<ReadingListEvent> incomingMessage;
  @Mock private PublishReadingListUpdateAction publishReadingListUpdateAction;
  @Mock private PublishReadingListDeletedAction publishReadingListDeletedAction;
  @Mock private InputStream inputStream;
  @Mock private List<Long> existingIdList;

  @Captor private ArgumentCaptor<ReadingList> readingListArgumentCaptor;
  @Captor private ArgumentCaptor<Map<String, Object>> headersArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowEncoder> rowEncoderArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowDecoder> rowDecoderArgumentCaptor;

  private List<Long> idList = new ArrayList<>();
  private List<Long> entryIdList = new ArrayList<>();
  private List<ComicBook> comicBookList = new ArrayList<>();

  @BeforeEach
  public void setUp() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingList.getOwner()).thenReturn(owner);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(owner.getEmail()).thenReturn(TEST_OWNER_EMAIL);
    Mockito.when(readingList.getName()).thenReturn(TEST_READING_LIST_NAME);
    Mockito.when(readingList.getEntryIds()).thenReturn(entryIdList);
    Mockito.when(comicDetail.getId()).thenReturn(TEST_COMIC_ID);
    Mockito.when(comicDetail.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(comicDetail.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(comicDetail.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(comicDetail.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
  }

  @Test
  void loadReadingListsForUser_invalidEmail() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadingListException.class, () -> service.loadReadingListsForUser(TEST_USER_EMAIL));
  }

  @Test
  void loadReadingListsForUser() throws ComiXedUserException, ReadingListException {

    Mockito.when(readingListRepository.getAllReadingListsForOwner(Mockito.any(ComiXedUser.class)))
        .thenReturn(readingLists);

    List<ReadingList> result = service.loadReadingListsForUser(TEST_USER_EMAIL);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1)).getAllReadingListsForOwner(user);
  }

  @Test
  void createReadingList_invalidEmail() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadingListException.class,
        () ->
            service.createReadingList(
                TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));
  }

  @Test
  void createReadingList_nameAlreadyUsed() {

    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(true);

    assertThrows(
        ReadingListException.class,
        () ->
            service.createReadingList(
                TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));
  }

  @Test
  void createReadingList() throws ReadingListException, ComiXedUserException {
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
    assertEquals(0, readingListArgumentCaptor.getValue().getEntryIds().size());
    assertNotNull(readingListArgumentCaptor.getValue().getLastModifiedOn());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .checkForExistingReadingList(user, TEST_READING_LIST_NAME);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .save(readingListArgumentCaptor.getValue());
    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }

  @Test
  void save() {
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(loadedReadingList);

    final ReadingList result = service.saveReadingList(readingList);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.updated);
    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }

  @Test
  void updateReadingList_invalidId() {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(
        ReadingListException.class,
        () ->
            service.updateReadingList(
                TEST_USER_EMAIL,
                TEST_READING_LIST_ID,
                TEST_READING_LIST_NAME,
                TEST_READING_LIST_SUMMARY));
  }

  @Test
  void updateReadingList() throws ReadingListException {
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

  @Test
  void loadReadingListForOtherUser() {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.loadReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void loadReadingListForUser() throws ReadingListException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    final ReadingList result =
        service.loadReadingListForUser(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }

  @Test
  void addComicsToListNoSuchList() {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(
        ReadingListException.class,
        () -> service.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids));
  }

  @Test
  void addComicsToList_notOwner() {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList));
  }

  @Test
  void addComicsToList() throws ReadingListException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);

    service.addComicsToList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.updated);
  }

  @Test
  void removeComicsFromList_noSuchList() {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(
        ReadingListException.class,
        () -> service.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList));
  }

  @Test
  void removeComicsFromListNotOwner() {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList));
  }

  @Test
  void removeComicsFromList() throws ReadingListException {
    Mockito.when(readingList.getEntryIds()).thenReturn(existingIdList);

    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    service.removeComicsFromList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    Mockito.verify(existingIdList, Mockito.times(1)).removeAll(idList);
    Mockito.verify(readingListStateHandler, Mockito.times(1))
        .fireEvent(readingList, ReadingListEvent.updated);
  }

  @Test
  void afterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(readingListStateHandler, Mockito.times(1)).addListener(service);
  }

  @Test
  void onReadingListStateChange() throws PublishingException {
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
  void onReadingListStateChange_publishingException() throws PublishingException {
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

  @Test
  void encodeReadingList_notFound() {
    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(null);

    assertThrows(
        ReadingListException.class,
        () -> service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void encodeReadingList_notOwner() {
    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.encodeReadingList(TEST_USER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void EncodeReadingList_encodingException() throws IOException {
    entryIdList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenThrow(IOException.class);

    assertThrows(
        ReadingListException.class,
        () -> service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void encodeReadingList_comicNotFound()
      throws ReadingListException, IOException, ComicBookException {
    entryIdList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_READING_LIST);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    final DownloadDocument result =
        service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertFalse(StringUtils.isEmpty(result.getFilename()));
    assertEquals("text/csv", result.getMediaType());
    assertSame(TEST_ENCODED_READING_LIST, result.getContent());

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    assertNotNull(encoder);
    String[] row = encoder.createRow(0, TEST_COMIC_ID);
    assertArrayEquals(
        new String[] {
          POSITION_HEADER, PUBLISHER_HEADER, SERIES_HEADER, VOLUME_HEADER, ISSUE_NUMBER_HEADER
        },
        row);
    row = encoder.createRow(1, TEST_COMIC_ID);
    assertArrayEquals(
        new String[] {
          "1",
          ENCODING_ERROR_PUBLISHER,
          ENCODING_ERROR_SERIES,
          ENCODING_ERROR_VOLUME,
          ENCODING_ERROR_ISSUE_NUMBER
        },
        row);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(csvAdaptor, Mockito.times(1)).encodeRecords(entryIdList, encoder);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  void encodeReadingList() throws ReadingListException, IOException, ComicBookException {
    entryIdList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_READING_LIST);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    final DownloadDocument result =
        service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertFalse(StringUtils.isEmpty(result.getFilename()));
    assertEquals("text/csv", result.getMediaType());
    assertSame(TEST_ENCODED_READING_LIST, result.getContent());

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    assertNotNull(encoder);
    String[] row = encoder.createRow(0, TEST_COMIC_ID);
    assertArrayEquals(
        new String[] {
          POSITION_HEADER, PUBLISHER_HEADER, SERIES_HEADER, VOLUME_HEADER, ISSUE_NUMBER_HEADER
        },
        row);
    row = encoder.createRow(1, TEST_COMIC_ID);
    assertArrayEquals(
        new String[] {"1", TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER}, row);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(csvAdaptor, Mockito.times(1)).encodeRecords(entryIdList, encoder);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  void decodeAndCreateReadingListInvalidEmail() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadingListException.class,
        () ->
            service.decodeAndCreateReadingList(
                TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream));
  }

  @Test
  void decodeAndCreateReadingListNameUsed() {

    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(true);

    assertThrows(
        ReadingListException.class,
        () ->
            service.decodeAndCreateReadingList(
                TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream));
  }

  @Test
  void decodeAndCreateReadingListComicNotFound()
      throws ComiXedUserException, ReadingListException, IOException {
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
        .thenReturn(Collections.emptyList());

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
  void decodeAndCreateReadingList() throws ComiXedUserException, ReadingListException, IOException {
    final List<String> decodingRow = new ArrayList<>();
    decodingRow.add(TEST_POSITION);
    decodingRow.add(TEST_PUBLISHER);
    decodingRow.add(TEST_SERIES);
    decodingRow.add(TEST_VOLUME);
    decodingRow.add(TEST_ISSUE_NUMBER);

    comicBookList.add(comicBook);

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
        .thenReturn(comicBookList);
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
  void deleteReadingLists_invalidReadingList() throws ReadingListException {
    idList.add(TEST_READING_LIST_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListRepository, Mockito.never()).delete(Mockito.any());
  }

  @Test
  void deleteReadingLists_notOwner() throws ReadingListException {
    idList.add(TEST_READING_LIST_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    service.deleteReadingLists(TEST_USER_EMAIL, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListRepository, Mockito.never()).delete(Mockito.any());
  }

  @Test
  void deleteReadingLists_publishException() throws ReadingListException, PublishingException {
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
  void deleteReadingLists() throws ReadingListException, PublishingException {
    idList.add(TEST_READING_LIST_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(readingListRepository, Mockito.times(1)).delete(readingList);
    Mockito.verify(publishReadingListDeletedAction, Mockito.times(1)).publish(readingList);
  }

  @Test
  void deleteReadingListEntriesForComicBook() {
    final List<Long> entries = new ArrayList<>();
    final List<ReadingList> readingListEntries = new ArrayList<>();
    Mockito.when(readingList.getEntryIds()).thenReturn(entries);
    readingListEntries.add(readingList);

    Mockito.when(readingListRepository.getReadingListsWithComic(Mockito.anyLong()))
        .thenReturn(readingListEntries);

    service.deleteEntriesForComicBook(comicBook);

    assertTrue(entries.isEmpty());

    Mockito.verify(readingListRepository, Mockito.times(1)).getReadingListsWithComic(TEST_COMIC_ID);
    Mockito.verify(readingList, Mockito.times(1)).getEntryIds();
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }

  @Test
  void loadEntryCount() throws ReadingListException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    final List<Long> entryList = new ArrayList<>();
    for (long index = 0L; index < 25L; index++) entryList.add(index);
    Mockito.when(readingList.getEntryIds()).thenReturn(entryList);

    final long result = service.getEntryCount(TEST_READING_LIST_ID);

    assertEquals(entryList.size(), result);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
  }
}
