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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import junit.framework.TestCase;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSNavigationFeed;
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
class OPDSNavigationServiceTest {
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final String TEST_COLLECTION_ENTRY_NAME = "The Collection Name";
  private static final String TEST_SUBSET_ENTRY_NAME = "The collection subset name";
  private static final String TEST_READING_LIST_SUMMARY = "The list summary";
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final long TEST_READING_LIST_ID = 108L;
  private static final Integer TEST_YEAR = 2022;
  private static final String TEST_ENCODED_NAME = "The encoded name";

  @InjectMocks private OPDSNavigationService service;
  @Mock private ComicService comicService;
  @Mock private ReadingListService readingListService;
  @Mock private ReadingList readingList;
  @Mock private OPDSUtils opdsUtils;
  @Mock private Comic comic;

  private Set<String> collectionList = new HashSet<>();
  private Set<String> collectionSet = new HashSet<>();
  private List<ReadingList> readingLists = new ArrayList<>();
  private List<Comic> comicList = new ArrayList<>();
  private Set<Integer> yearsList = new HashSet<>();
  private Set<Integer> weekList = new HashSet<>();
  private List<Long> entryIdList = new ArrayList<>();

  @BeforeEach
  void setUp() {
    collectionList.add(TEST_COLLECTION_ENTRY_NAME);
    collectionSet.add(TEST_COLLECTION_ENTRY_NAME);
    readingLists.add(readingList);
    when(readingList.getReadingListId()).thenReturn(TEST_READING_LIST_ID);
    when(readingList.getSummary()).thenReturn(TEST_READING_LIST_SUMMARY);
    when(readingList.getEntryIds()).thenReturn(entryIdList);
    for (int year = 1965; year < 2022; year++) yearsList.add(year);
    for (int week = 0; week < 52; week++) weekList.add(week);
    comicList.add(comic);
    when(opdsUtils.urlEncodeString(anyString())).thenReturn(TEST_ENCODED_NAME);
  }

  @Test
  void getRoot() {
    OPDSNavigationFeed result = service.getRootFeed();

    assertNotNull(result);
    assertNotNull(result.getAuthor());
    assertNotNull(result.getTitle());
    assertNotNull(result.getId());
    assertEquals(
        "library?unread=false", result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals(
        "library?unread=true", result.getEntries().get(1).getLinks().get(0).getReference());
  }

  @Test
  void getLibraryFeed() {
    OPDSNavigationFeed result = service.getLibraryFeed(TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(
        "dates/released?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals(
        "collections/publishers?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(1).getLinks().get(0).getReference());
    assertEquals(
        "collections/series?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(2).getLinks().get(0).getReference());
    assertEquals(
        "collections/characters?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(3).getLinks().get(0).getReference());
    assertEquals(
        "collections/teams?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(4).getLinks().get(0).getReference());
    assertEquals(
        "collections/locations?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(5).getLinks().get(0).getReference());
    assertEquals(
        "collections/stories?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(6).getLinks().get(0).getReference());
  }

  @Test
  void rootFeedForPublishers() {
    when(comicService.getAllPublishers(anyString(), anyBoolean())).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getRootFeedForPublishers(TEST_EMAIL, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());

    verify(comicService).getAllPublishers(TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getSeriesFeedForPublisher() {
    when(comicService.getAllSeriesForPublisher(anyString(), anyString(), anyBoolean()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getSeriesFeedForPublisher(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    verify(comicService)
        .getAllSeriesForPublisher(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getVolumeFeedForPublisherAndSeries() {
    when(comicService.getAllVolumesForPublisherAndSeries(
            anyString(), anyString(), anyString(), anyBoolean()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getVolumeFeedForPublisherAndSeries(
            TEST_COLLECTION_ENTRY_NAME, TEST_SUBSET_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    verify(comicService)
        .getAllVolumesForPublisherAndSeries(
            TEST_COLLECTION_ENTRY_NAME, TEST_SUBSET_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void rootFeedForSeries() {
    when(comicService.getAllSeries(anyString(), anyBoolean())).thenReturn(collectionList);

    final OPDSNavigationFeed result = service.getRootFeedForSeries(TEST_EMAIL, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());

    verify(comicService).getAllSeries(TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getVolumeFeedForSeries() {
    when(comicService.getAllPublishersForSeries(anyString(), anyString(), anyBoolean()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getPublishersFeedForSeries(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    verify(comicService)
        .getAllPublishersForSeries(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getCollectionFeedForCharacter() {
    when(comicService.getAllValuesForTag(any(ComicTagType.class), anyString(), anyBoolean()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getCollectionFeed(CollectionType.characters, TEST_EMAIL, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    verify(comicService).getAllValuesForTag(ComicTagType.CHARACTER, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getCollectionFeedForTeams() {
    when(comicService.getAllValuesForTag(any(ComicTagType.class), anyString(), anyBoolean()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getCollectionFeed(CollectionType.teams, TEST_EMAIL, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    verify(comicService).getAllValuesForTag(ComicTagType.TEAM, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getCollectionFeedForLocations() {
    when(comicService.getAllValuesForTag(any(ComicTagType.class), anyString(), anyBoolean()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getCollectionFeed(CollectionType.locations, TEST_EMAIL, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    verify(comicService).getAllValuesForTag(ComicTagType.LOCATION, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getCollectionFeedForStory() {
    when(comicService.getAllValuesForTag(any(ComicTagType.class), anyString(), anyBoolean()))
        .thenReturn(collectionSet);

    final OPDSNavigationFeed result =
        service.getCollectionFeed(CollectionType.stories, TEST_EMAIL, TEST_UNREAD);

    assertNotNull(result);
    assertTrue(result.getEntries().get(0).getTitle().contains(TEST_COLLECTION_ENTRY_NAME));

    verify(comicService).getAllValuesForTag(ComicTagType.STORY, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void loadReadingListFeedReadingListException() throws ReadingListException {
    when(readingListService.loadReadingListsForUser(anyString()))
        .thenThrow(ReadingListException.class);

    assertThrows(OPDSException.class, () -> service.getReadingListsFeed(TEST_EMAIL));
  }

  @Test
  void loadReadingListFeed() throws ReadingListException, OPDSException {
    when(readingListService.loadReadingListsForUser(anyString())).thenReturn(readingLists);

    final OPDSNavigationFeed result = service.getReadingListsFeed(TEST_EMAIL);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(
        String.format("lists/%d", TEST_READING_LIST_ID),
        result.getEntries().get(0).getLinks().get(0).getReference());

    verify(readingListService).loadReadingListsForUser(TEST_EMAIL);
  }

  @Test
  void getYearsFeed() {
    when(comicService.getAllYears(anyString(), anyBoolean())).thenReturn(yearsList);

    final OPDSNavigationFeed result = service.getYearsFeed(TEST_EMAIL, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(yearsList.size(), result.getEntries().size());

    verify(comicService).getAllYears(TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  void getWeeksFeedForYear() {
    when(comicService.getAllWeeksForYear(anyInt(), anyString(), anyBoolean())).thenReturn(weekList);

    final OPDSNavigationFeed result =
        service.getWeeksFeedForYear(TEST_YEAR, TEST_EMAIL, TEST_UNREAD);

    TestCase.assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(weekList.size(), result.getEntries().size());

    verify(comicService).getAllWeeksForYear(TEST_YEAR, TEST_EMAIL, TEST_UNREAD);
  }
}
