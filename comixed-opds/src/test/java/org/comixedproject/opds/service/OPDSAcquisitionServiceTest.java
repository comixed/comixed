/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.opds.service;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;
import junit.framework.TestCase;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.Before;
import org.junit.Test;
import org.junit.jupiter.api.Assertions;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSAcquisitionServiceTest {
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final String TEST_COLLECTION_ENTRY_NAME = "The Collection Name";
  private static final String TEST_SUBSET_ENTRY_NAME = "The Subtype Name";
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_ENCODED_NAME = "The encoded name";
  private static final String TEST_VOLUME = "2022";
  private static final long TEST_READING_LIST_ID = 108L;
  private static final long TEST_COMIC_ID = 279L;
  private static final Integer TEST_YEAR = 2022;
  private static final Integer TEST_WEEK = RandomUtils.nextInt(52);

  @InjectMocks private OPDSAcquisitionService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ReadingListService readingListService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private ComicBook comicBook;
  @Mock private ReadingList readingList;
  @Mock private OPDSAcquisitionFeedEntry comicEntry;

  private List<ComicBook> comicBookList = new ArrayList<>();
  private List<ReadingList> readingLists = new ArrayList<>();

  @Before
  public void setUp() {
    readingLists.add(readingList);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingList.getComicBooks()).thenReturn(comicBookList);
    Mockito.when(opdsUtils.urlEncodeString(Mockito.anyString())).thenReturn(TEST_ENCODED_NAME);
    comicBookList.add(comicBook);
    Mockito.when(comicBook.getId()).thenReturn(TEST_COMIC_ID);
  }

  @Test
  public void testGetEntriesForCollectionFeedForSeries() {
    Mockito.when(
            comicBookService.getAllForSeries(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.series, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForSeries(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForCharacter() {
    Mockito.when(
            comicBookService.getAllForCharacter(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.characters, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForCharacter(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForTeam() {
    Mockito.when(
            comicBookService.getAllForTeam(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.teams, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForTeam(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForLocation() {
    Mockito.when(
            comicBookService.getAllForLocation(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.locations, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForLocation(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForStory() {
    Mockito.when(
            comicBookService.getAllForStory(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.stories, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForStory(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetComicFeedForPublisherAndSeriesAndVolume() {
    Mockito.when(
            comicBookService.getAllComicBooksForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        service.getComicFeedsForPublisherAndSeriesAndVolume(
            TEST_COLLECTION_ENTRY_NAME,
            TEST_SUBSET_ENTRY_NAME,
            TEST_VOLUME,
            TEST_EMAIL,
            TEST_UNREAD);

    Assertions.assertNotNull(result);

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_COLLECTION_ENTRY_NAME,
            TEST_SUBSET_ENTRY_NAME,
            TEST_VOLUME,
            TEST_EMAIL,
            TEST_UNREAD);
  }

  @Test(expected = OPDSException.class)
  public void testLoadReadingListEntriesServiceException()
      throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    try {
      service.getComicFeedForReadingList(TEST_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1))
          .loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testLoadReadingListEntries() throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(readingList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicBook.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        service.getComicFeedForReadingList(TEST_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertTrue(result.getEntries().contains(comicEntry));

    Mockito.verify(readingListService, Mockito.times(1))
        .loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicBook);
  }

  @Test
  public void testGetComicsFeedForYearAndWeek() {
    Mockito.when(
            comicBookService.getComicsForYearAndWeek(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicBook.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        service.getComicsFeedForYearAndWeek(TEST_EMAIL, TEST_YEAR, TEST_WEEK, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(comicBookList.size(), result.getEntries().size());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, TEST_UNREAD);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicBook);
  }
}
