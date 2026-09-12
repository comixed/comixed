/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.reader.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
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
class DirectoryReaderServiceTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_ROOT_URL = "URL Root";
  private static final String TEST_STRING_ENTRY = "Test String Entry";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_VOLUME = "2025";
  private static final Long TEST_READING_LIST_ID = 320L;
  private static final Long TEST_COMIC_ID = 921L;
  private static final String TEST_FILENAME = "The Filename";
  private static final String TEST_BASE_FILENAME = "The Base Filename";
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final File TEST_COMIC_FILE = new File(TEST_COMIC_FILENAME);
  private static final String TEST_COVER_DATE = "2026-01-17";

  @InjectMocks private DirectoryReaderService service;
  @Mock private ComicService comicService;
  @Mock private ReadingListService readingListService;
  @Mock private Comic comic;

  private Set<String> stringSet = new HashSet<>();
  private List<Comic> comicList = new ArrayList<>();
  private List<ReadingList> readingLists = new ArrayList<>();

  @BeforeEach
  void setUp() {
    stringSet.add(TEST_STRING_ENTRY);
    when(comic.getComicDetailId()).thenReturn(TEST_COMIC_ID);
    when(comic.getPublisher()).thenReturn(TEST_PUBLISHER);
    when(comic.getSeries()).thenReturn(TEST_SERIES);
    when(comic.getVolume()).thenReturn(TEST_VOLUME);
    when(comic.getFilename()).thenReturn(TEST_FILENAME);
    when(comic.getFile()).thenReturn(TEST_COMIC_FILE);
    when(comic.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    comicList.add(comic);
  }

  @Test
  void getAllCoverDates() {
    when(comicService.getAllCoverDates(anyString(), anyBoolean())).thenReturn(stringSet);

    final List<DirectoryEntry> result = service.getAllCoverDates(TEST_EMAIL, false, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllCoverDates(TEST_EMAIL, false);
  }

  @Test
  void getAllCoverDates_unread() {
    when(comicService.getAllCoverDates(anyString(), anyBoolean())).thenReturn(stringSet);

    final List<DirectoryEntry> result = service.getAllCoverDates(TEST_EMAIL, true, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllCoverDates(TEST_EMAIL, true);
  }

  @Test
  void getAllComicsForCoverDate() {
    when(comicService.getAllComicsForCoverDate(anyString(), anyString(), anyBoolean()))
        .thenReturn(comicList);

    final List<DirectoryEntry> result =
        service.getAllComicsForCoverDate(TEST_EMAIL, false, TEST_COVER_DATE, TEST_ROOT_URL);

    assertNotNull(result);

    verify(comicService).getAllComicsForCoverDate(TEST_COVER_DATE, TEST_EMAIL, false);
  }

  @Test
  void getAllPublishers() {
    when(comicService.getAllPublishers(anyString(), anyBoolean())).thenReturn(stringSet);

    final List<DirectoryEntry> result = service.getAllPublishers(TEST_EMAIL, false, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllPublishers(TEST_EMAIL, false);
  }

  @Test
  void getAllPublishers_unread() {
    when(comicService.getAllPublishers(anyString(), anyBoolean())).thenReturn(stringSet);

    final List<DirectoryEntry> result = service.getAllPublishers(TEST_EMAIL, true, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllPublishers(TEST_EMAIL, true);
  }

  @Test
  void getAllSeries() {
    when(comicService.getAllSeries(anyString(), anyBoolean())).thenReturn(stringSet);

    final List<DirectoryEntry> result = service.getAllSeries(TEST_EMAIL, false, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllSeries(TEST_EMAIL, false);
  }

  @Test
  void getAllSeries_unread() {
    when(comicService.getAllSeries(anyString(), anyBoolean())).thenReturn(stringSet);

    final List<DirectoryEntry> result = service.getAllSeries(TEST_EMAIL, true, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllSeries(TEST_EMAIL, true);
  }

  @Test
  void getAllPublishersForSeries() {
    when(comicService.getAllPublishersForSeries(anyString(), anyString(), anyBoolean()))
        .thenReturn(stringSet);

    final List<DirectoryEntry> result =
        service.getAllPublishersForSeries(TEST_EMAIL, false, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, false);
  }

  @Test
  void getAllPublishersForSeries_unread() {
    when(comicService.getAllPublishersForSeries(anyString(), anyString(), anyBoolean()))
        .thenReturn(stringSet);

    final List<DirectoryEntry> result =
        service.getAllPublishersForSeries(TEST_EMAIL, true, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, true);
  }

  @Test
  void getAllSeriesForPublisher() {
    when(comicService.getAllSeriesForPublisher(anyString(), anyString(), anyBoolean()))
        .thenReturn(stringSet);

    final List<DirectoryEntry> result =
        service.getAllSeriesForPublisher(TEST_EMAIL, false, TEST_PUBLISHER, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, false);
  }

  @Test
  void getAllSeriesForPublisher_unread() {
    when(comicService.getAllSeriesForPublisher(anyString(), anyString(), anyBoolean()))
        .thenReturn(stringSet);

    final List<DirectoryEntry> result =
        service.getAllSeriesForPublisher(TEST_EMAIL, true, TEST_PUBLISHER, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService).getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, true);
  }

  @Test
  void getAllVolumesForPublisherAndSeries() {
    when(comicService.getAllVolumesForPublisherAndSeries(
            anyString(), anyString(), anyString(), anyBoolean()))
        .thenReturn(stringSet);

    final List<DirectoryEntry> result =
        service.getAllVolumesForPublisherAndSeries(
            TEST_EMAIL, false, TEST_PUBLISHER, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService)
        .getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, false);
  }

  @Test
  void getAllVolumesForPublisherAndSeries_unread() {
    when(comicService.getAllVolumesForPublisherAndSeries(
            anyString(), anyString(), anyString(), anyBoolean()))
        .thenReturn(stringSet);

    final List<DirectoryEntry> result =
        service.getAllVolumesForPublisherAndSeries(
            TEST_EMAIL, true, TEST_PUBLISHER, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringSet.size(), result.size());

    verify(comicService)
        .getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, true);
  }

  @Test
  void getAllComicsForPublisherAndSeriesAndVolume() {
    when(comicService.getAllComicBooksForPublisherAndSeriesAndVolume(
            anyString(), anyString(), anyString(), anyString(), anyBoolean()))
        .thenReturn(comicList);

    final List<DirectoryEntry> result =
        service.getAllComicsForPublisherAndSeriesAndVolume(
            TEST_EMAIL, false, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ROOT_URL);

    assertNotNull(result);

    verify(comicService)
        .getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, false);
  }

  @Test
  void getAllComicsForPublisherAndSeriesAndVolume_unread() {
    when(comicService.getAllComicBooksForPublisherAndSeriesAndVolume(
            anyString(), anyString(), anyString(), anyString(), anyBoolean()))
        .thenReturn(comicList);

    final List<DirectoryEntry> result =
        service.getAllComicsForPublisherAndSeriesAndVolume(
            TEST_EMAIL, true, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ROOT_URL);

    assertNotNull(result);

    verify(comicService)
        .getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, true);
  }

  @Test
  void getAllReadingLists() throws ReadingListException {
    when(readingListService.loadReadingListsForUser(anyString())).thenReturn(readingLists);

    final List<DirectoryEntry> result = service.getAllReadingLists(TEST_EMAIL, TEST_ROOT_URL);

    assertNotNull(result);

    verify(readingListService).loadReadingListsForUser(TEST_EMAIL);
  }

  @Test
  void getAllComicsForReadingList() {
    when(comicService.getAllComicsForReadingList(anyString(), anyLong())).thenReturn(comicList);

    final List<DirectoryEntry> result =
        service.getAllComicsForReadingList(TEST_EMAIL, TEST_READING_LIST_ID, TEST_ROOT_URL);

    assertNotNull(result);

    verify(comicService).getAllComicsForReadingList(TEST_EMAIL, TEST_READING_LIST_ID);
  }

  @Test
  void getAllForTagType() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      final ComicTagType comicTagType = ComicTagType.values()[index];
      when(comicService.getAllValuesForTag(any(ComicTagType.class), anyString(), anyBoolean()))
          .thenReturn(stringSet);

      final List<DirectoryEntry> result =
          service.getAllForTagType(TEST_EMAIL, false, comicTagType, TEST_ROOT_URL);

      assertNotNull(result);

      verify(comicService).getAllValuesForTag(comicTagType, TEST_EMAIL, false);
    }
  }

  @Test
  void getAllForTagType_unrad() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      final ComicTagType comicTagType = ComicTagType.values()[index];
      when(comicService.getAllValuesForTag(any(ComicTagType.class), anyString(), anyBoolean()))
          .thenReturn(stringSet);

      final List<DirectoryEntry> result =
          service.getAllForTagType(TEST_EMAIL, true, comicTagType, TEST_ROOT_URL);

      assertNotNull(result);

      verify(comicService).getAllValuesForTag(comicTagType, TEST_EMAIL, true);
    }
  }

  @Test
  void getAllComicsForTagTypeAndValue() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      final ComicTagType comicTagType = ComicTagType.values()[index];
      when(comicService.getAllComicsForTag(
              any(ComicTagType.class), anyString(), anyString(), anyBoolean()))
          .thenReturn(comicList);

      final List<DirectoryEntry> result =
          service.getAllComicsForTagTypeAndValue(
              TEST_EMAIL, false, comicTagType, "farkle", TEST_ROOT_URL);

      assertNotNull(result);

      verify(comicService).getAllComicsForTag(comicTagType, "farkle", TEST_EMAIL, false);
    }
  }

  @Test
  void getAllComicsForTagTypeAndValue_unread() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      final ComicTagType comicTagType = ComicTagType.values()[index];
      when(comicService.getAllComicsForTag(
              any(ComicTagType.class), anyString(), anyString(), anyBoolean()))
          .thenReturn(comicList);

      final List<DirectoryEntry> result =
          service.getAllComicsForTagTypeAndValue(
              TEST_EMAIL, true, comicTagType, "farkle", TEST_ROOT_URL);

      assertNotNull(result);

      verify(comicService).getAllComicsForTag(comicTagType, "farkle", TEST_EMAIL, true);
    }
  }
}
