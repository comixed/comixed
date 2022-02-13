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

import static junit.framework.TestCase.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.adaptors.ScrapingAdaptor;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.ApplicationContext;

@RunWith(MockitoJUnitRunner.class)
public class ScrapingServiceTest {
  private static final Long TEST_METADATA_SOURCE_ID = 73L;
  private static final String TEST_SERIES_NAME = "Series Name";
  private static final Integer TEST_MAX_RECORDS = 1000;
  private static final String TEST_ENCODED_VALUE = "JSON object as string";
  private static final String TEST_CACHE_SOURCE = "ScrapingSource";
  private static final String TEST_VOLUME_KEY = "VolumeKey";
  private static final Integer TEST_VOLUME_ID = 717;
  private static final String TEST_ISSUE_NUMBER = "23.1";
  private static final String TEST_ISSUE_KEY = "IssueKey";
  private static final Long TEST_COMIC_ID = 127L;
  private static final Integer TEST_ISSUE_ID = 239;
  private static final String TEST_PUBLISHER = "Publisher Name";
  private static final String TEST_VOLUME = "2020";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE = new Date();
  private static final String TEST_TITLE = "The Title";
  private static final String TEST_DESCRIPTION = "This is the comic's description";
  private static final String TEST_ISSUE_DETAILS_KEY = "IssueDetailsKey";
  private static final Integer TEST_SOURCE_ID = 71765;
  private static final String TEST_METADATA_SOURCE_BEAN_NAME = "farkleScrapingAdaptor";

  @InjectMocks private ScrapingService scrapingService;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private ApplicationContext applicationContext;
  @Mock private ScrapingCacheService scrapingCacheService;
  @Mock private ScrapingAdaptor scrapingAdaptor;
  @Captor private ArgumentCaptor<List<String>> cacheEntryList;
  @Mock private ObjectMapper objectMapper;
  @Mock private ScrapingVolume scrapingVolume;
  @Mock private ScrapingIssue scrapingIssue;
  @Mock private ComicService comicService;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private Comic loadedComic;
  @Mock private Comic savedComic;
  @Mock private ScrapingIssueDetails scrapingIssueDetails;
  @Mock private ImprintService imprintService;
  @Mock private MetadataSource metadataSource;
  @Mock private Set<MetadataSourceProperty> sourceProperties;

  private List<String> cachedEntryList = new ArrayList<>();
  private List<ScrapingVolume> fetchedVolumeList = new ArrayList<>();

  @Before
  public void setUp() throws MetadataSourceException {
    Mockito.when(scrapingAdaptor.getSource()).thenReturn(TEST_CACHE_SOURCE);
    Mockito.when(scrapingAdaptor.getVolumeKey(Mockito.anyString())).thenReturn(TEST_VOLUME_KEY);
    Mockito.when(scrapingAdaptor.getIssueKey(Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(scrapingAdaptor.getIssueDetailsKey(Mockito.anyInt()))
        .thenReturn(TEST_ISSUE_DETAILS_KEY);

    Mockito.when(scrapingIssueDetails.getSourceId()).thenReturn(TEST_SOURCE_ID);
    Mockito.when(scrapingIssueDetails.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(scrapingIssueDetails.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(scrapingIssueDetails.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(scrapingIssueDetails.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(scrapingIssueDetails.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(scrapingIssueDetails.getStoreDate()).thenReturn(TEST_STORE_DATE);
    Mockito.when(scrapingIssueDetails.getTitle()).thenReturn(TEST_TITLE);
    Mockito.when(scrapingIssueDetails.getDescription()).thenReturn(TEST_DESCRIPTION);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(metadataSource.getBeanName()).thenReturn(TEST_METADATA_SOURCE_BEAN_NAME);
    Mockito.when(applicationContext.getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class))
        .thenReturn(scrapingAdaptor);
    Mockito.when(metadataSource.getProperties()).thenReturn(sourceProperties);
  }

  @Test(expected = ScrapingException.class)
  public void testGetVolumesInvalidSourceId() throws ScrapingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    try {
      scrapingService.getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    }
  }

  @Test
  public void testGetVolumesSkipCacheNoResults() throws ScrapingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            scrapingAdaptor.getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(fetchedVolumeList);

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, sourceProperties);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetVolumesSkipCache()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(scrapingVolume);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            scrapingAdaptor.getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingVolume.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(
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
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, sourceProperties);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(scrapingVolume);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test(expected = ScrapingException.class)
  public void testGetVolumesSkipCacheJsonError()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(scrapingVolume);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(
            scrapingAdaptor.getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingVolume.class)))
        .thenThrow(JsonProcessingException.class);

    try {
      scrapingService.getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
      Mockito.verify(applicationContext, Mockito.times(1))
          .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
      Mockito.verify(scrapingAdaptor, Mockito.times(1))
          .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, sourceProperties);
      Mockito.verify(scrapingCacheService, Mockito.never())
          .getFromCache(Mockito.anyString(), Mockito.anyString());
      Mockito.verify(scrapingCacheService, Mockito.never())
          .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
    }
  }

  @Test
  public void testGetVolumesNothingCached()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(scrapingVolume);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(
            scrapingAdaptor.getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingVolume.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(
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
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, sourceProperties);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(scrapingVolume);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetVolumesCachedDataJsonException()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenThrow(JsonProcessingException.class);

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, ScrapingVolume.class);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.anySet());
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(scrapingVolume);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetVolumesCachedData()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingVolume);

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(
            TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);

    assertNotNull(result);
    assertEquals(cachedEntryList.size(), result.size());
    for (int index = 0; index < result.size(); index++) {
      assertSame(scrapingVolume, result.get(index));
    }

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, ScrapingVolume.class);
    Mockito.verify(scrapingAdaptor, Mockito.never())
        .getVolumes(Mockito.anyString(), Mockito.anyInt(), Mockito.anySet());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(scrapingVolume);
  }

  @Test(expected = ScrapingException.class)
  public void testGetIssueInvalidMetadataSourceId()
      throws MetadataSourceException, ScrapingException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    try {
      scrapingService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    }
  }

  @Test
  public void testGetIssueSkipCacheNoResults() throws ScrapingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingAdaptor.getIssueKey(Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(scrapingAdaptor.getIssue(Mockito.anyInt(), Mockito.anyString(), Mockito.anySet()))
        .thenReturn(null);

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNull(result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, sourceProperties);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetIssueSkipCache()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingAdaptor.getIssue(Mockito.anyInt(), Mockito.anyString(), Mockito.anySet()))
        .thenReturn(scrapingIssue);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssue.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNotNull(result);
    assertSame(scrapingIssue, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, sourceProperties);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssue);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
  }

  @Test(expected = ScrapingException.class)
  public void testGetIssueJsonEncoding()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingAdaptor.getIssue(Mockito.anyInt(), Mockito.anyString(), Mockito.anySet()))
        .thenReturn(scrapingIssue);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssue.class)))
        .thenThrow(JsonProcessingException.class);

    try {
      scrapingService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
      Mockito.verify(applicationContext, Mockito.times(1))
          .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
      Mockito.verify(scrapingAdaptor, Mockito.times(1))
          .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, sourceProperties);
      Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssue);
      Mockito.verify(scrapingCacheService, Mockito.never())
          .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
      Mockito.verify(scrapingCacheService, Mockito.never())
          .getFromCache(Mockito.anyString(), Mockito.anyString());
    }
  }

  @Test
  public void testGetIssueNothingCached()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(scrapingAdaptor.getIssue(Mockito.anyInt(), Mockito.anyString(), Mockito.anySet()))
        .thenReturn(scrapingIssue);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssue.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, sourceProperties);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssue);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetIssueCachedDataJsonException()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenThrow(JsonProcessingException.class);
    Mockito.when(scrapingAdaptor.getIssue(Mockito.anyInt(), Mockito.anyString(), Mockito.anySet()))
        .thenReturn(scrapingIssue);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssue.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, ScrapingIssue.class);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssue);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetIssueCachedData()
      throws ScrapingException, JsonProcessingException, MetadataSourceException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(metadataSource);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssue);

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_METADATA_SOURCE_ID);
    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_METADATA_SOURCE_BEAN_NAME, ScrapingAdaptor.class);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, ScrapingIssue.class);
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.any());
    Mockito.verify(scrapingAdaptor, Mockito.never())
        .getIssue(Mockito.anyInt(), Mockito.anyString(), Mockito.anySet());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test(expected = ScrapingException.class)
  public void testScrapeComicNoSuchComic() throws ScrapingException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      scrapingService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testScrapeComicSkipCacheNoResult() throws ScrapingException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic, savedComic);
    Mockito.when(scrapingAdaptor.getIssueDetails(Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(null);

    scrapingService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    Mockito.verify(comicService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, sourceProperties);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScrapingNotDone();
  }

  @Test
  public void testScrapeComicSkipCache()
      throws ScrapingException, ComicException, JsonProcessingException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic, savedComic);
    Mockito.when(scrapingAdaptor.getIssueDetails(Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(scrapingIssueDetails);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssueDetails.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final Comic result =
        scrapingService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(result);
    assertSame(savedComic, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(comicService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, sourceProperties);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(comicStateHandler, Mockito.times(1)).fireEvent(loadedComic, ComicEvent.scraped);

    this.verifyComicScraping(loadedComic);
  }

  @Test
  public void testScrapeComicNothingCached()
      throws ComicException, ScrapingException, JsonProcessingException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic, savedComic);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(scrapingAdaptor.getIssueDetails(Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(scrapingIssueDetails);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssueDetails.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final Comic result =
        scrapingService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComic, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(comicService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, sourceProperties);
    Mockito.verify(comicStateHandler, Mockito.times(1)).fireEvent(loadedComic, ComicEvent.scraped);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScraping(loadedComic);
  }

  @Test
  public void testScrapeComicCachingError()
      throws ComicException, ScrapingException, JsonProcessingException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic, savedComic);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(scrapingAdaptor.getIssueDetails(Mockito.anyInt(), Mockito.anySet()))
        .thenReturn(scrapingIssueDetails);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssueDetails.class)))
        .thenThrow(JsonProcessingException.class);

    final Comic result =
        scrapingService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComic, result);

    Mockito.verify(comicService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssueDetails(TEST_ISSUE_ID, sourceProperties);
    Mockito.verify(comicStateHandler, Mockito.times(1)).fireEvent(loadedComic, ComicEvent.scraped);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScraping(loadedComic);
  }

  @Test
  public void testScrapeComicCachedDate()
      throws ComicException, JsonProcessingException, ScrapingException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic, savedComic);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssueDetails);

    final Comic result =
        scrapingService.scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComic, result);

    Mockito.verify(comicService, Mockito.times(2)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(scrapingAdaptor, Mockito.never())
        .getIssueDetails(Mockito.anyInt(), Mockito.anySet());
    Mockito.verify(comicStateHandler, Mockito.times(1)).fireEvent(loadedComic, ComicEvent.scraped);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScraping(loadedComic);
  }

  private void verifyComicScrapingNotDone() {
    Mockito.verify(this.loadedComic, Mockito.never()).setPublisher(Mockito.anyString());
    Mockito.verify(this.loadedComic, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(this.loadedComic, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(this.loadedComic, Mockito.never()).setCoverDate(Mockito.any(Date.class));
    Mockito.verify(this.loadedComic, Mockito.never()).setStoreDate(Mockito.any(Date.class));
    Mockito.verify(this.loadedComic, Mockito.never()).setDescription(Mockito.anyString());
  }

  private void verifyComicScraping(final Comic comic) {
    Mockito.verify(this.loadedComic, Mockito.times(1)).setComicVineId(TEST_SOURCE_ID);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(this.loadedComic, Mockito.times(1))
        .setCoverDate(this.scrapingService.adjustForTimezone(TEST_COVER_DATE));
    Mockito.verify(this.loadedComic, Mockito.times(1))
        .setStoreDate(this.scrapingService.adjustForTimezone(TEST_STORE_DATE));
    Mockito.verify(this.loadedComic, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
    Mockito.verify(this.imprintService, Mockito.times(1)).update(comic);
  }
}
