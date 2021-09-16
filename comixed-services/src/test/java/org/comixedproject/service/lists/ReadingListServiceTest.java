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

package org.comixedproject.service.lists;

import static org.comixedproject.service.lists.ReadingListService.*;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.junit.Assert.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.csv.CsvRowEncoder;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishReadingListUpdateAction;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.lists.ReadingListRepository;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
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
  @Mock private ComicService comicService;
  @Mock private CsvAdaptor csvAdaptor;
  @Mock private ReadingList readingList;
  @Mock private ReadingList savedReadingList;
  @Mock private ReadingList loadedReadingList;
  @Mock private ComiXedUser owner;
  @Mock private ComiXedUser user;
  @Mock private List<ReadingList> readingLists;
  @Mock private Comic comic;
  @Mock private State<ReadingListState, ReadingListEvent> incomingState;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Message<ReadingListEvent> incomingMessage;
  @Mock private PublishReadingListUpdateAction publishReadingListUpdateAction;

  @Captor private ArgumentCaptor<ReadingList> readingListArgumentCaptor;
  @Captor private ArgumentCaptor<Map<String, Object>> headersArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowEncoder> rowEncoderArgumentCaptor;

  private List<Long> idList = new ArrayList<>();
  private List<Comic> comicList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(readingList.getOwner()).thenReturn(owner);
    Mockito.when(owner.getEmail()).thenReturn(TEST_OWNER_EMAIL);
    Mockito.when(readingList.getName()).thenReturn(TEST_READING_LIST_NAME);
    Mockito.when(readingList.getComics()).thenReturn(comicList);
    Mockito.when(comic.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(comic.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(comic.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(comic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
  }

  @Test(expected = ReadingListException.class)
  public void testGetReadingListsForUserInvalidEmail()
      throws ComiXedUserException, ReadingListException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.getReadingListsForUser(TEST_USER_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    }
  }

  @Test
  public void testGetReadingListsForUser() throws ComiXedUserException, ReadingListException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.getAllReadingListsForOwner(Mockito.any(ComiXedUser.class)))
        .thenReturn(readingLists);

    List<ReadingList> result = service.getReadingListsForUser(TEST_USER_EMAIL);

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
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
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
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.checkForExistingReadingList(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(false);
    Mockito.when(readingListRepository.save(readingListArgumentCaptor.capture()))
        .thenReturn(savedReadingList);

    ReadingList result =
        service.createReadingList(
            TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(savedReadingList, result);
    assertSame(user, readingListArgumentCaptor.getValue().getOwner());
    assertEquals(TEST_READING_LIST_NAME, readingListArgumentCaptor.getValue().getName());
    assertEquals(TEST_READING_LIST_SUMMARY, readingListArgumentCaptor.getValue().getSummary());
    assertEquals(0, readingListArgumentCaptor.getValue().getComics().size());
    assertNotNull(readingListArgumentCaptor.getValue().getLastModifiedOn());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .checkForExistingReadingList(user, TEST_READING_LIST_NAME);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .save(readingListArgumentCaptor.getValue());
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
  public void testGetReadingListForOtherUser() throws ReadingListException, ComiXedUserException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    try {
      service.getReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testGetReadingListForUser() throws ReadingListException, ComiXedUserException {
    Mockito.when(readingListRepository.getById(Mockito.anyLong())).thenReturn(readingList);

    final ReadingList result =
        service.getReadingListForUser(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);

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
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    final ReadingList result =
        service.addComicsToList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testAddComicsToList() throws ComicException, ReadingListException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.doNothing()
        .when(readingListStateHandler)
        .fireEvent(
            Mockito.any(ReadingList.class),
            Mockito.any(ReadingListEvent.class),
            headersArgumentCaptor.capture());

    ReadingList result = service.addComicsToList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    final Map<String, ?> headers = headersArgumentCaptor.getValue();
    assertNotNull(headers);
    assertSame(comic, headers.get(HEADER_COMIC));

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
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
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    final ReadingList result =
        service.removeComicsFromList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(readingListStateHandler, Mockito.never())
        .fireEvent(Mockito.any(), Mockito.any(), Mockito.any());
  }

  @Test
  public void testRemoveComicsFromList() throws ComicException, ReadingListException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(readingListRepository.getById(Mockito.anyLong()))
        .thenReturn(readingList, loadedReadingList);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
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
    assertSame(comic, headers.get(HEADER_COMIC));

    Mockito.verify(readingListRepository, Mockito.times(2)).getById(TEST_READING_LIST_ID);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
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
    comicList.add(comic);

    Mockito.when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenThrow(IOException.class);

    try {
      service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
      Mockito.verify(csvAdaptor, Mockito.times(1))
          .encodeRecords(comicList, rowEncoderArgumentCaptor.getValue());
    }
  }

  @Test
  public void testEncodeReadingList() throws ReadingListException, IOException {
    comicList.add(comic);

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
    String[] row = encoder.createRow(0, comic);
    assertArrayEquals(
        new String[] {
          POSITION_HEADER, PUBLISHER_HEADER, SERIES_HEADER, VOLUME_HEADER, ISSUE_NUMBER_HEADER
        },
        row);
    row = encoder.createRow(1, comic);
    assertArrayEquals(
        new String[] {"1", TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER}, row);

    Mockito.verify(readingListRepository, Mockito.times(1)).getById(TEST_READING_LIST_ID);
    Mockito.verify(csvAdaptor, Mockito.times(1)).encodeRecords(comicList, encoder);
  }
}
