/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * aLong with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.metadata;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;
import static junit.framework.TestCase.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.MetadataAdaptorRegistry;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.metadata.model.*;
import org.comixedproject.model.batch.ScrapeMetadataEvent;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.collections.ScrapedStory;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.net.metadata.ScrapeSeriesResponse;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.collections.IssueService;
import org.comixedproject.service.collections.ScrapedStoryService;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.service.metadata.action.ProcessComicDescriptionAction;
import org.comixedproject.state.comicbooks.ComicBookStateAdaptor;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MetadataServiceTest {
  private static final Long TEST_METADATA_SOURCE_ID = 73L;
  private static final String TEST_ISSUE_PUBLISHER = "The issue publisher";
  private static final String TEST_ISSUE_SERIES_NAME = "The issue series name";
  private static final String TEST_ISSUE_VOLUME = "The series volume";
  private static final String TEST_PUBLISHER = "Publisher Name";
  private static final String TEST_SERIES_NAME = "SeriesDetail Name";
  private static final String TEST_VOLUME = "2020";
  private static final Integer TEST_MAX_RECORDS = 1000;
  private static final String TEST_ENCODED_VALUE = "JSON object as string";
  private static final String TEST_CACHE_SOURCE = "ScrapingSource";
  private static final String TEST_VOLUME_KEY = "VolumeKey";
  private static final String TEST_VOLUME_ID = "717";
  private static final String TEST_ISSUE_NUMBER = "23.1";
  private static final String TEST_ISSUE_KEY = "IssueKey";
  private static final Long TEST_COMIC_ID = 127L;
  private static final String TEST_ISSUE_ID = "239";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE = new Date();
  private static final String TEST_TITLE = "The Title";
  private static final String TEST_DESCRIPTION = "This is the comic's description";
  private static final String TEST_ISSUE_DETAILS_KEY = "IssueDetailsKey";
  private static final String TEST_METADATA_SOURCE_NAME = "Farkle";
  private static final String TEST_SOURCE_ID = "93782";
  private static final String TEST_WEB_ADDRESS = "http://some.metadatasource.com/reference/12345";
  private static final String TEST_STORY_NAME = "The Story To Scrape";
  private static final String TEST_REFERENCE_ID = "8675309";
  private static final String TEST_STORY_KEY = "StoryKey";

  @InjectMocks private MetadataService service;
  @Mock private ConfigurationService configurationService;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private MetadataAdaptorRegistry metadataAdaptorRegistry;
  @Mock private MetadataCacheService metadataCacheService;
  @Mock private IssueService issueService;
  @Mock private ScrapedStoryService scrapedStoryService;
  @Mock private MetadataAdaptor metadataAdaptor;
  @Mock private ProcessComicDescriptionAction processComicDescriptionAction;
  @Mock private ObjectMapper objectMapper;
  @Mock private VolumeMetadata volumeMetadata;
  @Mock private IssueMetadata issueMetadata;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ComicBookStateAdaptor comicBookStateAdaptor;
  @Mock private ComicBook loadedComicBook;
  @Mock private ComicDetail loadedComicDetail;
  @Mock private ComicBook savedComicBook;
  @Mock private IssueDetailsMetadata issueDetailsMetadata;
  @Mock private ImprintService imprintService;
  @Mock private MetadataSource metadataSource;
  @Mock private List<Issue> issueList;
  @Mock private ComicMetadataSource comicMetadataSource;
  @Mock private MetadataAdaptorProvider metadataAdaptorProvider;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;
  @Mock private List<Long> comicBookIdList;
  @Mock private ApplicationEventPublisher applicationEventPublisher;
  @Mock private StoryMetadata storyMetadata;
  @Mock private ScrapedStory scrapedStory;
  @Mock private ScrapedStory scrapedStoryFromDatabase;
  @Mock private StoryDetailMetadata storyDetailMetadata;
  @Mock private ScrapedStory savedScrapedStory;
  @Mock private ScrapedStory updatedScrapedStory;

  @Captor private ArgumentCaptor<List<String>> cacheEntryList;
  @Captor private ArgumentCaptor<List<Issue>> issueListArgumentCaptor;
  @Captor private ArgumentCaptor<ComicMetadataSource> comicMetadataSourceArgumentCaptor;
  @Captor private ArgumentCaptor<ScrapedStory> scrapedStoryArgumentCaptor;

  private List<String> cachedEntryList = new ArrayList<>();
  private List<VolumeMetadata> fetchedVolumeList = new ArrayList<>();
  private List<IssueDetailsMetadata> issueDetailsMetadataList = new ArrayList<>();
  private List<IssueDetailsMetadata.CreditEntry> creditList = new ArrayList<>();
  private List<String> characterList = new ArrayList<>();
  private List<String> teamList = new ArrayList<>();
  private List<String> locationList = new ArrayList<>();
  private List<String> storyList = new ArrayList<>();
  private List<MetadataAdaptorProvider> metadataAdaptorProviderList = new ArrayList<>();
  private List<ComicBook> comicBookList = new ArrayList<>();
  private List<StoryMetadata> storyMetadataList = new ArrayList<>();

  @BeforeEach
  void setUp() throws MetadataSourceException, MetadataException {
    when(configurationService.isFeatureEnabled(anyString())).thenReturn(true);
    when(loadedComicBook.getComicDetail()).thenReturn(loadedComicDetail);

    when(metadataAdaptor.getSource()).thenReturn(TEST_CACHE_SOURCE);
    when(metadataAdaptor.getVolumeKey(anyString())).thenReturn(TEST_VOLUME_KEY);
    when(metadataAdaptor.getIssueKey(anyString(), anyString())).thenReturn(TEST_ISSUE_KEY);
    when(metadataAdaptor.getIssueDetailsKey(anyString())).thenReturn(TEST_ISSUE_DETAILS_KEY);
    when(metadataAdaptorRegistry.getAdaptor(anyString())).thenReturn(metadataAdaptor);

    when(issueDetailsMetadata.getPublisher()).thenReturn(addPadding(TEST_ISSUE_PUBLISHER));
    when(issueDetailsMetadata.getSeries()).thenReturn(addPadding(TEST_ISSUE_SERIES_NAME));
    when(issueDetailsMetadata.getVolume()).thenReturn(addPadding(TEST_ISSUE_VOLUME));
    when(issueDetailsMetadata.getIssueNumber()).thenReturn(addPadding(TEST_ISSUE_NUMBER));
    when(issueDetailsMetadata.getCoverDate()).thenReturn(TEST_COVER_DATE);
    when(issueDetailsMetadata.getStoreDate()).thenReturn(TEST_STORE_DATE);
    when(issueDetailsMetadata.getTitle()).thenReturn(addPadding(TEST_TITLE));
    when(issueDetailsMetadata.getDescription()).thenReturn(addPadding(TEST_DESCRIPTION));
    when(issueDetailsMetadata.getWebAddress()).thenReturn(TEST_WEB_ADDRESS);
    when(issueDetailsMetadata.getSourceId()).thenReturn(addPadding(TEST_SOURCE_ID));
    for (int index = 0; index < 5; index++) {
      characterList.add(addPadding("CHARACTER" + index));
      teamList.add(addPadding("TEST" + index));
      locationList.add(addPadding("LOCATION" + index));
      storyList.add(addPadding("STORY" + index));
      creditList.add(
          new IssueDetailsMetadata.CreditEntry(
              ComicTagType.values()[RandomUtils.nextInt(ComicTagType.values().length)].getValue(),
              addPadding("Person Name " + index)));
    }
    when(issueDetailsMetadata.getCharacters()).thenReturn(characterList);
    when(issueDetailsMetadata.getTeams()).thenReturn(teamList);
    when(issueDetailsMetadata.getLocations()).thenReturn(locationList);
    when(issueDetailsMetadata.getStories()).thenReturn(storyList);
    when(issueDetailsMetadata.getCredits()).thenReturn(creditList);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataSource.getAdaptorName()).thenReturn(TEST_METADATA_SOURCE_NAME);

    metadataAdaptorProviderList.add(metadataAdaptorProvider);

    doNothing().when(comicBook).setMetadata(comicMetadataSourceArgumentCaptor.capture());
    when(comicBook.getMetadata()).thenReturn(comicMetadataSource);
    when(comicBook.getComicDetail()).thenReturn(comicDetail);

    when(processComicDescriptionAction.execute(anyString()))
        .thenAnswer(input -> input.getArguments()[0]);

    when(storyMetadata.getName()).thenReturn(TEST_STORY_NAME);
    storyMetadataList.add(storyMetadata);
    when(metadataAdaptor.getStory(anyString(), any(MetadataSource.class)))
        .thenReturn(storyDetailMetadata);
    when(metadataAdaptor.getStories(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(storyMetadataList);
    when(scrapedStoryService.getForName(anyString())).thenReturn(scrapedStory);
    when(metadataAdaptor.getStoryDetailKey(anyString())).thenReturn(TEST_STORY_KEY);

    when(scrapedStoryService.getForName(anyString())).thenReturn(scrapedStoryFromDatabase);

    when(comicBook.getMetadata()).thenReturn(comicMetadataSource);
    when(savedComicBook.getMetadata()).thenReturn(comicMetadataSource);
    when(loadedComicBook.getMetadata()).thenReturn(comicMetadataSource);
  }

  private String addPadding(final String value) {
    return String.format(" %s ", value);
  }

  @Test
  void getVolumes_invalidSourceId() throws MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataException.class,
        () ->
            service.getVolumes(
                TEST_METADATA_SOURCE_ID,
                TEST_PUBLISHER,
                TEST_SERIES_NAME,
                TEST_MAX_RECORDS,
                true,
                true));
  }

  @Test
  void getVolumes_skipCacheNoResults() throws MetadataException, MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getVolumes(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            true,
            true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataAdaptor).getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());
  }

  @Test
  void getVolumes_skipCache() throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getVolumes(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    when(objectMapper.writeValueAsString(any(VolumeMetadata.class))).thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            true,
            false);

    assertNotNull(result);
    assertEquals(fetchedVolumeList, result);
    assertNotNull(cacheEntryList.getValue());

    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataAdaptor).getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(objectMapper, times(fetchedVolumeList.size())).writeValueAsString(volumeMetadata);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_skipCache_matchPublisher_noneFound()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getVolumes(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    when(objectMapper.writeValueAsString(any(VolumeMetadata.class))).thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());
    when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER.substring(1));

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            true,
            true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataAdaptor).getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(objectMapper, times(fetchedVolumeList.size())).writeValueAsString(volumeMetadata);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_skipCache_matchPublisher()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getVolumes(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    when(objectMapper.writeValueAsString(any(VolumeMetadata.class))).thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());
    when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER);

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            true,
            true);

    assertNotNull(result);
    assertEquals(fetchedVolumeList, result);
    assertNotNull(cacheEntryList.getValue());

    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataAdaptor).getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(objectMapper, times(fetchedVolumeList.size())).writeValueAsString(volumeMetadata);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_skipCacheJsonError()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getVolumes(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    when(objectMapper.writeValueAsString(any(VolumeMetadata.class)))
        .thenThrow(JacksonException.class);

    assertThrows(
        MetadataException.class,
        () ->
            service.getVolumes(
                TEST_METADATA_SOURCE_ID,
                TEST_PUBLISHER,
                TEST_SERIES_NAME,
                TEST_MAX_RECORDS,
                true,
                true));
  }

  @Test
  void getVolumes_nothingCached()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(metadataAdaptor.getVolumes(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    when(objectMapper.writeValueAsString(any(VolumeMetadata.class))).thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            false,
            false);

    assertNotNull(result);
    assertEquals(fetchedVolumeList, result);
    assertNotNull(cacheEntryList.getValue());
    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataAdaptor).getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    verify(objectMapper, times(fetchedVolumeList.size())).writeValueAsString(volumeMetadata);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_cachedDataJsonException()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenThrow(JacksonException.class);

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            false,
            true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    verify(objectMapper).readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    verify(metadataAdaptor).getVolumes(anyString(), anyInt(), any(MetadataSource.class));
    verify(objectMapper, never()).writeValueAsString(volumeMetadata);
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());
  }

  @Test
  void getVolumes_loadedCachedData()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenReturn(volumeMetadata);

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            false,
            false);

    assertNotNull(result);
    assertEquals(cachedEntryList.size(), result.size());
    for (int index = 0; index < result.size(); index++) {
      assertSame(volumeMetadata, result.get(index));
    }

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    verify(objectMapper, times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    verify(metadataAdaptor, never()).getVolumes(anyString(), anyInt(), any(MetadataSource.class));
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());
    verify(objectMapper, never()).writeValueAsString(volumeMetadata);
  }

  @Test
  void getVolumes_loadedCachedData_matchPublisher_noneFound()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenReturn(volumeMetadata);
    when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER.substring(1));

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            false,
            true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    verify(objectMapper, times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    verify(metadataAdaptor, never()).getVolumes(anyString(), anyInt(), any(MetadataSource.class));
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());
    verify(objectMapper, never()).writeValueAsString(volumeMetadata);
  }

  @Test
  void getVolumes_loadedCachedData_matchPublisher()
      throws MetadataException, JacksonException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenReturn(volumeMetadata);
    when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER);

    final List<VolumeMetadata> result =
        service.getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            false,
            true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(cachedEntryList.size(), result.size());

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    verify(objectMapper, times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    verify(metadataAdaptor, never()).getVolumes(anyString(), anyInt(), any(MetadataSource.class));
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());
    verify(objectMapper, never()).writeValueAsString(volumeMetadata);
  }

  @Test
  void getIssue_invalidMetadataSourceId() throws MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataException.class,
        () -> service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true));
  }

  @Test
  void getIssue_skipCacheNoResults() throws MetadataException, MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getIssueKey(anyString(), anyString())).thenReturn(TEST_ISSUE_KEY);
    when(metadataAdaptor.getIssue(anyString(), anyString(), any(MetadataSource.class)))
        .thenReturn(null);

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNull(result);

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataAdaptor).getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());
  }

  @Test
  void getIssue_skipCache() throws MetadataException, JacksonException, MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getIssue(anyString(), anyString(), any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    when(objectMapper.writeValueAsString(any(IssueMetadata.class))).thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNotNull(result);
    assertSame(issueMetadata, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataAdaptor).getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    verify(objectMapper).writeValueAsString(issueMetadata);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
  }

  @Test
  void getIssue_jsonEncoding() throws MetadataException, JacksonException, MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataAdaptor.getIssue(anyString(), anyString(), any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    when(objectMapper.writeValueAsString(any(IssueMetadata.class)))
        .thenThrow(JacksonException.class);

    assertThrows(
        MetadataException.class,
        () -> service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true));
  }

  @Test
  void getIssue_nothingCached()
      throws MetadataException, JacksonException, MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(null);
    when(metadataAdaptor.getIssue(anyString(), anyString(), any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    when(objectMapper.writeValueAsString(any(IssueMetadata.class))).thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataCacheService).getFromCache(anyString(), anyString());
    verify(metadataAdaptor).getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    verify(objectMapper).writeValueAsString(issueMetadata);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  void getIssue_cachedDataJsonException()
      throws MetadataException, JacksonException, MetadataSourceException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenThrow(JacksonException.class);
    when(metadataAdaptor.getIssue(anyString(), anyString(), any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    when(objectMapper.writeValueAsString(any(IssueMetadata.class))).thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataCacheService).getFromCache(anyString(), anyString());
    verify(objectMapper).readValue(TEST_ENCODED_VALUE, IssueMetadata.class);
    verify(objectMapper).writeValueAsString(issueMetadata);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  void getIssue_cachedData() throws MetadataException, JacksonException, MetadataSourceException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    when(metadataSourceService.getById(anyLong())).thenReturn(metadataSource);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenReturn(issueMetadata);

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    verify(metadataSourceService).getById(TEST_METADATA_SOURCE_ID);
    verify(metadataCacheService).getFromCache(anyString(), anyString());
    verify(objectMapper).readValue(TEST_ENCODED_VALUE, IssueMetadata.class);
    verify(objectMapper, never()).writeValueAsString(any());
    verify(metadataAdaptor, never()).getIssue(anyString(), anyString(), any(MetadataSource.class));
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());
  }

  @Test
  void scrapeComic_noSuchComic() throws ComicBookException {
    when(comicBookService.getComic(anyLong())).thenThrow(ComicBookException.class);

    assertThrows(
        MetadataException.class,
        () -> service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true));
  }

  @Test
  void scrapeComic_skipCacheNoResult() throws MetadataException, ComicBookException {
    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataAdaptor.getIssueDetails(anyString(), any(MetadataSource.class))).thenReturn(null);

    service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    verify(comicBookService, times(2)).getComic(TEST_COMIC_ID);
    verify(metadataAdaptor).getIssueDetails(TEST_ISSUE_ID, metadataSource);
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());

    verifyComicScrapingNotDone();
  }

  @Test
  void scrapeComic_skipCache() throws MetadataException, ComicBookException, JacksonException {
    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataAdaptor.getIssueDetails(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    when(objectMapper.writeValueAsString(any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(result);
    assertSame(savedComicBook, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    verify(comicBookService, times(2)).getComic(TEST_COMIC_ID);
    verify(metadataAdaptor).getIssueDetails(TEST_ISSUE_ID, metadataSource);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(comicBookStateAdaptor).fireEvent(loadedComicBook, ComicEvent.comicMetadataChanged);

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void asyncScrapeComic() throws MetadataException, ComicBookException, JacksonException {
    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataAdaptor.getIssueDetails(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    when(objectMapper.writeValueAsString(any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    service.asyncScrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    verify(metadataAdaptor).getIssueDetails(TEST_ISSUE_ID, metadataSource);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(comicBookStateAdaptor).fireEvent(loadedComicBook, ComicEvent.comicMetadataChanged);

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_withPreviousMetadataSource()
      throws MetadataException, ComicBookException, JacksonException {
    when(loadedComicBook.getMetadata()).thenReturn(comicMetadataSource);
    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataAdaptor.getIssueDetails(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    when(objectMapper.writeValueAsString(any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(result);
    assertSame(savedComicBook, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    verify(comicBookService, times(2)).getComic(TEST_COMIC_ID);
    verify(metadataAdaptor).getIssueDetails(TEST_ISSUE_ID, metadataSource);
    verify(metadataCacheService)
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    verify(metadataCacheService, never()).getFromCache(anyString(), anyString());
    verify(comicBookStateAdaptor).fireEvent(loadedComicBook, ComicEvent.comicMetadataChanged);
    verify(comicMetadataSource).setMetadataSource(metadataSource);
    verify(comicMetadataSource).setReferenceId(TEST_SOURCE_ID);

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_nothingCached() throws ComicBookException, MetadataException, JacksonException {
    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(metadataAdaptor.getIssueDetails(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    when(objectMapper.writeValueAsString(any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    doNothing()
        .when(metadataCacheService)
        .saveToCache(anyString(), anyString(), cacheEntryList.capture());

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    verify(comicBookService, times(2)).getComic(TEST_COMIC_ID);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    verify(metadataAdaptor).getIssueDetails(TEST_ISSUE_ID, metadataSource);
    verify(comicBookStateAdaptor).fireEvent(loadedComicBook, ComicEvent.comicMetadataChanged);
    verify(metadataCacheService).saveToCache(anyString(), anyString(), anyList());

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_cachingError() throws ComicBookException, MetadataException, JacksonException {
    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(metadataAdaptor.getIssueDetails(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    when(objectMapper.writeValueAsString(any(IssueDetailsMetadata.class)))
        .thenThrow(JacksonException.class);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    verify(comicBookService, times(2)).getComic(TEST_COMIC_ID);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    verify(metadataAdaptor).getIssueDetails(TEST_ISSUE_ID, metadataSource);
    verify(comicBookStateAdaptor).fireEvent(loadedComicBook, ComicEvent.comicMetadataChanged);
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_cachedDate() throws ComicBookException, JacksonException, MetadataException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenReturn(issueDetailsMetadata);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    verify(comicBookService, times(2)).getComic(TEST_COMIC_ID);
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    verify(metadataAdaptor, never()).getIssueDetails(anyString(), any(MetadataSource.class));
    verify(comicBookStateAdaptor).fireEvent(loadedComicBook, ComicEvent.comicMetadataChanged);
    verify(metadataCacheService, never()).saveToCache(anyString(), anyString(), anyList());

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_noCoverDate() throws ComicBookException, JacksonException, MetadataException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenReturn(issueDetailsMetadata);
    when(issueDetailsMetadata.getCoverDate()).thenReturn(null);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    verify(loadedComicDetail, never()).setCoverDate(any(Date.class));
  }

  @Test
  void scrapeComic_noStoreDate() throws ComicBookException, JacksonException, MetadataException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    when(comicBookService.getComic(anyLong())).thenReturn(loadedComicBook, savedComicBook);
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(cachedEntryList);
    when(objectMapper.readValue(anyString(), any(Class.class))).thenReturn(issueDetailsMetadata);
    when(issueDetailsMetadata.getStoreDate()).thenReturn(null);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    verify(loadedComicDetail, never()).setStoreDate(any(Date.class));
  }

  private void verifyComicScrapingNotDone() {
    verify(loadedComicDetail, never()).setPublisher(anyString());
    verify(loadedComicDetail, never()).setSeries(anyString());
    verify(loadedComicDetail, never()).setVolume(anyString());
    verify(loadedComicDetail, never()).setCoverDate(any(Date.class));
    verify(loadedComicDetail, never()).setStoreDate(any(Date.class));
    verify(loadedComicDetail, never()).setDescription(anyString());
  }

  private void verifyComicScraping(final ComicBook comicBook) {
    verify(loadedComicDetail).setPublisher(TEST_ISSUE_PUBLISHER);
    verify(loadedComicDetail).setImprint(TEST_ISSUE_PUBLISHER);
    verify(loadedComicDetail).setSeries(TEST_ISSUE_SERIES_NAME);
    verify(loadedComicDetail).setVolume(TEST_ISSUE_VOLUME);
    verify(loadedComicDetail).setCoverDate(service.adjustForTimezone(TEST_COVER_DATE));
    verify(loadedComicDetail).setStoreDate(service.adjustForTimezone(TEST_STORE_DATE));
    verify(loadedComicDetail).setTitle(TEST_TITLE);
    verify(loadedComicDetail).setDescription(TEST_DESCRIPTION);
    verify(loadedComicDetail).setWebAddress(TEST_WEB_ADDRESS);
    verify(imprintService).update(comicBook);
    verify(comicMetadataSource).setLastScrapedDate(any());
  }

  @Test
  void scrapeSeries_invalidSourceId() throws MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataException.class,
        () ->
            service.scrapeSeries(
                TEST_PUBLISHER,
                TEST_SERIES_NAME,
                TEST_VOLUME,
                TEST_METADATA_SOURCE_ID,
                TEST_VOLUME_ID));
  }

  @Test
  void scrapeSeries_adaptorException() throws MetadataException {
    when(metadataAdaptor.getAllIssues(anyString(), any(MetadataSource.class)))
        .thenThrow(MetadataException.class);

    assertThrows(
        MetadataException.class,
        () ->
            service.scrapeSeries(
                TEST_PUBLISHER,
                TEST_SERIES_NAME,
                TEST_VOLUME,
                TEST_METADATA_SOURCE_ID,
                TEST_VOLUME_ID));
  }

  @Test
  void scrapeSeries_noneFound() throws MetadataException {
    when(metadataAdaptor.getAllIssues(anyString(), any(MetadataSource.class)))
        .thenReturn(new ArrayList<>());

    final ScrapeSeriesResponse result =
        service.scrapeSeries(
            TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);

    assertNotNull(result);
    assertEquals(TEST_PUBLISHER, result.getPublisher());
    assertEquals(TEST_SERIES_NAME, result.getSeries());
    assertEquals(TEST_VOLUME, result.getVolume());

    verify(metadataAdaptor).getAllIssues(TEST_VOLUME_ID, metadataSource);
    verify(issueService, never()).saveAll(anyList());
  }

  @Test
  void scrapeSeries_issueNotFound() throws MetadataException {
    issueDetailsMetadataList.add(issueDetailsMetadata);

    when(metadataAdaptor.getAllIssues(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadataList);
    when(issueService.saveAll(issueListArgumentCaptor.capture())).thenReturn(issueList);
    when(comicBookService.findComic(anyString(), anyString(), anyString(), anyString()))
        .thenReturn(Collections.emptyList());

    final ScrapeSeriesResponse result =
        service.scrapeSeries(
            TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);

    assertNotNull(result);
    assertEquals(TEST_ISSUE_PUBLISHER, result.getPublisher());
    assertEquals(TEST_ISSUE_SERIES_NAME, result.getSeries());
    assertEquals(TEST_ISSUE_VOLUME, result.getVolume());

    final List<Issue> issues = issueListArgumentCaptor.getValue();
    assertNotNull(issues);
    assertFalse(issues.isEmpty());
    assertEquals(TEST_ISSUE_PUBLISHER, issues.get(0).getPublisher());
    assertEquals(TEST_ISSUE_SERIES_NAME, issues.get(0).getSeries());
    assertEquals(TEST_ISSUE_VOLUME, issues.get(0).getVolume());
    assertEquals(TEST_COVER_DATE, issues.get(0).getCoverDate());

    verify(issueService).saveAll(issues);
    verify(comicBookService)
        .findComic(TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER);
    verify(comicBookStateAdaptor, never()).fireEvent(any(), any());
  }

  @Test
  void scrapeSeries_existingMetadataSource() throws MetadataException {
    comicBookList.add(comicBook);

    issueDetailsMetadataList.add(issueDetailsMetadata);

    when(metadataAdaptor.getAllIssues(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadataList);
    when(issueService.saveAll(issueListArgumentCaptor.capture())).thenReturn(issueList);
    when(comicBookService.findComic(anyString(), anyString(), anyString(), anyString()))
        .thenReturn(comicBookList);

    final ScrapeSeriesResponse result =
        service.scrapeSeries(
            TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);

    assertNotNull(result);
    assertEquals(TEST_ISSUE_PUBLISHER, result.getPublisher());
    assertEquals(TEST_ISSUE_SERIES_NAME, result.getSeries());
    assertEquals(TEST_ISSUE_VOLUME, result.getVolume());

    final List<Issue> issues = issueListArgumentCaptor.getValue();
    assertNotNull(issues);
    assertFalse(issues.isEmpty());
    assertEquals(TEST_ISSUE_PUBLISHER, issues.get(0).getPublisher());
    assertEquals(TEST_ISSUE_SERIES_NAME, issues.get(0).getSeries());
    assertEquals(TEST_ISSUE_VOLUME, issues.get(0).getVolume());
    assertEquals(TEST_COVER_DATE, issues.get(0).getCoverDate());

    verify(issueService).saveAll(issues);
    verify(comicBookService)
        .findComic(TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER);
    verify(comicDetail).setPublisher(TEST_ISSUE_PUBLISHER);
    verify(comicDetail).setSeries(TEST_ISSUE_SERIES_NAME);
    verify(comicDetail).setVolume(TEST_ISSUE_VOLUME);
    verify(comicMetadataSource).setMetadataSource(metadataSource);
    verify(comicMetadataSource).setReferenceId(TEST_SOURCE_ID);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicMetadataSaved);
  }

  @Test
  void scrapeSeries() throws MetadataException {
    comicBookList.add(comicBook);

    issueDetailsMetadataList.add(issueDetailsMetadata);

    when(metadataAdaptor.getAllIssues(anyString(), any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadataList);
    when(issueService.saveAll(issueListArgumentCaptor.capture())).thenReturn(issueList);
    when(comicBookService.findComic(anyString(), anyString(), anyString(), anyString()))
        .thenReturn(comicBookList);
    when(comicBook.getMetadata()).thenReturn(null);

    final ScrapeSeriesResponse result =
        service.scrapeSeries(
            TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);

    assertNotNull(result);
    assertEquals(TEST_ISSUE_PUBLISHER, result.getPublisher());
    assertEquals(TEST_ISSUE_SERIES_NAME, result.getSeries());
    assertEquals(TEST_ISSUE_VOLUME, result.getVolume());

    final List<Issue> issues = issueListArgumentCaptor.getValue();
    assertNotNull(issues);
    assertFalse(issues.isEmpty());
    assertEquals(TEST_ISSUE_PUBLISHER, issues.get(0).getPublisher());
    assertEquals(TEST_ISSUE_SERIES_NAME, issues.get(0).getSeries());
    assertEquals(TEST_ISSUE_VOLUME, issues.get(0).getVolume());
    assertEquals(TEST_COVER_DATE, issues.get(0).getCoverDate());

    final ComicMetadataSource metadata = comicMetadataSourceArgumentCaptor.getValue();
    assertNotNull(metadata);
    assertSame(comicBook, metadata.getComicBook());
    assertSame(metadataSource, metadata.getMetadataSource());
    assertEquals(TEST_SOURCE_ID, metadata.getReferenceId());

    verify(issueService).saveAll(issues);
    verify(comicBookService)
        .findComic(TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER);
    verify(comicDetail).setPublisher(TEST_ISSUE_PUBLISHER);
    verify(comicDetail).setSeries(TEST_ISSUE_SERIES_NAME);
    verify(comicDetail).setVolume(TEST_ISSUE_VOLUME);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicMetadataSaved);
  }

  @Test
  void findForWebAddress_noProviderFound() {
    when(metadataAdaptorProvider.supportedReference(anyString())).thenReturn(false);

    when(metadataAdaptorRegistry.getAdaptors()).thenReturn(metadataAdaptorProviderList);

    final MetadataAdaptorProvider result = service.findForWebAddress(TEST_WEB_ADDRESS);

    assertNull(result);

    verify(metadataAdaptorProvider).supportedReference(TEST_WEB_ADDRESS);
  }

  @Test
  void findForWebAddress() {
    when(metadataAdaptorProvider.supportedReference(anyString())).thenReturn(true);

    when(metadataAdaptorRegistry.getAdaptors()).thenReturn(metadataAdaptorProviderList);

    final MetadataAdaptorProvider result = service.findForWebAddress(TEST_WEB_ADDRESS);

    assertNotNull(result);
    assertSame(metadataAdaptorProvider, result);

    verify(metadataAdaptorProvider).supportedReference(TEST_WEB_ADDRESS);
  }

  @Test
  void batchScrape() {
    service.batchScrapeComicBooks(comicBookIdList);

    verify(comicDetailService).markComicBooksForBatchScraping(comicBookIdList);
    verify(applicationEventPublisher).publishEvent(ScrapeMetadataEvent.instance);
  }

  @Test
  void loadStories_adaptorException() throws MetadataException {
    when(metadataAdaptor.getStories(anyString(), anyInt(), any(MetadataSource.class)))
        .thenThrow(MetadataException.class);

    assertThrows(
        MetadataException.class,
        () -> service.getStories(TEST_STORY_NAME, TEST_MAX_RECORDS, TEST_METADATA_SOURCE_ID, true));
  }

  @Test
  void loadStories() throws MetadataException {
    when(metadataAdaptor.getStories(anyString(), anyInt(), any(MetadataSource.class)))
        .thenReturn(storyMetadataList);

    final List<StoryMetadata> result =
        service.getStories(TEST_STORY_NAME, TEST_MAX_RECORDS, TEST_METADATA_SOURCE_ID, true);

    assertNotNull(result);
    assertSame(storyMetadataList, result);
  }

  @Test
  void scrapeStory_skipCache_noSuchMetadataSource() throws MetadataSourceException {
    when(metadataSourceService.getById(anyLong())).thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataException.class,
        () -> service.scrapeStory(TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID, true));

    verify(metadataSourceService).getById(anyLong());
  }

  @Test
  void scrapeStory_skipCache_metadataAdaptorThrowsException() throws MetadataException {
    when(metadataAdaptor.getStory(anyString(), any(MetadataSource.class)))
        .thenThrow(MetadataException.class);

    assertThrows(
        MetadataException.class,
        () -> service.scrapeStory(TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID, true));

    verify(metadataAdaptor).getStory(TEST_REFERENCE_ID, metadataSource);
  }

  @Test
  void scrapeStory_nothingCached_metadataAdaptorThrowsException()
      throws MetadataException, MetadataSourceException {
    when(metadataCacheService.getFromCache(anyString(), anyString())).thenReturn(null);
    when(metadataAdaptor.getStory(anyString(), any(MetadataSource.class)))
        .thenThrow(MetadataException.class);

    assertThrows(
        MetadataException.class,
        () -> service.scrapeStory(TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID, false));

    verify(metadataSourceService).getById(anyLong());
    verify(metadataCacheService).getFromCache(TEST_CACHE_SOURCE, TEST_STORY_KEY);
    verify(metadataAdaptor).getStory(TEST_REFERENCE_ID, metadataSource);
  }

  @Test
  void scrapeStory_updatesExistingStory() throws MetadataException {
    when(scrapedStoryService.getForName(anyString())).thenReturn(null);
    when(scrapedStoryService.saveStory(scrapedStoryArgumentCaptor.capture()))
        .thenReturn(savedScrapedStory, updatedScrapedStory);

    service.scrapeStory(TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID, false);

    final ScrapedStory localScrapedStory = scrapedStoryArgumentCaptor.getValue();

    verify(scrapedStoryService).saveStory(localScrapedStory);
  }

  @Test
  void scrapeStory() throws MetadataException {
    when(scrapedStoryService.saveStory(scrapedStoryArgumentCaptor.capture()))
        .thenReturn(savedScrapedStory);

    service.scrapeStory(TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID, false);

    final ScrapedStory newlyCreatedStory = scrapedStoryArgumentCaptor.getValue();

    verify(scrapedStoryService).saveStory(newlyCreatedStory);
  }
}
