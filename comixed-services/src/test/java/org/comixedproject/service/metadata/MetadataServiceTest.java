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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.collections.IssueService;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.ApplicationContext;

@RunWith(MockitoJUnitRunner.class)
public class MetadataServiceTest {
  private static final Long TEST_METADATA_SOURCE_ID = 73L;
  private static final String TEST_SERIES_NAME = "Series Name";
  private static final Integer TEST_MAX_RECORDS = 1000;
  private static final String TEST_ENCODED_VALUE = "JSON object as string";
  private static final String TEST_CACHE_SOURCE = "ScrapingSource";
  private static final String TEST_VOLUME_KEY = "VolumeKey";
  private static final String TEST_VOLUME_ID = "717";
  private static final String TEST_ISSUE_NUMBER = "23.1";
  private static final String TEST_ISSUE_KEY = "IssueKey";
  private static final Long TEST_COMIC_ID = 127L;
  private static final String TEST_ISSUE_ID = "239";
  private static final String TEST_PUBLISHER = "Publisher Name";
  private static final String TEST_VOLUME = "2020";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE = new Date();
  private static final String TEST_TITLE = "The Title";
  private static final String TEST_DESCRIPTION = "This is the comic's description";
  private static final String TEST_ISSUE_DETAILS_KEY = "IssueDetailsKey";
  private static final String TEST_METADATA_SOURCE_BEAN_NAME = "farkleScrapingAdaptor";
  private static final String TEST_SOURCE_ID = "93782";

  @InjectMocks private MetadataService metadataService;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private ApplicationContext applicationContext;
  @Mock private MetadataCacheService metadataCacheService;
  @Mock private IssueService issueService;
  @Mock private MetadataAdaptor metadataAdaptor;
  @Captor private ArgumentCaptor<List<String>> cacheEntryList;
  @Mock private ObjectMapper objectMapper;
  @Mock private VolumeMetadata volumeMetadata;
  @Mock private IssueMetadata issueMetadata;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicBook loadedComicBook;
  @Mock private ComicBook savedComicBook;
  @Mock private IssueDetailsMetadata issueDetailsMetadata;
  @Mock private ImprintService imprintService;
  @Mock private MetadataSource metadataSource;
  @Mock private List<Issue> issueList;

  @Captor private ArgumentCaptor<List<Issue>> issueListArgumentCaptor;

  private List<String> cachedEntryList = new ArrayList<>();
  private List<VolumeMetadata> fetchedVolumeList = new ArrayList<>();
  private List<IssueDetailsMetadata> issueDetailsMetadataList = new ArrayList<>();

  @Before
  public void setUp() throws MetadataSourceException {
    Mockito.when(metadataAdaptor.getSource()).thenReturn(TEST_CACHE_SOURCE);
    Mockito.when(metadataAdaptor.getVolumeKey(Mockito.anyString())).thenReturn(TEST_VOLUME_KEY);
    Mockito.when(metadataAdaptor.getIssueKey(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(metadataAdaptor.getIssueDetailsKey(Mockito.anyString()))
        .thenReturn(TEST_ISSUE_DETAILS_KEY);

    Mockito.when(issueDetailsMetadata.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(issueDetailsMetadata.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(issueDetailsMetadata.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(issueDetailsMetadata.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(issueDetailsMetadata.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(issueDetailsMetadata.getStoreDate()).thenReturn(TEST_STORE_DATE);
    Mockito.when(issueDetailsMetadata.getTitle()).thenReturn(TEST_TITLE);
    Mockito.when(issueDetailsMetadata.getDescription()).thenReturn(TEST_DESCRIPTION);
    Mockito.when(issueDetailsMetadata.getSourceId()).thenReturn(TEST_SOURCE_ID);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataSource.getBeanName()).thenReturn(TEST_METADATA_SOURCE_BEAN_NAME);
    Mockito.when(applicationContext.getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class))
        .thenReturn(metadataAdaptor);
  }

  @Test(expected = MetadataException.class)
  public void testGetVolumesInvalidSourceId() throws MetadataException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    try {
      metadataService.getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    }
  }

  @Test
  public void testGetVolumesSkipCacheNoResults() throws MetadataException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);

    final List<VolumeMetadata> result =
        metadataService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetVolumesSkipCache()
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
        metadataService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);

    assertNotNull(result);
    assertEquals(fetchedVolumeList, result);
    assertNotNull(cacheEntryList.getValue());

    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(volumeMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test(expected = MetadataException.class)
  public void testGetVolumesSkipCacheJsonError()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(volumeMetadata);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyInt(), Mockito.any(MetadataSource.class)))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(VolumeMetadata.class)))
        .thenThrow(JsonProcessingException.class);

    try {
      metadataService.getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
      Mockito.verify(applicationContext, Mockito.times(1))
          .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
      Mockito.verify(metadataAdaptor, Mockito.times(1))
          .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
      Mockito.verify(metadataCacheService, Mockito.never())
          .getFromCache(Mockito.anyString(), Mockito.anyString());
      Mockito.verify(metadataCacheService, Mockito.never())
          .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
    }
  }

  @Test
  public void testGetVolumesNothingCached()
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
        metadataService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);

    assertNotNull(result);
    assertEquals(fetchedVolumeList, result);
    assertNotNull(cacheEntryList.getValue());
    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
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
  public void testGetVolumesCachedDataJsonException()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenThrow(JsonProcessingException.class);

    final List<VolumeMetadata> result =
        metadataService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
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
  public void testGetVolumesCachedData()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(volumeMetadata);

    final List<VolumeMetadata> result =
        metadataService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);

    assertNotNull(result);
    assertEquals(cachedEntryList.size(), result.size());
    for (int index = 0; index < result.size(); index++) {
      assertSame(volumeMetadata, result.get(index));
    }

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
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

  @Test(expected = MetadataException.class)
  public void testGetIssueInvalidMetadataSourceId()
      throws MetadataSourceException, MetadataException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    try {
      metadataService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    }
  }

  @Test
  public void testGetIssueSkipCacheNoResults() throws MetadataException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataAdaptor.getIssueKey(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(
            metadataAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(null);

    final IssueMetadata result =
        metadataService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNull(result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetIssueSkipCache()
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
        metadataService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNotNull(result);
    assertSame(issueMetadata, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(issueMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
  }

  @Test(expected = MetadataException.class)
  public void testGetIssueJsonEncoding()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            metadataAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueMetadata);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(IssueMetadata.class)))
        .thenThrow(JsonProcessingException.class);

    try {
      metadataService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
      Mockito.verify(applicationContext, Mockito.times(1))
          .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
      Mockito.verify(metadataAdaptor, Mockito.times(1))
          .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
      Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(issueMetadata);
      Mockito.verify(metadataCacheService, Mockito.never())
          .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
      Mockito.verify(metadataCacheService, Mockito.never())
          .getFromCache(Mockito.anyString(), Mockito.anyString());
    }
  }

  @Test
  public void testGetIssueNothingCached()
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
        metadataService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(issueMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetIssueCachedDataJsonException()
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
        metadataService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, IssueMetadata.class);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(issueMetadata);
    Mockito.verify(metadataCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetIssueCachedData()
      throws MetadataException, JsonProcessingException, MetadataSourceException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(issueMetadata);

    final IssueMetadata result =
        metadataService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, MetadataAdaptor.class);
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

  @Test(expected = MetadataException.class)
  public void testScrapeComicNoSuchComic() throws MetadataException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testScrapeComicSkipCacheNoResult() throws MetadataException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(
            metadataAdaptor.getIssueDetails(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(null);

    metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    Mockito.verify(comicBookService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(metadataAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, metadataSource);
    Mockito.verify(metadataCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(metadataCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScrapingNotDone();
  }

  @Test
  public void testScrapeComicSkipCache()
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
        metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

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

    this.verifyComicScraping(loadedComicBook);
  }

  @Test
  public void testScrapeComicNothingCached()
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
        metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

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

    this.verifyComicScraping(loadedComicBook);
  }

  @Test
  public void testScrapeComicCachingError()
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
        metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

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

    this.verifyComicScraping(loadedComicBook);
  }

  @Test
  public void testScrapeComicCachedDate()
      throws ComicBookException, JsonProcessingException, MetadataException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(comicBookService.getComic(Mockito.anyLong()))
        .thenReturn(loadedComicBook, savedComicBook);
    Mockito.when(metadataCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(issueDetailsMetadata);

    final ComicBook result =
        metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

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

    this.verifyComicScraping(loadedComicBook);
  }

  @Test
  public void testScrapeComicNoCoverDate()
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
        metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    Mockito.verify(this.loadedComicBook, Mockito.never()).setCoverDate(Mockito.any(Date.class));
  }

  @Test
  public void testScrapeComicNoStoreDate()
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
        metadataService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    Mockito.verify(this.loadedComicBook, Mockito.never()).setStoreDate(Mockito.any(Date.class));
  }

  private void verifyComicScrapingNotDone() {
    Mockito.verify(this.loadedComicBook, Mockito.never()).setPublisher(Mockito.anyString());
    Mockito.verify(this.loadedComicBook, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(this.loadedComicBook, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(this.loadedComicBook, Mockito.never()).setCoverDate(Mockito.any(Date.class));
    Mockito.verify(this.loadedComicBook, Mockito.never()).setStoreDate(Mockito.any(Date.class));
    Mockito.verify(this.loadedComicBook, Mockito.never()).setDescription(Mockito.anyString());
  }

  private void verifyComicScraping(final ComicBook comicBook) {
    // TODO verify metadata source reference
    Mockito.verify(this.loadedComicBook, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(this.loadedComicBook, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(this.loadedComicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(this.loadedComicBook, Mockito.times(1))
        .setCoverDate(this.metadataService.adjustForTimezone(TEST_COVER_DATE));
    Mockito.verify(this.loadedComicBook, Mockito.times(1))
        .setStoreDate(this.metadataService.adjustForTimezone(TEST_STORE_DATE));
    Mockito.verify(this.loadedComicBook, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(this.loadedComicBook, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
    Mockito.verify(this.imprintService, Mockito.times(1)).update(comicBook);
  }

  @Test(expected = MetadataException.class)
  public void testFetchIssuesForSeriesInvalidSourceId()
      throws MetadataSourceException, MetadataException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    try {
      this.metadataService.fetchIssuesForSeries(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    }
  }

  @Test(expected = MetadataException.class)
  public void testFetchIssuesForSeriesAdaptorException() throws MetadataException {
    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenThrow(MetadataException.class);

    try {
      this.metadataService.fetchIssuesForSeries(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);
    } finally {
      Mockito.verify(metadataAdaptor, Mockito.times(1))
          .getAllIssues(TEST_VOLUME_ID, metadataSource);
    }
  }

  @Test
  public void testFetchIssuesForSeriesNoneFound() throws MetadataException {
    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(new ArrayList<>());

    metadataService.fetchIssuesForSeries(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);

    Mockito.verify(metadataAdaptor, Mockito.times(1)).getAllIssues(TEST_VOLUME_ID, metadataSource);
    Mockito.verify(issueService, Mockito.never()).saveAll(Mockito.anyList());
  }

  @Test
  public void testFetchIssuesForSeries() throws MetadataException {
    issueDetailsMetadataList.add(issueDetailsMetadata);

    Mockito.when(
            metadataAdaptor.getAllIssues(Mockito.anyString(), Mockito.any(MetadataSource.class)))
        .thenReturn(issueDetailsMetadataList);
    Mockito.when(issueService.saveAll(issueListArgumentCaptor.capture())).thenReturn(issueList);

    metadataService.fetchIssuesForSeries(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID);

    final List<Issue> issues = issueListArgumentCaptor.getValue();
    assertNotNull(issues);
    assertFalse(issues.isEmpty());
    assertEquals(TEST_PUBLISHER, issues.get(0).getPublisher());
    assertEquals(TEST_SERIES_NAME, issues.get(0).getSeries());
    assertEquals(TEST_VOLUME, issues.get(0).getVolume());
    assertEquals(TEST_COVER_DATE, issues.get(0).getCoverDate());

    Mockito.verify(issueService, Mockito.times(1)).saveAll(issues);
  }
}
