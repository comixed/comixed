/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import junit.framework.TestCase;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSNavigationServiceTest {
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final String TEST_COLLECTION_ENTRY_NAME = "The Collection Name";
  private static final String TEST_SUBSET_ENTRY_NAME = "The collection subset name";
  private static final String TEST_READING_LIST_SUMMARY = "The list summary";
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final long TEST_READING_LIST_ID = 108L;
  private static final Integer TEST_YEAR = 2022;
  private static final String TEST_ENCODED_NAME = "The encoded name";

  @InjectMocks private OPDSNavigationService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ReadingListService readingListService;
  @Mock private ReadingList readingList;
  @Mock private OPDSUtils opdsUtils;
  @Mock private ComicBook comicBook;

  private List<String> collectionList = new ArrayList<>();
  private Set<String> collectionSet = new HashSet<>();
  private List<ReadingList> readingLists = new ArrayList<>();
  private List<ComicBook> comicBookList = new ArrayList<>();
  private List<Integer> yearList = new ArrayList<>();
  private List<Integer> weekList = new ArrayList<>();

  @Before
  public void setUp() {
    collectionList.add(TEST_COLLECTION_ENTRY_NAME);
    collectionSet.add(TEST_COLLECTION_ENTRY_NAME);
    readingLists.add(readingList);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingList.getSummary()).thenReturn(TEST_READING_LIST_SUMMARY);
    Mockito.when(readingList.getComicBooks()).thenReturn(comicBookList);
    for (int year = 1965; year < 2022; year++) yearList.add(year);
    for (int week = 0; week < 52; week++) weekList.add(week);
    comicBookList.add(comicBook);
    Mockito.when(opdsUtils.urlEncodeString(Mockito.anyString())).thenReturn(TEST_ENCODED_NAME);
  }

  @Test
  public void testGetRoot() {
    OPDSNavigationFeed result = service.getRootFeed();

    assertNotNull(result);
    assertNotNull(result.getAuthor());
    assertNotNull(result.getTitle());
    assertNotNull(result.getId());
    assertEquals("/opds/library/", result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals(
        "/opds/library/?unread=true", result.getEntries().get(1).getLinks().get(0).getReference());
  }

  @Test
  public void testGetLibraryFeed() {
    OPDSNavigationFeed result = service.getLibraryFeed(TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(
        "/opds/dates/released/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/publishers/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(1).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/series/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(2).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/characters/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(3).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/teams/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(4).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/locations/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(5).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/stories/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(6).getLinks().get(0).getReference());
  }

  @Test
  public void testGetCollectionFeedForPublisher() {
    Mockito.when(comicBookService.getAllPublishers()).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getCollectionFeed(CollectionType.publishers, false);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForSeries() {
    Mockito.when(comicBookService.getAllSeries()).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getCollectionFeed(CollectionType.series, false);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForCharacters() {
    Mockito.when(comicBookService.getAllCharacters()).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getCollectionFeed(CollectionType.characters, false);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForTeams() {
    Mockito.when(comicBookService.getAllTeams()).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getCollectionFeed(CollectionType.teams, false);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForLocations() {
    Mockito.when(comicBookService.getAllLocations()).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getCollectionFeed(CollectionType.locations, false);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForStories() {
    Mockito.when(comicBookService.getAllStories()).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getCollectionFeed(CollectionType.stories, false);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetSeriesFeedForPublisher() {
    Mockito.when(comicBookService.getAllSeriesForPublisher(Mockito.anyString()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getSeriesFeedForPublisher(TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllSeriesForPublisher(TEST_COLLECTION_ENTRY_NAME);
  }

  @Test
  public void testGetVolumeFeedForPublisherAndSeries() {
    Mockito.when(
            comicBookService.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(), Mockito.anyString()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getVolumeFeedForPublisherAndSeries(
            TEST_COLLECTION_ENTRY_NAME, TEST_SUBSET_ENTRY_NAME, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_COLLECTION_ENTRY_NAME, TEST_SUBSET_ENTRY_NAME);
  }

  @Test(expected = OPDSException.class)
  public void testLoadReadingListFeedReadingListException()
      throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListsForUser(Mockito.anyString()))
        .thenThrow(ReadingListException.class);

    try {
      service.getReadingListsFeed(TEST_EMAIL);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1)).loadReadingListsForUser(TEST_EMAIL);
    }
  }

  @Test
  public void testLoadReadingListFeed() throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListsForUser(Mockito.anyString()))
        .thenReturn(readingLists);

    final OPDSNavigationFeed result = service.getReadingListsFeed(TEST_EMAIL);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(
        String.format("/opds/lists/%d/", TEST_READING_LIST_ID),
        result.getEntries().get(0).getLinks().get(0).getReference());

    Mockito.verify(readingListService, Mockito.times(1)).loadReadingListsForUser(TEST_EMAIL);
  }

  @Test
  public void testGetYearsFeed() {
    Mockito.when(comicBookService.getYearsForComics()).thenReturn(yearList);

    final OPDSNavigationFeed result = service.getYearsFeed(TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(yearList.size(), result.getEntries().size());

    Mockito.verify(comicBookService, Mockito.times(1)).getYearsForComics();
  }

  @Test
  public void testGetWeeksFeedForYear() {
    Mockito.when(comicBookService.getWeeksForYear(Mockito.anyInt())).thenReturn(weekList);

    final OPDSNavigationFeed result = service.getWeeksFeedForYear(TEST_YEAR, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(weekList.size(), result.getEntries().size());

    Mockito.verify(comicBookService, Mockito.times(1)).getWeeksForYear(TEST_YEAR);
  }
}
