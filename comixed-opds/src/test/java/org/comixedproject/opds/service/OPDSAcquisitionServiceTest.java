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
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.List;
import junit.framework.TestCase;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicDetailException;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.jupiter.api.Assertions;
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
class OPDSAcquisitionServiceTest {
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

  @InjectMocks private OPDSAcquisitionService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ReadingListService readingListService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private ComicDetail comicDetail;
  @Mock private ReadingList readingList;
  @Mock private OPDSAcquisitionFeedEntry comicEntry;

  private List<Long> entryIdList = new ArrayList<>();
  private List<ComicDetail> comicDetailList = new ArrayList<>();
  private List<ReadingList> readingLists = new ArrayList<>();

  @BeforeEach
  public void setUp() throws ComicDetailException {
    readingLists.add(readingList);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingList.getEntryIds()).thenReturn(entryIdList);
    Mockito.when(opdsUtils.urlEncodeString(Mockito.anyString())).thenReturn(TEST_ENCODED_NAME);
    entryIdList.add(TEST_COMIC_ID);
    comicDetailList.add(comicDetail);
    Mockito.when(comicDetailService.getByComicBookId(Mockito.anyLong())).thenReturn(comicDetail);
  }

  @Test
  void getEntriesForCollectionFeedForCharacter() {
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
  void getEntriesForCollectionFeedForTeam() {
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
  void getEntriesForCollectionFeedForLocation() {
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
  void getEntriesForCollectionFeedForStory() {
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
  void getComicFeedForPublisherAndSeriesAndVolume() {
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

  @Test
  void loadReadingListEntriesServiceException() throws ReadingListException {
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    assertThrows(
        OPDSException.class,
        () -> service.getComicFeedForReadingList(TEST_EMAIL, TEST_READING_LIST_ID));
  }

  @Test
  void loadReadingListEntries() throws ReadingListException, OPDSException, ComicDetailException {
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(readingList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicDetail.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        service.getComicFeedForReadingList(TEST_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(readingListService, Mockito.times(1))
        .loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicDetail);
    Mockito.verify(comicDetailService, Mockito.times(1)).getByComicBookId(TEST_COMIC_ID);
  }

  @Test
  void getComicsFeedForYearAndWeek() {
    Mockito.when(
            comicDetailService.getComicsForYearAndWeek(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicDetailList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicDetail.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        service.getComicsFeedForYearAndWeek(TEST_EMAIL, TEST_YEAR, TEST_WEEK, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(entryIdList.size(), result.getEntries().size());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, TEST_UNREAD);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicDetail);
  }

  @Test
  void getComicsForSearchTerm() {
    Mockito.when(comicDetailService.getComicForSearchTerm(Mockito.anyString()))
        .thenReturn(comicDetailList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicDetail.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result = service.getComicsFeedForSearchTerms(TEST_SEARCH_TERM);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(entryIdList.size(), result.getEntries().size());

    Mockito.verify(comicDetailService, Mockito.times(1)).getComicForSearchTerm(TEST_SEARCH_TERM);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicDetail);
  }
}
