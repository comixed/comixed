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
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.csv.CsvRowDecoder;
import org.comixedproject.adaptors.csv.CsvRowEncoder;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishReadingListDeletedAction;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.lists.ReadingListRepository;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReadingListServiceTest {
  private static final String TEST_READING_LIST_NAME = "Test Reading List";
  private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
  private static final String TEST_USER_EMAIL = "reader@localhost.com";
  private static final long TEST_READING_LIST_ID = 78;
  private static final Long TEST_COMIC_ID = 1000L;
  private static final String TEST_OWNER_EMAIL = "owner@localhost.com";
  private static final String TEST_POSITION = "1";
  private static final String TEST_PUBLISHER = "Publisher";
  private static final String TEST_SERIES = "SeriesDetail";
  private static final String TEST_VOLUME = "Volume";
  private static final String TEST_ISSUE_NUMBER = "Issue#";
  private static final byte[] TEST_ENCODED_READING_LIST =
      "The encoded reading list content".getBytes();

  @InjectMocks private ReadingListService service;
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
  @Mock private PublishReadingListDeletedAction publishReadingListDeletedAction;
  @Mock private InputStream inputStream;
  @Mock private List<Long> existingIdList;

  @Captor private ArgumentCaptor<ReadingList> readingListArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowEncoder> rowEncoderArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowDecoder> rowDecoderArgumentCaptor;

  private List<Long> idList = new ArrayList<>();
  private List<Long> entryIdList = new ArrayList<>();
  private List<Comic> comicList = new ArrayList<>();

  @BeforeEach
  void setUp() throws ComiXedUserException {
    when(userService.findByEmail(anyString())).thenReturn(user);
    when(readingList.getOwner()).thenReturn(owner);
    when(readingList.getReadingListId()).thenReturn(TEST_READING_LIST_ID);
    when(owner.getEmail()).thenReturn(TEST_OWNER_EMAIL);
    when(readingList.getName()).thenReturn(TEST_READING_LIST_NAME);
    when(readingList.getEntryIds()).thenReturn(entryIdList);
    when(comic.getComicId()).thenReturn(TEST_COMIC_ID);
    when(comic.getPublisher()).thenReturn(TEST_PUBLISHER);
    when(comic.getSeries()).thenReturn(TEST_SERIES);
    when(comic.getVolume()).thenReturn(TEST_VOLUME);
    when(comic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
  }

  @Test
  void loadReadingListsForUser_invalidEmail() throws ComiXedUserException {
    when(userService.findByEmail(anyString())).thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadingListException.class, () -> service.loadReadingListsForUser(TEST_USER_EMAIL));
  }

  @Test
  void loadReadingListsForUser() throws ComiXedUserException, ReadingListException {

    when(readingListRepository.getAllReadingListsForOwner(any(ComiXedUser.class)))
        .thenReturn(readingLists);

    List<ReadingList> result = service.loadReadingListsForUser(TEST_USER_EMAIL);

    assertNotNull(result);
    assertSame(readingLists, result);

    verify(userService).findByEmail(TEST_USER_EMAIL);
    verify(readingListRepository).getAllReadingListsForOwner(user);
  }

  @Test
  void createReadingList_invalidEmail() throws ComiXedUserException {
    when(userService.findByEmail(anyString())).thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadingListException.class,
        () ->
            service.createReadingList(
                TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));
  }

  @Test
  void createReadingList_nameAlreadyUsed() {

    when(readingListRepository.checkForExistingReadingList(any(ComiXedUser.class), anyString()))
        .thenReturn(true);

    assertThrows(
        ReadingListException.class,
        () ->
            service.createReadingList(
                TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));
  }

  @Test
  void createReadingList() throws ReadingListException, ComiXedUserException {
    when(readingListRepository.checkForExistingReadingList(any(ComiXedUser.class), anyString()))
        .thenReturn(false);
    when(readingListRepository.saveAndFlush(readingListArgumentCaptor.capture()))
        .thenReturn(savedReadingList);

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

    verify(userService).findByEmail(TEST_USER_EMAIL);
    verify(readingListRepository).checkForExistingReadingList(user, TEST_READING_LIST_NAME);
    verify(readingListRepository).saveAndFlush(readingListArgumentCaptor.getValue());
  }

  @Test
  void save() {
    when(readingListRepository.saveAndFlush(any())).thenReturn(savedReadingList);

    final ReadingList result = service.saveReadingList(readingList);

    assertNotNull(result);
    assertSame(savedReadingList, result);

    verify(readingListRepository).saveAndFlush(readingList);
  }

  @Test
  void updateReadingList_invalidId() {
    when(readingListRepository.getById(anyLong())).thenReturn(null);

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
    when(readingListRepository.getById(anyLong())).thenReturn(readingList);
    when(readingListRepository.saveAndFlush(any())).thenReturn(loadedReadingList);

    ReadingList result =
        service.updateReadingList(
            TEST_OWNER_EMAIL,
            TEST_READING_LIST_ID,
            TEST_READING_LIST_NAME,
            TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(loadedReadingList, result);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(readingList).setName(TEST_READING_LIST_NAME);
    verify(readingList).setSummary(TEST_READING_LIST_SUMMARY);
    verify(readingListRepository).saveAndFlush(readingList);
  }

  @Test
  void loadReadingListForOtherUser() {
    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.loadReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void loadReadingListForUser() throws ReadingListException {
    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    final ReadingList result =
        service.loadReadingListForUser(TEST_OWNER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(readingList, result);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
  }

  @Test
  void addComicsToListNoSuchList() {
    List<Long> ids = new ArrayList<>();
    when(readingListRepository.getById(anyLong())).thenReturn(null);

    assertThrows(
        ReadingListException.class,
        () -> service.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids));
  }

  @Test
  void addComicsToList_notOwner() {
    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList));
  }

  @Test
  void addComicsToList() throws ReadingListException {
    idList.add(TEST_COMIC_ID);

    when(readingListRepository.getById(anyLong())).thenReturn(readingList, loadedReadingList);

    service.addComicsToList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(readingListRepository).save(readingList);
  }

  @Test
  void removeComicsFromList_noSuchList() {
    when(readingListRepository.getById(anyLong())).thenReturn(null);

    assertThrows(
        ReadingListException.class,
        () -> service.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList));
  }

  @Test
  void removeComicsFromListNotOwner() {
    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, idList));
  }

  @Test
  void removeComicsFromList() throws ReadingListException {
    when(readingList.getEntryIds()).thenReturn(existingIdList);

    idList.add(TEST_COMIC_ID);

    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    service.removeComicsFromList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID, idList);

    verify(existingIdList).removeAll(idList);
    verify(readingListRepository).save(readingList);
  }

  @Test
  void encodeReadingList_notFound() {
    when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(null);

    assertThrows(
        ReadingListException.class,
        () -> service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void encodeReadingList_notOwner() {
    when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);

    assertThrows(
        ReadingListException.class,
        () -> service.encodeReadingList(TEST_USER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void EncodeReadingList_encodingException() throws IOException {
    entryIdList.add(TEST_COMIC_ID);

    when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    when(csvAdaptor.encodeRecords(anyList(), rowEncoderArgumentCaptor.capture()))
        .thenThrow(IOException.class);

    assertThrows(
        ReadingListException.class,
        () -> service.encodeReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void encodeReadingList_comicNotFound() throws ReadingListException, IOException, ComicException {
    entryIdList.add(TEST_COMIC_ID);

    when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    when(csvAdaptor.encodeRecords(anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_READING_LIST);
    when(comicService.getComic(anyLong())).thenThrow(ComicException.class);

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

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(csvAdaptor).encodeRecords(entryIdList, encoder);
    verify(comicService).getComic(TEST_COMIC_ID);
  }

  @Test
  void encodeReadingList() throws ReadingListException, IOException, ComicException {
    entryIdList.add(TEST_COMIC_ID);

    when(readingListRepository.getById(TEST_READING_LIST_ID)).thenReturn(readingList);
    when(csvAdaptor.encodeRecords(anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_READING_LIST);
    when(comicService.getComic(anyLong())).thenReturn(comic);

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

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(csvAdaptor).encodeRecords(entryIdList, encoder);
    verify(comicService).getComic(TEST_COMIC_ID);
  }

  @Test
  void decodeAndCreateReadingListInvalidEmail() throws ComiXedUserException {
    when(userService.findByEmail(anyString())).thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadingListException.class,
        () ->
            service.decodeAndCreateReadingList(
                TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream));
  }

  @Test
  void decodeAndCreateReadingListNameUsed() {

    when(readingListRepository.checkForExistingReadingList(any(ComiXedUser.class), anyString()))
        .thenReturn(true);

    assertThrows(
        ReadingListException.class,
        () ->
            service.decodeAndCreateReadingList(
                TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream));
  }

  @Test
  void decodeAndCreateReadingList() throws ComiXedUserException, ReadingListException, IOException {
    final List<String> decodingRow = new ArrayList<>();
    decodingRow.add(TEST_POSITION);
    decodingRow.add(TEST_PUBLISHER);
    decodingRow.add(TEST_SERIES);
    decodingRow.add(TEST_VOLUME);
    decodingRow.add(TEST_ISSUE_NUMBER);

    comicList.add(comic);

    final List<Long> entries = new ArrayList<>();
    when(savedReadingList.getEntryIds()).thenReturn(entries);
    when(readingListRepository.checkForExistingReadingList(any(ComiXedUser.class), anyString()))
        .thenReturn(false);
    doNothing()
        .when(csvAdaptor)
        .decodeRecords(any(InputStream.class), any(), rowDecoderArgumentCaptor.capture());
    when(comicService.getForPublisherAndSeriesAndVolumeAndIssueNumber(
            anyString(), anyString(), anyString(), anyString()))
        .thenReturn(comicList);
    when(savedReadingList.getReadingListId()).thenReturn(TEST_READING_LIST_ID);
    when(readingListRepository.saveAndFlush(readingListArgumentCaptor.capture()))
        .thenReturn(savedReadingList);

    service.decodeAndCreateReadingList(TEST_OWNER_EMAIL, TEST_READING_LIST_NAME, inputStream);

    verify(userService).findByEmail(TEST_OWNER_EMAIL);
    verify(readingListRepository).checkForExistingReadingList(user, TEST_READING_LIST_NAME);

    final CsvRowDecoder decoder = rowDecoderArgumentCaptor.getValue();
    decoder.processRow(1, decodingRow);

    assertFalse(entries.isEmpty());

    final ReadingList createdReadingList = readingListArgumentCaptor.getValue();
    assertNotNull(createdReadingList);
    assertEquals(TEST_READING_LIST_NAME, createdReadingList.getName());
    assertSame(user, createdReadingList.getOwner());

    verify(comicService)
        .getForPublisherAndSeriesAndVolumeAndIssueNumber(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
    verify(readingListRepository).saveAndFlush(createdReadingList);
  }

  @Test
  void deleteReadingLists_invalidReadingList() throws ReadingListException {
    idList.add(TEST_READING_LIST_ID);

    when(readingListRepository.getById(anyLong())).thenReturn(null);

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(readingListRepository, never()).delete(any());
  }

  @Test
  void deleteReadingLists_notOwner() throws ReadingListException {
    idList.add(TEST_READING_LIST_ID);

    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    service.deleteReadingLists(TEST_USER_EMAIL, idList);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(readingListRepository, never()).delete(any());
  }

  @Test
  void deleteReadingLists_publishException() throws ReadingListException, PublishingException {
    idList.add(TEST_READING_LIST_ID);

    when(readingListRepository.getById(anyLong())).thenReturn(readingList);
    doThrow(PublishingException.class).when(publishReadingListDeletedAction).publish(any());

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(readingListRepository).delete(readingList);
    verify(publishReadingListDeletedAction).publish(readingList);
  }

  @Test
  void deleteReadingLists() throws ReadingListException, PublishingException {
    idList.add(TEST_READING_LIST_ID);

    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    service.deleteReadingLists(TEST_OWNER_EMAIL, idList);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
    verify(readingListRepository).delete(readingList);
    verify(publishReadingListDeletedAction).publish(readingList);
  }

  @Test
  void deleteReadingListEntriesForComicBook() {
    final List<Long> entries = new ArrayList<>();
    final List<ReadingList> readingListEntries = new ArrayList<>();
    when(readingList.getEntryIds()).thenReturn(entries);
    readingListEntries.add(readingList);

    when(readingListRepository.getReadingListsWithComic(anyLong())).thenReturn(readingListEntries);

    service.deleteEntriesForComicBook(comic);

    assertTrue(entries.isEmpty());

    verify(readingListRepository).getReadingListsWithComic(TEST_COMIC_ID);
    verify(readingList).getEntryIds();
    verify(readingListRepository).save(readingList);
  }

  @Test
  void loadEntryCount() throws ReadingListException {
    when(readingListRepository.getById(anyLong())).thenReturn(readingList);

    final List<Long> entryList = new ArrayList<>();
    for (long index = 0L; index < 25L; index++) entryList.add(index);
    when(readingList.getEntryIds()).thenReturn(entryList);

    final long result = service.getEntryCount(TEST_READING_LIST_ID);

    assertEquals(entryList.size(), result);

    verify(readingListRepository).getById(TEST_READING_LIST_ID);
  }
}
