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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.service.comicbooks.ComicDetailService;
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

  @InjectMocks private DirectoryReaderService service;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ReadingListService readingListService;
  @Mock private ComicDetail comicDetail;

  private Set<String> stringList = new HashSet<>();
  private List<ComicDetail> comicDetailList = new ArrayList<>();
  private List<ReadingList> readingLists = new ArrayList<>();

  @BeforeEach
  void setUp() {
    stringList.add(TEST_STRING_ENTRY);
    Mockito.when(comicDetail.getComicId()).thenReturn(TEST_COMIC_ID);
    Mockito.when(comicDetail.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(comicDetail.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(comicDetail.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(comicDetail.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    comicDetailList.add(comicDetail);
  }

  @Test
  void getAllPublishers() {
    Mockito.when(comicDetailService.getAllPublishers(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result = service.getAllPublishers(TEST_EMAIL, false, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1)).getAllPublishers(TEST_EMAIL, false);
  }

  @Test
  void getAllPublishers_unread() {
    Mockito.when(comicDetailService.getAllPublishers(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result = service.getAllPublishers(TEST_EMAIL, true, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1)).getAllPublishers(TEST_EMAIL, true);
  }

  @Test
  void getAllSeries() {
    Mockito.when(comicDetailService.getAllSeries(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result = service.getAllSeries(TEST_EMAIL, false, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1)).getAllSeries(TEST_EMAIL, false);
  }

  @Test
  void getAllSeries_unread() {
    Mockito.when(comicDetailService.getAllSeries(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result = service.getAllSeries(TEST_EMAIL, true, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1)).getAllSeries(TEST_EMAIL, true);
  }

  @Test
  void getAllPublishersForSeries() {
    Mockito.when(
            comicDetailService.getAllPublishersForSeries(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result =
        service.getAllPublishersForSeries(TEST_EMAIL, false, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, false);
  }

  @Test
  void getAllPublishersForSeries_unread() {
    Mockito.when(
            comicDetailService.getAllPublishersForSeries(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result =
        service.getAllPublishersForSeries(TEST_EMAIL, true, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, true);
  }

  @Test
  void getAllSeriesForPublisher() {
    Mockito.when(
            comicDetailService.getAllSeriesForPublisher(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result =
        service.getAllSeriesForPublisher(TEST_EMAIL, false, TEST_PUBLISHER, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, false);
  }

  @Test
  void getAllSeriesForPublisher_unread() {
    Mockito.when(
            comicDetailService.getAllSeriesForPublisher(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result =
        service.getAllSeriesForPublisher(TEST_EMAIL, true, TEST_PUBLISHER, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, true);
  }

  @Test
  void getAllVolumesForPublisherAndSeries() {
    Mockito.when(
            comicDetailService.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result =
        service.getAllVolumesForPublisherAndSeries(
            TEST_EMAIL, false, TEST_PUBLISHER, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, false);
  }

  @Test
  void getAllVolumesForPublisherAndSeries_unread() {
    Mockito.when(
            comicDetailService.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(stringList);

    final List<DirectoryEntry> result =
        service.getAllVolumesForPublisherAndSeries(
            TEST_EMAIL, true, TEST_PUBLISHER, TEST_SERIES, TEST_ROOT_URL);

    assertNotNull(result);
    assertEquals(stringList.size(), result.size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, true);
  }

  @Test
  void getAllComicsForPublisherAndSeriesAndVolume() {
    Mockito.when(
            comicDetailService.getAllComicBooksForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final List<DirectoryEntry> result =
        service.getAllComicsForPublisherAndSeriesAndVolume(
            TEST_EMAIL, false, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ROOT_URL);

    assertNotNull(result);

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, false);
  }

  @Test
  void getAllComicsForPublisherAndSeriesAndVolume_unread() {
    Mockito.when(
            comicDetailService.getAllComicBooksForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final List<DirectoryEntry> result =
        service.getAllComicsForPublisherAndSeriesAndVolume(
            TEST_EMAIL, true, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ROOT_URL);

    assertNotNull(result);

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, true);
  }

  @Test
  void getAllReadingLists() throws ReadingListException {
    Mockito.when(readingListService.loadReadingListsForUser(Mockito.anyString()))
        .thenReturn(readingLists);

    final List<DirectoryEntry> result = service.getAllReadingLists(TEST_EMAIL, TEST_ROOT_URL);

    assertNotNull(result);

    Mockito.verify(readingListService, Mockito.times(1)).loadReadingListsForUser(TEST_EMAIL);
  }

  @Test
  void getAllComicsForReadingList() throws ReadingListException {
    Mockito.when(
            comicDetailService.getAllComicsForReadingList(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(comicDetailList);

    final List<DirectoryEntry> result =
        service.getAllComicsForReadingList(TEST_EMAIL, TEST_READING_LIST_ID, TEST_ROOT_URL);

    assertNotNull(result);

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicsForReadingList(TEST_EMAIL, TEST_READING_LIST_ID);
  }
}
