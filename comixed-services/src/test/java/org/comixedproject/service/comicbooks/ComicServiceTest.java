/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.never;

import java.text.ParseException;
import java.util.*;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.model.batch.UpdateMetadataEvent;
import org.comixedproject.model.collections.CollectionEntry;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.comicbooks.ComicRepository;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

@ExtendWith(MockitoExtension.class)
class ComicServiceTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_PUBLISHER = "THe Publisher Name";
  private static final String TEST_SERIES = "The Series Name";
  private static final String TEST_VOLUME = "2023";
  private static final ComicTagType TEST_TAG_TYPE = ComicTagType.CHARACTER;
  private static final String TEST_FILTER_TEXT = "The filtering text";
  private static final int TEST_YEAR = 2023;
  private static final int TEST_WEEK = 17;
  private static final String TEST_SEARCH_TERM = "Random text...";
  private static final String TEST_TAG_VALUE = "tag value";
  private static final int TEST_PAGE_SIZE = 10;
  private static final int TEST_PAGE_INDEX = RandomUtils.nextInt(100);
  private static final long TEST_TOTAL_COMIC_COUNT = RandomUtils.nextLong() * 30000L;
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_STANDARDIZED_FILENAME = "the-standardized-filename";
  private static final String TEST_COVER_DATE = "2026-01-17";
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final Long TEST_COMIC_ID = 650717L;
  private static final String TEST_ISSUE_NUMBER = "1010";
  private static final String TEST_STORY_NAME = "The Story Name";

  private final Set<Date> weeksList = new HashSet<>();
  private final List<String> sortFieldNames = new ArrayList<>();
  private final List<Comic> comicList = new ArrayList<>();

  @InjectMocks private ComicService service;
  @Mock private ComicRepository comicRepository;
  @Mock private ComicStateAdaptor comicStateAdaptor;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ApplicationEventPublisher applicationEventPublisher;
  @Mock private Set<String> publisherSet;
  @Mock private Set<String> seriesSet;
  @Mock private Set<String> volumeSet;
  @Mock private Set<String> tagSet;
  @Mock private Set<Integer> yearSet;
  @Mock private Set<Long> comicIdSet;
  @Mock private Example<Comic> example;
  @Mock private CollectionEntry collectionEntry;
  @Mock private Comic comicBook;
  @Mock private Comic comic;
  @Mock private ArchiveType targetArchiveType;
  @Mock private List<RemoteLibrarySegmentState> librarySegmentList;
  @Mock private List<PublisherAndYearSegment> byPublisherAndYearList;
  @Mock private List<SeriesDetail> seriesDetail;
  @Mock private Set<String> comicFilenameList;

  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;
  @Captor private ArgumentCaptor<Date> startDateArgumentCaptor;
  @Captor private ArgumentCaptor<Date> endDateArgumentCaptor;

  private List<CollectionEntry> collectionEntryList = new ArrayList<>();
  private final List<Long> idList = new ArrayList<>();
  private Set<Date> coverDateSet = new HashSet<>();

  @BeforeEach
  void setUp() throws ParseException {
    weeksList.add(new Date());

    coverDateSet.add(service.coverDateFormat.parse(TEST_COVER_DATE));

    sortFieldNames.add("archive-type");
    sortFieldNames.add("comic-state");
    sortFieldNames.add("comic-type");
    sortFieldNames.add("publisher");
    sortFieldNames.add("series");
    sortFieldNames.add("volume");
    sortFieldNames.add("issue-number");
    sortFieldNames.add("added-date");
    sortFieldNames.add("cover-date");
    sortFieldNames.add("tag-value");
    sortFieldNames.add("page-count");
    sortFieldNames.add("id");
  }

  @Test
  void filenameFound_caseInsensitive() {
    when(comicFileAdaptor.standardizeFilename(anyString())).thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);

    when(comicRepository.existsByFilenameIgnoreCase(anyString())).thenReturn(true);

    assertTrue(service.filenameFound(TEST_COMIC_FILENAME));

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).existsByFilenameIgnoreCase(TEST_STANDARDIZED_FILENAME);
  }

  @Test
  void filenameFound_caseSensitive() {
    when(comicFileAdaptor.standardizeFilename(anyString())).thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);

    when(comicRepository.existsByFilename(anyString())).thenReturn(true);

    assertTrue(service.filenameFound(TEST_COMIC_FILENAME));

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).existsByFilename(TEST_STANDARDIZED_FILENAME);
  }

  @Test
  void getAllCoverDates() {
    when(comicRepository.getAllCoverDates()).thenReturn(coverDateSet);

    final Set<String> result = service.getAllCoverDates(TEST_EMAIL, false);

    assertNotNull(result);
    assertEquals(
        TEST_COVER_DATE, service.coverDateFormat.format(coverDateSet.stream().toList().get(0)));

    verify(comicRepository).getAllCoverDates();
  }

  @Test
  void getAllCoverDates_unread() {
    when(comicRepository.getAllUnreadCoverDates(anyString())).thenReturn(coverDateSet);

    final Set<String> result = service.getAllCoverDates(TEST_EMAIL, true);

    assertNotNull(result);
    assertEquals(
        TEST_COVER_DATE, service.coverDateFormat.format(coverDateSet.stream().toList().get(0)));

    verify(comicRepository).getAllUnreadCoverDates(TEST_EMAIL);
  }

  @Test
  void getAllComicsForCoverDate() throws ParseException {
    when(comicRepository.getAllComicsForCoverDate(any(Date.class))).thenReturn(comicList);

    final List<Comic> result = service.getAllComicsForCoverDate(TEST_COVER_DATE, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository)
        .getAllComicsForCoverDate(service.coverDateFormat.parse(TEST_COVER_DATE));
  }

  @Test
  void getAllComicsForCoverDate_unread() throws ParseException {
    when(comicRepository.getAllUnreadComicsForCoverDate(any(Date.class), anyString()))
        .thenReturn(comicList);

    final List<Comic> result = service.getAllComicsForCoverDate(TEST_COVER_DATE, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository)
        .getAllUnreadComicsForCoverDate(service.coverDateFormat.parse(TEST_COVER_DATE), TEST_EMAIL);
  }

  @Test
  void getAllPublishers_withUnread() {
    when(comicRepository.getAllUnreadPublishers(anyString())).thenReturn(publisherSet);

    final Set<String> result = service.getAllPublishers(TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(publisherSet, result);

    verify(comicRepository).getAllUnreadPublishers(TEST_EMAIL);
  }

  @Test
  void getAllPublishers() {
    when(comicRepository.getAllPublishers()).thenReturn(publisherSet);

    final Set<String> result = service.getAllPublishers(TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(publisherSet, result);

    verify(comicRepository).getAllPublishers();
  }

  @Test
  void getAllSeriesForPublisher_withUnread() {
    when(comicRepository.getAllUnreadSeriesForPublisher(anyString(), anyString()))
        .thenReturn(seriesSet);

    final Set<String> result = service.getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(seriesSet, result);

    verify(comicRepository).getAllUnreadSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL);
  }

  @Test
  void getAllSeriesForPublishers() {
    when(comicRepository.getAllSeriesForPublisher(anyString())).thenReturn(seriesSet);

    final Set<String> result = service.getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(seriesSet, result);

    verify(comicRepository).getAllSeriesForPublisher(TEST_PUBLISHER);
  }

  @Test
  void getAllVolumesForPublisherAndSeries_withUnread() {
    when(comicRepository.getAllUnreadVolumesForPublisherAndSeries(
            anyString(), anyString(), anyString()))
        .thenReturn(volumeSet);

    final Set<String> result =
        service.getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(volumeSet, result);

    verify(comicRepository)
        .getAllUnreadVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL);
  }

  @Test
  void getAllVolumesForPublisherAndSeries() {
    when(comicRepository.getAllVolumesForPublisherAndSeries(anyString(), anyString()))
        .thenReturn(volumeSet);

    final Set<String> result =
        service.getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(volumeSet, result);

    verify(comicRepository).getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES);
  }

  @Test
  void getAllSeries() {
    when(comicRepository.getAllSeries()).thenReturn(seriesSet);

    final Set<String> result = service.getAllSeries();

    assertNotNull(result);
    assertSame(seriesSet, result);

    verify(comicRepository).getAllSeries();
  }

  @Test
  void getAllSeriesAsTopLevel_withUnread() {
    when(comicRepository.getAllUnreadSeries(anyString())).thenReturn(volumeSet);

    final Set<String> result = service.getAllSeries(TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(volumeSet, result);

    verify(comicRepository).getAllUnreadSeries(TEST_EMAIL);
  }

  @Test
  void getAllSeriesAsTopLevel() {
    when(comicRepository.getAllSeries()).thenReturn(volumeSet);

    final Set<String> result = service.getAllSeries(TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(volumeSet, result);

    verify(comicRepository).getAllSeries();
  }

  @Test
  void getAllPublishersForSeries_withUnread() {
    when(comicRepository.getAllUnreadPublishersForSeries(anyString(), anyString()))
        .thenReturn(publisherSet);

    final Set<String> result = service.getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(publisherSet, result);

    verify(comicRepository).getAllUnreadPublishersForSeries(TEST_SERIES, TEST_EMAIL);
  }

  @Test
  void getAllPublishersForSeries() {
    when(comicRepository.getAllPublishersForSeries(anyString())).thenReturn(publisherSet);

    final Set<String> result = service.getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(publisherSet, result);

    verify(comicRepository).getAllPublishersForSeries(TEST_SERIES);
  }

  @Test
  void getAllComicBooksForPublisherAndSeriesAndVolume_withUnread() {
    when(comicRepository.getAllUnreadForPublisherAndSeriesAndVolume(
            anyString(), anyString(), anyString(), anyString()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository)
        .getAllUnreadForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL);
  }

  @Test
  void getAllComicBooksForPublisherAndSeriesAndVolume() {
    when(comicRepository.getAllForPublisherAndSeriesAndVolume(
            anyString(), anyString(), anyString()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository)
        .getAllForPublisherAndSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }

  @Test
  void getAllValuesForTags_withUnread() {
    when(comicRepository.getAllUnreadValuesForTagType(any(ComicTagType.class), anyString()))
        .thenReturn(tagSet);

    final Set<String> result = service.getAllValuesForTag(TEST_TAG_TYPE, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(tagSet, result);

    verify(comicRepository).getAllUnreadValuesForTagType(TEST_TAG_TYPE, TEST_EMAIL);
  }

  @Test
  void getAllValuesForTags() {
    when(comicRepository.getAllValuesForTagType(any(ComicTagType.class))).thenReturn(tagSet);

    final Set<String> result = service.getAllValuesForTag(TEST_TAG_TYPE, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(tagSet, result);

    verify(comicRepository).getAllValuesForTagType(TEST_TAG_TYPE);
  }

  @Test
  void getAllYears_withUnread() {
    when(comicRepository.getAllUnreadYears(anyString())).thenReturn(yearSet);

    final Set<Integer> result = service.getAllYears(TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(yearSet, result);

    verify(comicRepository).getAllUnreadYears(TEST_EMAIL);
  }

  @Test
  void getAllYears() {
    when(comicRepository.getAllYears()).thenReturn(yearSet);

    final Set<Integer> result = service.getAllYears(TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(yearSet, result);

    verify(comicRepository).getAllYears();
  }

  @Test
  void getAllWeeksForYear_withUnread() {
    when(comicRepository.getAllUnreadWeeksForYear(anyInt(), anyString())).thenReturn(weeksList);

    final Set<Integer> result = service.getAllWeeksForYear(TEST_YEAR, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    verify(comicRepository).getAllUnreadWeeksForYear(TEST_YEAR, TEST_EMAIL);
  }

  @Test
  void getAllWeeksForYear() {
    when(comicRepository.getAllWeeksForYear(anyInt())).thenReturn(weeksList);

    final Set<Integer> result = service.getAllWeeksForYear(TEST_YEAR, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    verify(comicRepository).getAllWeeksForYear(TEST_YEAR);
  }

  @Test
  void getComicsForYearAndWeek_withUnread() {
    when(comicRepository.getAllUnreadForYearAndWeek(
            startDateArgumentCaptor.capture(), endDateArgumentCaptor.capture(), anyString()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicList, result);

    final Date startDate = startDateArgumentCaptor.getValue();
    final Date endDate = endDateArgumentCaptor.getValue();
    assertTrue(endDate.after(startDate));

    verify(comicRepository).getAllUnreadForYearAndWeek(startDate, endDate, TEST_EMAIL);
  }

  @Test
  void getComicsForYearAndWeek() {
    when(comicRepository.getAllForYearAndWeek(
            startDateArgumentCaptor.capture(), endDateArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicList, result);

    final Date startDate = startDateArgumentCaptor.getValue();
    final Date endDate = endDateArgumentCaptor.getValue();
    assertTrue(endDate.after(startDate));

    verify(comicRepository).getAllForYearAndWeek(startDate, endDate);
  }

  @Test
  void getComicsForSearchTerm() {
    when(comicRepository.getForSearchTerm(anyString())).thenReturn(comicList);

    final List<Comic> result = service.getComicForSearchTerm(TEST_SEARCH_TERM);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository).getForSearchTerm(TEST_SEARCH_TERM);
  }

  @Test
  void getComicsForTag_withUnread() {
    when(comicRepository.getAllUnreadComicsForTagType(
            any(ComicTagType.class), anyString(), anyString()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getAllComicsForTag(TEST_TAG_TYPE, TEST_TAG_VALUE, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository).getAllUnreadComicsForTagType(TEST_TAG_TYPE, TEST_TAG_VALUE, TEST_EMAIL);
  }

  @Test
  void getComicsForTag() {
    when(comicRepository.getAllComicsForTagType(any(ComicTagType.class), anyString()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getAllComicsForTag(TEST_TAG_TYPE, TEST_TAG_VALUE, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository).getAllComicsForTagType(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void findAllByExample() {
    when(comicRepository.findAll(any(Example.class))).thenReturn(comicList);

    final List<Comic> result = service.findAllByExample(example);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository).findAll(example);
  }

  @Test
  void loadComicDetailsById() {
    when(comicRepository.findAllById(anySet())).thenReturn(comicList);

    final List<Comic> result = service.loadComicDetailListById(comicIdSet);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository).findAllById(comicIdSet);
  }

  @Test
  void loadCollectionEntries_unsorted() {
    collectionEntryList.add(collectionEntry);

    when(comicRepository.loadCollectionEntries(
            any(ComicTagType.class), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTest("");
  }

  @Test
  void loadCollectionEntries_tagValueSort() {
    collectionEntryList.add(collectionEntry);

    when(comicRepository.loadCollectionEntries(
            any(ComicTagType.class), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTest("tag-value");
  }

  @Test
  void loadCollectionEntries_comicCountSort() {
    collectionEntryList.add(collectionEntry);

    when(comicRepository.loadCollectionEntries(
            any(ComicTagType.class), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTest("comic-count");
  }

  private void doCollectionEntriesTest(final String sortBy) {
    final List<CollectionEntry> result =
        service.loadCollectionEntries(
            TEST_TAG_TYPE, "", TEST_PAGE_SIZE, TEST_PAGE_INDEX, sortBy, TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    if (StringUtils.hasLength(sortBy)) {
      assertFalse(pageable.getSort().stream().toList().isEmpty());
    }

    verify(comicRepository).loadCollectionEntries(TEST_TAG_TYPE, pageable);
  }

  @Test
  void loadCollectionEntries_unsorted_withFiltering() {
    collectionEntryList.add(collectionEntry);

    when(comicRepository.loadCollectionEntriesWithFiltering(
            any(ComicTagType.class), anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTestWithFiltering("");
  }

  @Test
  void loadCollectionEntries_tagValueSort_withFiltering() {
    collectionEntryList.add(collectionEntry);

    when(comicRepository.loadCollectionEntriesWithFiltering(
            any(ComicTagType.class), anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTestWithFiltering("tag-value");
  }

  private void doCollectionEntriesTestWithFiltering(final String sortBy) {
    final List<CollectionEntry> result =
        service.loadCollectionEntries(
            TEST_TAG_TYPE,
            TEST_FILTER_TEXT,
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            sortBy,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    if (StringUtils.hasLength(sortBy)) {
      assertFalse(pageable.getSort().stream().toList().isEmpty());
    }

    verify(comicRepository)
        .loadCollectionEntriesWithFiltering(TEST_TAG_TYPE, "%" + TEST_FILTER_TEXT + "%", pageable);
  }

  @Test
  void loadCollectionEntries_comicCountSort_withFiltering() {
    collectionEntryList.add(collectionEntry);

    when(comicRepository.loadCollectionEntriesWithFiltering(
            any(ComicTagType.class), anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTestWithFiltering("comic-count");
  }

  @Test
  void loadCollectionTotalEntries() {
    when(comicRepository.getFilterCount(any(ComicTagType.class)))
        .thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.loadCollectionTotalEntries(TEST_TAG_TYPE, "");

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).getFilterCount(TEST_TAG_TYPE);
  }

  @Test
  void loadCollectionTotalEntries_withFiltering() {
    when(comicRepository.getFilterCountWithFiltering(any(ComicTagType.class), anyString()))
        .thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.loadCollectionTotalEntries(TEST_TAG_TYPE, TEST_FILTER_TEXT);

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository)
        .getFilterCountWithFiltering(TEST_TAG_TYPE, "%" + TEST_FILTER_TEXT + "%");
  }

  @Test
  void getAllIds() {
    comicList.add(comicBook);
    when(comicRepository.getAllIds()).thenReturn(idList);

    final List<Long> result = service.getAllIds();

    assertNotNull(result);
    assertSame(idList, result);

    verify(comicRepository).getAllIds();
  }

  @Test
  void prepareForMetadataUpdate() {
    service.prepareForMetadataUpdate(idList);

    verify(comicRepository).prepareForMetadataUpdate(idList);
  }

  @Test
  void getBatchScrapingCount() {
    when(comicRepository.getBatchScrapingCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getBatchScrapingCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).getBatchScrapingCount();
  }

  @Test
  void findBatchScrapingComics() {
    when(comicRepository.findBatchScrapingComics(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findBatchScrapingComics(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findBatchScrapingComics(pageable);
  }

  @Test
  void findComicsWithCreateMetadataFlagSet() {
    when(comicRepository.findUnprocessedComicsWithCreateMetadataFlagSet(
            pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicsWithCreateMetadataFlagSet(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findUnprocessedComicsWithCreateMetadataFlagSet(pageable);
  }

  @Test
  void findComicsWithMetadataToUpdate() {
    when(comicRepository.findComicsWithMetadataToUpdate(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicsWithMetadataToUpdate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findComicsWithMetadataToUpdate(pageable);
  }

  @Test
  void findComicsWithUnhashedPages() {
    when(comicRepository.findComicsWithUnhashedPages(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicsWithUnhashedPages(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findComicsWithUnhashedPages(pageable);
  }

  @Test
  void getSeriesCountForPublisher() {
    when(comicRepository.getSeriesCountForPublisher(anyString()))
        .thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getSeriesCountForPublisher(TEST_PUBLISHER);

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).getSeriesCountForPublisher(TEST_PUBLISHER);
  }

  @Test
  void getComicsToBeRecreated() {
    when(comicRepository.getComicsToBeRecreated(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.getComicsToBeRecreated(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).getComicsToBeRecreated(pageable);
  }

  @Test
  void findComicsForBatchMetadataUpdate() {
    when(comicRepository.findComicsForBatchMetadataUpdate(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicsForBatchMetadataUpdate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findComicsForBatchMetadataUpdate(pageable);
  }

  @Test
  void findComicsWithContentToLoad() {
    when(comicRepository.findComicsWithContentToLoad(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicsWithContentToLoad(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findComicsWithContentToLoad(pageable);
  }

  @Test
  void findComicsWithEditDetails() {
    when(comicRepository.findComicsWithEditDetails(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicsWithEditDetails(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findComicsWithEditDetails(pageable);
  }

  @Test
  void findComicsMarkedForPurging() {
    when(comicRepository.findComicsMarkedForPurging(pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicBooksToBePurged(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicRepository).findComicsMarkedForPurging(pageable);
  }

  @Test
  void getAllPublishersForStory() {
    when(comicRepository.findDistinctPublishersForStory(anyString())).thenReturn(publisherSet);

    final Set<String> result = service.getAllPublishersForStory(TEST_STORY_NAME);

    assertNotNull(result);
    assertSame(publisherSet, result);

    verify(comicRepository).findDistinctPublishersForStory(TEST_STORY_NAME);
  }

  @Test
  void getPublishersState() {
    when(comicRepository.getPublishersState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getPublishersState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getPublishersState();
  }

  @Test
  void getSeriesState() {
    when(comicRepository.getSeriesState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getSeriesState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getSeriesState();
  }

  @Test
  void getCharactersState() {
    when(comicRepository.getCharactersState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getCharactersState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getCharactersState();
  }

  @Test
  void getTeamsState() {
    when(comicRepository.getTeamsState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getTeamsState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getTeamsState();
  }

  @Test
  void getLocationsState() {
    when(comicRepository.getLocationsState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getLocationsState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getLocationsState();
  }

  @Test
  void getStoriesState() {
    when(comicRepository.getStoriesState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getStoriesState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getStoriesState();
  }

  @Test
  void getComicBooksState() {
    when(comicRepository.getComicBooksState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getComicBooksState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getComicBooksState();
  }

  @Test
  void getComicBookArchiveTypes() {
    when(comicRepository.getComicBookArchiveTypes()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getComicBookArchiveTypes();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicRepository).getComicBookArchiveTypes();
  }

  @Test
  void getByPublisherAndYear() {
    when(comicRepository.getByPublisherAndYear()).thenReturn(byPublisherAndYearList);

    final List<PublisherAndYearSegment> result = service.getByPublisherAndYear();

    assertNotNull(result);
    assertSame(byPublisherAndYearList, result);

    verify(comicRepository).getByPublisherAndYear();
  }

  @Test
  void getDeletedComicBookCount() {
    when(comicRepository.findForStateCount(any())).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getDeletedComicCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).findForStateCount(ComicState.DELETED);
  }

  @Test
  void getForPublisherAndSeriesAndVolumeAndIssueNumberNotFound() {
    when(comicRepository.getForPublisherAndSeriesAndVolumeAndIssueNumber(
            anyString(), anyString(), anyString(), anyString()))
        .thenReturn(Collections.emptyList());

    final List<Comic> result =
        service.getForPublisherAndSeriesAndVolumeAndIssueNumber(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(comicRepository)
        .getForPublisherAndSeriesAndVolumeAndIssueNumber(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  void getForPublisherAndSeriesAndVolumeAndIssueNumber() {
    comicList.add(comic);

    when(comicRepository.getForPublisherAndSeriesAndVolumeAndIssueNumber(
            anyString(), anyString(), anyString(), anyString()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getForPublisherAndSeriesAndVolumeAndIssueNumber(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(comicRepository)
        .getForPublisherAndSeriesAndVolumeAndIssueNumber(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  void getComicsWithoutContentCount() {
    when(comicRepository.findUnprocessedComicsWithoutContentCount())
        .thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getComicsWithoutContentCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    verify(comicRepository).findUnprocessedComicsWithoutContentCount();
  }

  @Test
  void getComicBookCount() {
    when(comicRepository.count()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getComicCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).count();
  }

  @Test
  void findComicsForBatchMetadataUpdateCount() {
    when(comicRepository.findComicsForBatchMetadataUpdateCount())
        .thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.findComicsForBatchMetadataUpdateCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).findComicsForBatchMetadataUpdateCount();
  }

  @Test
  void markComicBooksForBatchScraping() {
    service.markComicBooksForBatchScraping(idList);

    verify(comicRepository).prepareForBatchScraping(idList);
  }

  @Test
  void prepareForRecreation() {
    service.prepareForRecreation(idList, targetArchiveType);

    verify(comicRepository).markForRecreationById(idList, targetArchiveType);
  }

  @Test
  void getRecreatingCount() {
    when(comicRepository.getRecreatingCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getRecreatingCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).getRecreatingCount();
  }

  @Test
  void findComicsToPurgeCount() {
    when(comicRepository.findComicsToPurgeCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.findComicsToPurgeCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).findComicsToPurgeCount();
  }

  @Test
  void updateMultipleComics_invalidId() {
    idList.add(TEST_COMIC_ID);

    when(comicRepository.findByComicBookId(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicException.class, () -> service.updateMultipleComics(idList));
  }

  @Test
  void updateMultipleComics() throws ComicException {
    idList.add(TEST_COMIC_ID);

    when(comicRepository.findByComicBookId(Mockito.anyLong())).thenReturn(comic);

    service.updateMultipleComics(idList);

    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.prepareComicsForBatchEditing);
  }

  @Test
  void markComicAsFound_caseInsensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicRepository.findByFilenameCaseInsensitive(Mockito.anyString())).thenReturn(null);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsFound_caseInsensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicRepository.findByFilenameCaseInsensitive(Mockito.anyString())).thenReturn(comic);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicFileFound);
  }

  @Test
  void markComicAsFound_caseSensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsFound_caseSensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(comic);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicFileFound);
  }

  @Test
  void markComicAsMissing_caseInsensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicRepository.findByFilenameCaseInsensitive(Mockito.anyString())).thenReturn(null);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsMissing_caseInsensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicRepository.findByFilenameCaseInsensitive(Mockito.anyString())).thenReturn(comic);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor, never()).fireEvent(comic, ComicEvent.comicFileDiscovered);
  }

  @Test
  void markComicAsMissing_caseSensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsMissing_caseSensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(comic);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicStateAdaptor, never()).fireEvent(comic, ComicEvent.comicFileDiscovered);
  }

  @Test
  void markComicsForBatchMetadataUpdate_invalidId() {
    idList.add(TEST_COMIC_ID);

    when(comicRepository.getReferenceById(anyLong())).thenReturn(null);

    assertThrows(ComicException.class, () -> service.markComicBooksForBatchMetadataUpdate(idList));
  }

  @Test
  void markComicsForBatchMetadataUpdate() throws ComicException {
    idList.add(TEST_COMIC_ID);

    when(comicRepository.getReferenceById(anyLong())).thenReturn(comic);

    service.markComicBooksForBatchMetadataUpdate(idList);

    verify(comicRepository).getReferenceById(TEST_COMIC_ID);
    verify(comic).setBatchUpdatingMetadata(true);
    verify(comicRepository).save(comic);
    verify(applicationEventPublisher).publishEvent(UpdateMetadataEvent.instance);
  }

  @Test
  void prepareForOrganization() {
    service.prepareForOrganization(idList);

    verify(comicRepository).markForOrganizationById(idList);
    verify(applicationEventPublisher).publishEvent(OrganizingLibraryEvent.instance);
  }

  @Test
  void prepareAllForOrganization() {
    service.prepareAllForOrganization();

    verify(comicRepository).markAllForOrganization();
    verify(applicationEventPublisher).publishEvent(OrganizingLibraryEvent.instance);
  }

  @Test
  void findAllComicsMarkedForDeletion() {
    service.prepareComicBooksForDeleting();

    verify(comicRepository).prepareComicBooksForDeleting();
  }

  @Test
  void getPublisherDetail_unsorted() {
    when(comicRepository.getAllSeriesAndVolumesForPublisher(
            anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(TEST_PUBLISHER, TEST_PAGE_INDEX, TEST_PAGE_SIZE, null, null);

    assertNotNull(result);
    assertSame(seriesDetail, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertFalse(pageable.getSort().isSorted());

    verify(comicRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_ascendingNameSort() {
    when(comicRepository.getAllSeriesAndVolumesForPublisher(
            anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_INDEX, TEST_PAGE_SIZE, "series-name", "desc");

    assertNotNull(result);
    assertSame(seriesDetail, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    verify(comicRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_descendingNameSort() {
    when(comicRepository.getAllSeriesAndVolumesForPublisher(
            anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_INDEX, TEST_PAGE_SIZE, "series-name", "desc");

    assertNotNull(result);
    assertSame(seriesDetail, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    verify(comicRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_ascendingVolumeSort() {
    when(comicRepository.getAllSeriesAndVolumesForPublisher(
            anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_INDEX, TEST_PAGE_SIZE, "series-volume", "desc");

    assertNotNull(result);
    assertSame(seriesDetail, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    verify(comicRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_descendingVolumeSort() {
    when(comicRepository.getAllSeriesAndVolumesForPublisher(
            anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_INDEX, TEST_PAGE_SIZE, "series-volume", "desc");

    assertNotNull(result);
    assertSame(seriesDetail, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    verify(comicRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getUnprocessedComicBookCount() {
    when(comicRepository.getUnprocessedComicBookCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getUnprocessedComicBookCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).getUnprocessedComicBookCount();
  }

  @Test
  void getUpdateMetatdataCount() {
    when(comicRepository.getUpdateMetadataCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getUpdateMetadataCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).getUpdateMetadataCount();
  }

  @Test
  void getAllComicDetails_missingFiles() {
    when(comicRepository.getAllComicDetailsByMissingFlag(true)).thenReturn(comicFilenameList);

    final Set<String> result = service.getAllComicDetailsByMissingFlag(true);

    assertNotNull(result);
    assertSame(comicFilenameList, result);

    verify(comicRepository).getAllComicDetailsByMissingFlag(true);
  }

  @Test
  void getAllComicDetails_notMissingFiles() {
    when(comicRepository.getAllComicDetailsByMissingFlag(false)).thenReturn(comicFilenameList);

    final Set<String> result = service.getAllComicDetailsByMissingFlag(false);

    assertNotNull(result);
    assertSame(comicFilenameList, result);

    verify(comicRepository).getAllComicDetailsByMissingFlag(false);
  }

  @Test
  void findComicsWithUnhashedPagesCount() {
    when(comicRepository.findComicsWithUnhashedPagesCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.findComicsWithUnhashedPagesCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicRepository).findComicsWithUnhashedPagesCount();
  }
}
