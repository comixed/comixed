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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.MetadataAdaptorRegistry;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.net.metadata.ScrapeSeriesResponse;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.collections.IssueService;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.service.metadata.action.ProcessComicDescriptionAction;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

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

  @InjectMocks private MetadataService service;
  @Mock private ConfigurationService configurationService;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private MetadataAdaptorRegistry metadataAdaptorRegistry;
  @Mock private MetadataCacheService metadataCacheService;
  @Mock private IssueService issueService;
  @Mock private MetadataAdaptor metadataAdaptor;
  @Mock private ProcessComicDescriptionAction processComicDescriptionAction;
  @Mock private ObjectMapper objectMapper;
  @Mock private VolumeMetadata volumeMetadata;
  @Mock private IssueMetadata issueMetadata;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicStateHandler comicStateHandler;
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

  @Captor private ArgumentCaptor<List<String>> cacheEntryList;
  @Captor private ArgumentCaptor<List<Issue>> issueListArgumentCaptor;
  @Captor private ArgumentCaptor<ComicMetadataSource> comicMetadataSourceArgumentCaptor;

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

  @BeforeEach
  public void setUp() throws MetadataSourceException, MetadataException {
    Mockito.when(configurationService.isFeatureEnabled(Mockito.anyString())).thenReturn(true);
    Mockito.when(loadedComicBook.getComicDetail()).thenReturn(loadedComicDetail);

    Mockito.when(metadataAdaptor.getSource()).thenReturn(TEST_CACHE_SOURCE);
    Mockito.when(metadataAdaptor.getVolumeKey(Mockito.anyString())).thenReturn(TEST_VOLUME_KEY);
    Mockito.when(metadataAdaptor.getIssueKey(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(metadataAdaptor.getIssueDetailsKey(Mockito.anyString()))
        .thenReturn(TEST_ISSUE_DETAILS_KEY);
    Mockito.when(metadataAdaptorRegistry.getAdaptor(Mockito.anyString()))
        .thenReturn(metadataAdaptor);

    Mockito.when(issueDetailsMetadata.getPublisher()).thenReturn(addPadding(TEST_ISSUE_PUBLISHER));
    Mockito.when(issueDetailsMetadata.getSeries()).thenReturn(addPadding(TEST_ISSUE_SERIES_NAME));
    Mockito.when(issueDetailsMetadata.getVolume()).thenReturn(addPadding(TEST_ISSUE_VOLUME));
    Mockito.when(issueDetailsMetadata.getIssueNumber()).thenReturn(addPadding(TEST_ISSUE_NUMBER));
    Mockito.when(issueDetailsMetadata.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(issueDetailsMetadata.getStoreDate()).thenReturn(TEST_STORE_DATE);
    Mockito.when(issueDetailsMetadata.getTitle()).thenReturn(addPadding(TEST_TITLE));
    Mockito.when(issueDetailsMetadata.getDescription()).thenReturn(addPadding(TEST_DESCRIPTION));
    Mockito.when(issueDetailsMetadata.getWebAddress()).thenReturn(TEST_WEB_ADDRESS);
    Mockito.when(issueDetailsMetadata.getSourceId()).thenReturn(addPadding(TEST_SOURCE_ID));
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
    Mockito.when(issueDetailsMetadata.getCharacters()).thenReturn(characterList);
    Mockito.when(issueDetailsMetadata.getTeams()).thenReturn(teamList);
    Mockito.when(issueDetailsMetadata.getLocations()).thenReturn(locationList);
    Mockito.when(issueDetailsMetadata.getStories()).thenReturn(storyList);
    Mockito.when(issueDetailsMetadata.getCredits()).thenReturn(creditList);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataSource.getAdaptorName()).thenReturn(TEST_METADATA_SOURCE_NAME);

    metadataAdaptorProviderList.add(metadataAdaptorProvider);

    Mockito.doNothing().when(comicBook).setMetadata(comicMetadataSourceArgumentCaptor.capture());
    Mockito.when(comicBook.getMetadata()).thenReturn(comicMetadataSource);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);

    Mockito.when(processComicDescriptionAction.execute(Mockito.anyString()))
        .thenAnswer(input -> input.getArguments()[0]);
  }

  private String addPadding(final String value) {
    return String.format(" %s ", value);
  }

  @Test
  void getVolumes_invalidSourceId() throws MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

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
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  void getVolumes_skipCache()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(VolumeMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(volumeMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_skipCache_matchPublisher_noneFound()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(VolumeMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());
    Mockito.when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER.substring(1));

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(volumeMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_skipCache_matchPublisher()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(VolumeMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());
    Mockito.when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER);

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(volumeMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_skipCacheJsonError()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(VolumeMetadata.class)))
        .thenThrow(JsonProcessingException.class);

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
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(VolumeMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(volumeMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  void getVolumes_cachedDataJsonException()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenThrow(JsonProcessingException.class);

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class));
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(volumeMetadata);
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  void getVolumes_loadedCachedData()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(volumeMetadata);

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    Mockito.verify(metadataAdaptor, Mockito.never())
        .getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class));
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(volumeMetadata);
  }

  @Test
  void getVolumes_loadedCachedData_matchPublisher_noneFound()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(volumeMetadata);
    Mockito.when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER.substring(1));

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    Mockito.verify(metadataAdaptor, Mockito.never())
        .getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class));
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(volumeMetadata);
  }

  @Test
  void getVolumes_loadedCachedData_matchPublisher()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(volumeMetadata);
    Mockito.when(volumeMetadata.getPublisher()).thenReturn(TEST_PUBLISHER);

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

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, VolumeMetadata.class);
    Mockito.verify(metadataAdaptor, Mockito.never())
        .getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class));
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(volumeMetadata);
  }

  @Test
  void getIssue_invalidMetadataSourceId() throws MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataException.class,
        () -> service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true));
  }

  @Test
  void getIssue_skipCacheNoResults() throws MetadataException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataAdaptor.getIssueKey(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(
            metadataAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(null);

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNull(result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  void getIssue_skipCache()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNotNull(result);
    assertSame(issueMetadata, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(issueMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  void getIssue_jsonEncoding()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueMetadata.class)))
        .thenThrow(JsonProcessingException.class);

    assertThrows(
        MetadataException.class,
        () -> service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true));
  }

  @Test
  void getIssue_nothingCached()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(
            metadataAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(issueMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  void getIssue_cachedDataJsonException()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenThrow(JsonProcessingException.class);
    Mockito.when(
            metadataAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, IssueMetadata.class);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(issueMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  void getIssue_cachedData()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(issueMetadata);

    final IssueMetadata result =
        service.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, IssueMetadata.class);
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.any());
    Mockito.verify(metadataAdaptor, Mockito.never())
        .getIssue(Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class));
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  void scrapeComic_noSuchComic() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    assertThrows(
        MetadataException.class,
        () -> service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true));
  }

  @Test
  void scrapeComic_skipCacheNoResult() throws MetadataException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(
            metadataAdaptor.getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(null);

    service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    Mockito.verify(comicBookService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    verifyComicScrapingNotDone();
  }

  @Test
  void scrapeComic_skipCache()
      throws MetadataException, ComicBookException, JsonProcessingException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(
            metadataAdaptor.getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(result);
    assertSame(savedComicBook, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(comicBookService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(loadedComicBook, ComicEvent.scraped);

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void asyncScrapeComic() throws MetadataException, ComicBookException, JsonProcessingException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(
            metadataAdaptor.getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    service.asyncScrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(loadedComicBook, ComicEvent.scraped);

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_withPreviousMetadataSource()
      throws MetadataException, ComicBookException, JsonProcessingException {
    Mockito.when(loadedComicBook.getMetadata()).thenReturn(comicMetadataSource);
    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(
            metadataAdaptor.getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(result);
    assertSame(savedComicBook, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(comicBookService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(loadedComicBook, ComicEvent.scraped);
    Mockito.verify(comicMetadataSource, Mockito.times(1)).setMetadataSource(metadataSource);
    Mockito.verify(comicMetadataSource, Mockito.times(1)).setReferenceId(TEST_SOURCE_ID);

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_nothingCached()
      throws ComicBookException, MetadataException, JsonProcessingException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(
            metadataAdaptor.getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueDetailsMetadata.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(metadataCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(comicBookService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, metadataSource);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(loadedComicBook, ComicEvent.scraped);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_cachingError()
      throws ComicBookException, MetadataException, JsonProcessingException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(
            metadataAdaptor.getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueDetailsMetadata.class)))
        .thenThrow(JsonProcessingException.class);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    Mockito.verify(comicBookService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, metadataSource);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(loadedComicBook, ComicEvent.scraped);
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_cachedDate()
      throws ComicBookException, JsonProcessingException, MetadataException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(issueDetailsMetadata);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    Mockito.verify(comicBookService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(metadataAdaptor, Mockito.never())
        .getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class));
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(loadedComicBook, ComicEvent.scraped);
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    verifyComicScraping(loadedComicBook);
  }

  @Test
  void scrapeComic_noCoverDate()
      throws ComicBookException, JsonProcessingException, MetadataException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(issueDetailsMetadata);
    Mockito.when(issueDetailsMetadata.getCoverDate()).thenReturn(null);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    Mockito.verify(loadedComicDetail, Mockito.never()).setCoverDate(Mockito.any(Date.class));
  }

  @Test
  void scrapeComic_noStoreDate()
      throws ComicBookException, JsonProcessingException, MetadataException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(issueDetailsMetadata);
    Mockito.when(issueDetailsMetadata.getStoreDate()).thenReturn(null);

    final ComicBook result =
        service.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    Mockito.verify(loadedComicDetail, Mockito.never()).setStoreDate(Mockito.any(Date.class));
  }

  private void verifyComicScrapingNotDone() {
    Mockito.verify(loadedComicDetail, Mockito.never()).setPublisher(Mockito.anyString());
    Mockito.verify(loadedComicDetail, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(loadedComicDetail, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(loadedComicDetail, Mockito.never()).setCoverDate(Mockito.any(Date.class));
    Mockito.verify(loadedComicDetail, Mockito.never()).setStoreDate(Mockito.any(Date.class));
    Mockito.verify(loadedComicDetail, Mockito.never()).setDescription(Mockito.anyString());
  }

  private void verifyComicScraping(final ComicBook comicBook) {
    // TODO verify metadata source reference
    Mockito.verify(loadedComicDetail, Mockito.times(1)).setPublisher(TEST_ISSUE_PUBLISHER);
    Mockito.verify(loadedComicDetail, Mockito.times(1)).setImprint(TEST_ISSUE_PUBLISHER);
    Mockito.verify(loadedComicDetail, Mockito.times(1)).setSeries(TEST_ISSUE_SERIES_NAME);
    Mockito.verify(loadedComicDetail, Mockito.times(1)).setVolume(TEST_ISSUE_VOLUME);
    Mockito.verify(loadedComicDetail, Mockito.times(1))
        .setCoverDate(service.adjustForTimezone(TEST_COVER_DATE));
    Mockito.verify(loadedComicDetail, Mockito.times(1))
        .setStoreDate(service.adjustForTimezone(TEST_STORE_DATE));
    Mockito.verify(loadedComicDetail, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(loadedComicDetail, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
    Mockito.verify(loadedComicDetail, Mockito.times(1)).setWebAddress(TEST_WEB_ADDRESS);
    Mockito.verify(imprintService, Mockito.times(1)).update(comicBook);
  }

  @Test
  void scrapeSeries_invalidSourceId() throws MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

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
    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
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
    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(new ArrayList<>());

    final ScrapeSeriesResponse result =
        service.scrapeSeries(
            TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);

    assertNotNull(result);
    assertEquals(TEST_PUBLISHER, result.getPublisher());
    assertEquals(TEST_SERIES_NAME, result.getSeries());
    assertEquals(TEST_VOLUME, result.getVolume());

    Mockito.verify(metadataAdaptor, Mockito.times(1)).getAllIssues(TEST_VOLUME_ID, metadataSource);
    Mockito.verify(issueService, Mockito.never()).saveAll(Mockito.anyList());
  }

  @Test
  void scrapeSeries_issueNotFound() throws MetadataException {
    issueDetailsMetadataList.add(issueDetailsMetadata);

    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadataList);
    Mockito.when(issueService.saveAll(issueListArgumentCaptor.capture())).thenReturn(issueList);
    Mockito.when(
            comicBookService.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
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

    Mockito.verify(issueService, Mockito.times(1)).saveAll(issues);
    Mockito.verify(comicBookService, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER);
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void scrapeSeries_existingMetadataSource() throws MetadataException {
    comicBookList.add(comicBook);

    issueDetailsMetadataList.add(issueDetailsMetadata);

    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadataList);
    Mockito.when(issueService.saveAll(issueListArgumentCaptor.capture())).thenReturn(issueList);
    Mockito.when(
            comicBookService.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
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

    Mockito.verify(issueService, Mockito.times(1)).saveAll(issues);
    Mockito.verify(comicBookService, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER);
    Mockito.verify(comicDetail, Mockito.times(1)).setPublisher(TEST_ISSUE_PUBLISHER);
    Mockito.verify(comicDetail, Mockito.times(1)).setSeries(TEST_ISSUE_SERIES_NAME);
    Mockito.verify(comicDetail, Mockito.times(1)).setVolume(TEST_ISSUE_VOLUME);
    Mockito.verify(comicMetadataSource, Mockito.times(1)).setMetadataSource(metadataSource);
    Mockito.verify(comicMetadataSource, Mockito.times(1)).setReferenceId(TEST_SOURCE_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  void scrapeSeries() throws MetadataException {
    comicBookList.add(comicBook);

    issueDetailsMetadataList.add(issueDetailsMetadata);

    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadataList);
    Mockito.when(issueService.saveAll(issueListArgumentCaptor.capture())).thenReturn(issueList);
    Mockito.when(
            comicBookService.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBookList);
    Mockito.when(comicBook.getMetadata()).thenReturn(null);

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

    Mockito.verify(issueService, Mockito.times(1)).saveAll(issues);
    Mockito.verify(comicBookService, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER);
    Mockito.verify(comicDetail, Mockito.times(1)).setPublisher(TEST_ISSUE_PUBLISHER);
    Mockito.verify(comicDetail, Mockito.times(1)).setSeries(TEST_ISSUE_SERIES_NAME);
    Mockito.verify(comicDetail, Mockito.times(1)).setVolume(TEST_ISSUE_VOLUME);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  void findForWebAddress_noProviderFound() {
    Mockito.when(metadataAdaptorProvider.supportedReference(Mockito.anyString())).thenReturn(false);

    Mockito.when(metadataAdaptorRegistry.getAdaptors()).thenReturn(metadataAdaptorProviderList);

    final MetadataAdaptorProvider result = service.findForWebAddress(TEST_WEB_ADDRESS);

    assertNull(result);

    Mockito.verify(metadataAdaptorProvider, Mockito.times(1)).supportedReference(TEST_WEB_ADDRESS);
  }

  @Test
  void findForWebAddress() {
    Mockito.when(metadataAdaptorProvider.supportedReference(Mockito.anyString())).thenReturn(true);

    Mockito.when(metadataAdaptorRegistry.getAdaptors()).thenReturn(metadataAdaptorProviderList);

    final MetadataAdaptorProvider result = service.findForWebAddress(TEST_WEB_ADDRESS);

    assertNotNull(result);
    assertSame(metadataAdaptorProvider, result);

    Mockito.verify(metadataAdaptorProvider, Mockito.times(1)).supportedReference(TEST_WEB_ADDRESS);
  }
}
