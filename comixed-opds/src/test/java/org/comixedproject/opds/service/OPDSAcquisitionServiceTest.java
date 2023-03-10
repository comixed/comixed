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

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import junit.framework.TestCase;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicDetailService;
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
  private static final String TEST_PUBLISHER_NAME = "The Series Name";
  private static final String TEST_SERIES_NAME = "The Series Name";
  private static final String TEST_VOLUME = "2022";
  private static final long TEST_READING_LIST_ID = 108L;
  private static final long TEST_COMIC_ID = 279L;
  private static final Integer TEST_YEAR = 2022;
  private static final Integer TEST_WEEK = RandomUtils.nextInt(52);
  private static final String TEST_SEARCH_TERM = "the search term";
  private static final String TEST_TAG_NAME = "Tag value";

  @InjectMocks private OPDSAcquisitionService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ReadingListService readingListService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private ReadingList readingList;
  @Mock private OPDSAcquisitionFeedEntry comicEntry;

  private List<ComicDetail> comicDetailList = new ArrayList<>();
  private List<ReadingList> readingLists = new ArrayList<>();

  @Before
  public void setUp() {
    readingLists.add(readingList);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingList.getEntries()).thenReturn(comicDetailList);
    Mockito.when(opdsUtils.urlEncodeString(Mockito.anyString())).thenReturn(TEST_ENCODED_NAME);
    comicDetailList.add(comicDetail);
  }

  @Test
  public void testGetEntriesForCollectionFeedForCharacter() {
    Mockito.when(
            comicDetailService.getAllComicsForTag(
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.characters, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicsForTag(
            ComicTagType.CHARACTER, TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForTeam() {
    Mockito.when(
            comicDetailService.getAllComicsForTag(
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.teams, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicsForTag(ComicTagType.TEAM, TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForLocation() {
    Mockito.when(
            comicDetailService.getAllComicsForTag(
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.locations, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicsForTag(
            ComicTagType.LOCATION, TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForStory() {
    Mockito.when(
            comicDetailService.getAllComicsForTag(
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final OPDSAcquisitionFeed result =
        service.getEntriesForCollectionFeed(
            TEST_EMAIL, CollectionType.stories, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicsForTag(
            ComicTagType.STORY, TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetComicFeedForPublisherAndSeriesAndVolume() {
    Mockito.when(
            comicDetailService.getAllComicBooksForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final OPDSAcquisitionFeed result =
        service.getComicFeedsForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER_NAME, TEST_SERIES_NAME, TEST_VOLUME, TEST_EMAIL, TEST_UNREAD);

    Assertions.assertNotNull(result);

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER_NAME, TEST_SERIES_NAME, TEST_VOLUME, TEST_EMAIL, TEST_UNREAD);
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
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicDetail.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        service.getComicFeedForReadingList(TEST_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertTrue(result.getEntries().contains(comicEntry));

    Mockito.verify(readingListService, Mockito.times(1))
        .loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicDetail);
  }

  @Test
  public void testGetComicsFeedForYearAndWeek() {
    Mockito.when(
            comicDetailService.getComicsForYearAndWeek(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicDetailList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicDetail.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        service.getComicsFeedForYearAndWeek(TEST_EMAIL, TEST_YEAR, TEST_WEEK, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(comicDetailList.size(), result.getEntries().size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, TEST_UNREAD);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicDetail);
  }

  @Test
  public void testGetComicsForSearchTerm() {
    Mockito.when(comicDetailService.getComicForSearchTerm(Mockito.anyString()))
        .thenReturn(comicDetailList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicDetail.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result = service.getComicsFeedForSearchTerms(TEST_SEARCH_TERM);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(comicDetailList.size(), result.getEntries().size());

    Mockito.verify(comicDetailService, Mockito.times(1)).getComicForSearchTerm(TEST_SEARCH_TERM);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicDetail);
  }
}
