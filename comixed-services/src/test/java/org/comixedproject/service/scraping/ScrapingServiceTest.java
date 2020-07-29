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

package org.comixedproject.service.scraping;

import static junit.framework.TestCase.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.adaptors.ComicVineScrapingAdaptor;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ScrapingServiceTest {
  private static final String TEST_API_KEY = String.valueOf(System.currentTimeMillis());
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
  private static final String TEST_DESCRIPTION = "This is the comic's description";
  private static final String TEST_ISSUE_DETAILS_KEY = "IssueDetailsKey";

  @InjectMocks private ScrapingService scrapingService;
  @Mock private ScrapingCacheService scrapingCacheService;
  @Mock private ComicVineScrapingAdaptor scrapingAdaptor;
  @Captor private ArgumentCaptor<List<String>> cacheEntryList;
  @Mock private ObjectMapper objectMapper;
  @Mock private ScrapingVolume scrapingVolume;
  @Mock private ScrapingIssue scrapingIssue;
  @Mock private ComicService comicService;
  @Mock private Comic loadedComic;
  @Mock private Comic savedComic;
  @Mock private ScrapingIssueDetails scrapingIssueDetails;

  private List<String> cachedEntryList = new ArrayList<>();
  private List<ScrapingVolume> fetchedVolumeList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(scrapingAdaptor.getSource()).thenReturn(TEST_CACHE_SOURCE);
    Mockito.when(scrapingAdaptor.getVolumeKey(Mockito.anyString())).thenReturn(TEST_VOLUME_KEY);
    Mockito.when(scrapingAdaptor.getIssueKey(Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(scrapingAdaptor.getIssueDetailsKey(Mockito.anyInt()))
        .thenReturn(TEST_ISSUE_DETAILS_KEY);

    Mockito.when(scrapingIssueDetails.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(scrapingIssueDetails.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(scrapingIssueDetails.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(scrapingIssueDetails.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(scrapingIssueDetails.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(scrapingIssueDetails.getDescription()).thenReturn(TEST_DESCRIPTION);
  }

  @Test
  public void testGetVolumesSkipCacheNoResults() throws ScrapingException {
    Mockito.when(
            scrapingAdaptor.getVolumes(Mockito.anyString(), Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(fetchedVolumeList);

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetVolumesSkipCache() throws ScrapingException, JsonProcessingException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(scrapingVolume);

    Mockito.when(
            scrapingAdaptor.getVolumes(Mockito.anyString(), Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingVolume.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);

    assertNotNull(result);
    assertEquals(fetchedVolumeList, result);
    assertNotNull(cacheEntryList.getValue());
    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(scrapingVolume);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetVolumesNothingCached() throws ScrapingException, JsonProcessingException {
    for (int index = 0; index < 25; index++) fetchedVolumeList.add(scrapingVolume);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(
            scrapingAdaptor.getVolumes(Mockito.anyString(), Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(fetchedVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingVolume.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);

    assertNotNull(result);
    assertEquals(fetchedVolumeList, result);
    assertNotNull(cacheEntryList.getValue());
    final List<String> entryList = cacheEntryList.getValue();
    assertEquals(fetchedVolumeList.size(), entryList.size());
    for (int index = 0; index < entryList.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, entryList.get(index));
    }

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(fetchedVolumeList.size()))
        .writeValueAsString(scrapingVolume);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetVolumesCachedData() throws ScrapingException, JsonProcessingException {
    for (int index = 0; index < 25; index++) cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingVolume);

    final List<ScrapingVolume> result =
        scrapingService.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);

    assertNotNull(result);
    assertEquals(cachedEntryList.size(), result.size());
    for (int index = 0; index < result.size(); index++) {
      assertSame(scrapingVolume, result.get(index));
    }

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_VOLUME_KEY);
    Mockito.verify(objectMapper, Mockito.times(cachedEntryList.size()))
        .readValue(TEST_ENCODED_VALUE, ScrapingVolume.class);
    Mockito.verify(scrapingAdaptor, Mockito.never())
        .getVolumes(Mockito.anyString(), Mockito.anyString(), Mockito.anyInt());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(scrapingVolume);
  }

  @Test
  public void testGetIssueSkipCacheNoResults() throws ScrapingException {
    Mockito.when(scrapingAdaptor.getIssueKey(Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(TEST_ISSUE_KEY);
    Mockito.when(
            scrapingAdaptor.getIssue(Mockito.anyString(), Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(null);

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNull(result);

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetIssueSkipCache() throws ScrapingException, JsonProcessingException {
    Mockito.when(
            scrapingAdaptor.getIssue(Mockito.anyString(), Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(scrapingIssue);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssue.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNotNull(result);
    assertSame(scrapingIssue, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssue);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testGetIssueNothingCached() throws ScrapingException, JsonProcessingException {
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(
            scrapingAdaptor.getIssue(Mockito.anyString(), Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(scrapingIssue);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssue.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);
    assertNotNull(cacheEntryList.getValue());
    assertEquals(1, cacheEntryList.getValue().size());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssue);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_KEY, cacheEntryList.getValue());
  }

  @Test
  public void testGetIssueCachedData() throws ScrapingException, JsonProcessingException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssue);

    final ScrapingIssue result =
        scrapingService.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_VALUE, ScrapingIssue.class);
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.any());
    Mockito.verify(scrapingAdaptor, Mockito.never())
        .getIssue(Mockito.anyString(), Mockito.anyInt(), Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test(expected = ScrapingException.class)
  public void testScrapeComicAndServiceThrowsException() throws ScrapingException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      scrapingService.scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, true);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testScrapeComicSkipCacheNoResult() throws ScrapingException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic);
    Mockito.when(scrapingAdaptor.getIssueDetails(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(null);

    scrapingService.scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingAdaptor, Mockito.times(1)).getIssueDetails(TEST_API_KEY, TEST_ISSUE_ID);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScrapingNotDone();
  }

  @Test
  public void testScrapeComicSkipCache()
      throws ScrapingException, ComicException, JsonProcessingException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic);
    Mockito.when(scrapingAdaptor.getIssueDetails(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(scrapingIssueDetails);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssueDetails.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());
    Mockito.when(comicService.save(Mockito.any(Comic.class))).thenReturn(savedComic);

    final Comic result =
        scrapingService.scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, true);

    assertNotNull(result);
    assertSame(savedComic, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingAdaptor, Mockito.times(1)).getIssueDetails(TEST_API_KEY, TEST_ISSUE_ID);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY, cacheEntryList.getValue());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .getFromCache(Mockito.anyString(), Mockito.anyString());
    Mockito.verify(comicService, Mockito.times(1)).save(loadedComic);

    this.verifyComicScraping();
  }

  @Test
  public void testScrapeComicNothingCached()
      throws ComicException, ScrapingException, JsonProcessingException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(scrapingAdaptor.getIssueDetails(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(scrapingIssueDetails);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any(ScrapingIssueDetails.class)))
        .thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), cacheEntryList.capture());
    Mockito.when(comicService.save(Mockito.any(Comic.class))).thenReturn(savedComic);

    final Comic result =
        scrapingService.scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComic, result);
    assertNotNull(cacheEntryList.getValue());
    assertFalse(cacheEntryList.getValue().isEmpty());
    assertEquals(TEST_ENCODED_VALUE, cacheEntryList.getValue().get(0));

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(scrapingAdaptor, Mockito.times(1)).getIssueDetails(TEST_API_KEY, TEST_ISSUE_ID);
    Mockito.verify(comicService, Mockito.times(1)).save(loadedComic);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScraping();
  }

  @Test
  public void testScrapeComicCachedDate()
      throws ComicException, JsonProcessingException, ScrapingException {
    cachedEntryList.add(TEST_ENCODED_VALUE);

    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(loadedComic);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(cachedEntryList);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssueDetails);
    Mockito.when(comicService.save(Mockito.any(Comic.class))).thenReturn(savedComic);

    final Comic result =
        scrapingService.scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, false);

    assertNotNull(result);
    assertSame(savedComic, result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(TEST_CACHE_SOURCE, TEST_ISSUE_DETAILS_KEY);
    Mockito.verify(scrapingAdaptor, Mockito.never())
        .getIssueDetails(Mockito.anyString(), Mockito.anyInt());
    Mockito.verify(comicService, Mockito.times(1)).save(loadedComic);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());

    this.verifyComicScraping();
  }

  private void verifyComicScrapingNotDone() {
    Mockito.verify(this.loadedComic, Mockito.never()).setPublisher(Mockito.anyString());
    Mockito.verify(this.loadedComic, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(this.loadedComic, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(this.loadedComic, Mockito.never()).setCoverDate(Mockito.any(Date.class));
    Mockito.verify(this.loadedComic, Mockito.never()).setDescription(Mockito.anyString());
  }

  private void verifyComicScraping() {
    Mockito.verify(this.loadedComic, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setCoverDate(TEST_COVER_DATE);
    Mockito.verify(this.loadedComic, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
  }
}
