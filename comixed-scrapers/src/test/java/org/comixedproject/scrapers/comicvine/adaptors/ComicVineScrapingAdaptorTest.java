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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.scrapers.comicvine.adaptors;

import static junit.framework.TestCase.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.adaptors.ImprintAdaptor;
import org.comixedproject.scrapers.comicvine.actions.ComicVineGetIssuesAction;
import org.comixedproject.scrapers.comicvine.actions.ComicVineGetVolumesAction;
import org.comixedproject.scrapers.comicvine.actions.ComicVineScrapeComicAction;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.scraping.ScrapingCacheService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineScrapingAdaptorTest {
  private static final Random RANDOM = new Random();
  private static final String TEST_API_KEY = "TEST.API.KEY";
  private static final String TEST_SERIES_NAME = "Super Awesome Comic";
  private static final String TEST_ENCODED_VALUE = "This is the encoded value";
  private static final Integer TEST_VOLUME_ID = RANDOM.nextInt();
  private static final String TEST_ISSUE_NUMBER = "17";
  private static final String TEST_ISSUE_ID = "327";
  private static final String TEST_PUBLISHER = "Publisher Name";
  private static final String TEST_VOLUME = "2020";
  private static final Date TEST_COVER_DATE = new Date();
  private static final String TEST_DESCRIPTION = "This is the comic's description";

  @InjectMocks private ComicVineScrapingAdaptor scrapingAdaptor;
  @Mock private ObjectFactory<ComicVineGetVolumesAction> getVolumesActionObjectFactory;
  @Mock private ComicVineGetVolumesAction getVolumesAction;
  @Mock private ObjectFactory<ComicVineGetIssuesAction> getIssuesActionObjectFactory;
  @Mock private ComicVineGetIssuesAction getIssuesAction;
  @Mock private ObjectFactory<ComicVineScrapeComicAction> scrapeComicActionObjectFactory;
  @Mock private ComicVineScrapeComicAction scrapeComicAction;
  @Mock private ScrapingVolume scrapingVolume;
  @Mock private ScrapingIssue scrapingIssue;
  @Mock private ObjectMapper objectMapper;
  @Mock private ScrapingCacheService scrapingCacheService;
  @Captor private ArgumentCaptor<List<String>> valuesArgumentCaptor;
  @Mock private Comic comic;
  @Mock private ScrapingIssueDetails scrapingIssueDetails;
  @Mock private ImprintAdaptor imprintAdaptor;

  private List<ScrapingVolume> scrapingVolumeList = new ArrayList<>();
  private List<ScrapingIssue> scrapingIssueList = new ArrayList<>();
  private List<String> entries = new ArrayList<>();
  private List<ScrapingIssueDetails> comicWithDetailsList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(scrapingIssueDetails.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(scrapingIssueDetails.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(scrapingIssueDetails.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(scrapingIssueDetails.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(scrapingIssueDetails.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(scrapingIssueDetails.getDescription()).thenReturn(TEST_DESCRIPTION);
  }

  @Test
  public void testGetVolumesSkipCacheNoResults() throws ScrapingException, JsonProcessingException {
    Mockito.when(getVolumesActionObjectFactory.getObject()).thenReturn(getVolumesAction);
    Mockito.when(getVolumesAction.execute()).thenReturn(scrapingVolumeList);

    final List<ScrapingVolume> result =
        scrapingAdaptor.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, true);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(getVolumesAction, Mockito.times(1))
        .setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetVolumesSkipCache() throws ScrapingException, JsonProcessingException {
    for (int index = 0; index < 200; index++) scrapingVolumeList.add(scrapingVolume);

    Mockito.when(getVolumesActionObjectFactory.getObject()).thenReturn(getVolumesAction);
    Mockito.when(getVolumesAction.execute()).thenReturn(scrapingVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), valuesArgumentCaptor.capture());

    final List<ScrapingVolume> result =
        scrapingAdaptor.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, true);

    assertNotNull(result);
    assertEquals(scrapingVolumeList.size(), result.size());

    Mockito.verify(getVolumesAction, Mockito.times(1))
        .setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(objectMapper, Mockito.times(scrapingVolumeList.size()))
        .writeValueAsString(scrapingVolume);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getVolumeKey(TEST_SERIES_NAME),
            valuesArgumentCaptor.getValue());
  }

  @Test
  public void testGetVolumesNoCachedData() throws ScrapingException, JsonProcessingException {
    for (int index = 0; index < 200; index++) scrapingVolumeList.add(scrapingVolume);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(getVolumesActionObjectFactory.getObject()).thenReturn(getVolumesAction);
    Mockito.when(getVolumesAction.execute()).thenReturn(scrapingVolumeList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), valuesArgumentCaptor.capture());

    final List<ScrapingVolume> result =
        scrapingAdaptor.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, false);

    assertNotNull(result);
    assertEquals(scrapingVolumeList.size(), result.size());

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(
            ComicVineScrapingAdaptor.CACHE_KEY, scrapingAdaptor.getVolumeKey(TEST_SERIES_NAME));
    Mockito.verify(getVolumesAction, Mockito.times(1))
        .setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(objectMapper, Mockito.times(scrapingVolumeList.size()))
        .writeValueAsString(scrapingVolume);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getVolumeKey(TEST_SERIES_NAME),
            valuesArgumentCaptor.getValue());
  }

  @Test
  public void testGetVolumesWithCachedData() throws ScrapingException, JsonProcessingException {
    for (int index = 0; index < 25; index++) entries.add(TEST_ENCODED_VALUE);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(entries);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingVolume);

    final List<ScrapingVolume> result =
        scrapingAdaptor.getVolumes(TEST_API_KEY, TEST_SERIES_NAME, false);

    assertNotNull(result);
    assertEquals(entries.size(), result.size());
    for (int index = 0; index < result.size(); index++)
      assertSame(scrapingVolume, result.get(index));

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(
            ComicVineScrapingAdaptor.CACHE_KEY, scrapingAdaptor.getVolumeKey(TEST_SERIES_NAME));
    Mockito.verify(objectMapper, Mockito.times(entries.size()))
        .readValue(TEST_ENCODED_VALUE, ScrapingVolume.class);
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetIssuesSkipCacheNoResults() throws ScrapingException, JsonProcessingException {
    Mockito.when(getIssuesActionObjectFactory.getObject()).thenReturn(getIssuesAction);
    Mockito.when(getIssuesAction.execute()).thenReturn(scrapingIssueList);

    final ScrapingIssue result =
        scrapingAdaptor.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNull(result);

    Mockito.verify(getIssuesAction, Mockito.times(1)).setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(getIssuesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssuesAction, Mockito.times(1)).setVolumeId(TEST_VOLUME_ID);
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetIssuesSkipCache() throws ScrapingException, JsonProcessingException {
    scrapingIssueList.add(scrapingIssue);

    Mockito.when(getIssuesActionObjectFactory.getObject()).thenReturn(getIssuesAction);
    Mockito.when(getIssuesAction.execute()).thenReturn(scrapingIssueList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), valuesArgumentCaptor.capture());

    final ScrapingIssue result =
        scrapingAdaptor.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, true);

    assertNotNull(result);
    assertSame(scrapingIssue, result);

    Mockito.verify(getIssuesAction, Mockito.times(1)).setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(getIssuesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssuesAction, Mockito.times(1)).setVolumeId(TEST_VOLUME_ID);
    Mockito.verify(objectMapper, Mockito.times(scrapingIssueList.size()))
        .writeValueAsString(scrapingIssue);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getIssuesKey(TEST_VOLUME_ID, TEST_ISSUE_NUMBER),
            valuesArgumentCaptor.getValue());
  }

  @Test
  public void testGetIssuesNoCachedData() throws ScrapingException, JsonProcessingException {
    scrapingIssueList.add(scrapingIssue);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(getIssuesActionObjectFactory.getObject()).thenReturn(getIssuesAction);
    Mockito.when(getIssuesAction.execute()).thenReturn(scrapingIssueList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), valuesArgumentCaptor.capture());

    final ScrapingIssue result =
        scrapingAdaptor.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);
    final List<String> valuesArgument = valuesArgumentCaptor.getValue();
    assertNotNull(valuesArgument);
    assertFalse(valuesArgument.isEmpty());
    for (int index = 0; index < valuesArgument.size(); index++) {
      assertEquals(TEST_ENCODED_VALUE, valuesArgument.get(index));
    }

    Mockito.verify(getIssuesAction, Mockito.times(1)).setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(getIssuesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssuesAction, Mockito.times(1)).setVolumeId(TEST_VOLUME_ID);
    Mockito.verify(objectMapper, Mockito.times(scrapingIssueList.size()))
        .writeValueAsString(scrapingIssue);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getIssuesKey(TEST_VOLUME_ID, TEST_ISSUE_NUMBER),
            valuesArgumentCaptor.getValue());
  }

  @Test
  public void testGetIssuesWithCachedData() throws ScrapingException, JsonProcessingException {
    entries.add(TEST_ENCODED_VALUE);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(entries);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssue);

    final ScrapingIssue result =
        scrapingAdaptor.getIssue(TEST_API_KEY, TEST_VOLUME_ID, TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getIssuesKey(TEST_VOLUME_ID, TEST_ISSUE_NUMBER));
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetIssuesIssueNumberHasLeadingZeroes()
      throws ScrapingException, JsonProcessingException {
    entries.add(TEST_ENCODED_VALUE);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(entries);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssue);

    final ScrapingIssue result =
        scrapingAdaptor.getIssue(TEST_API_KEY, TEST_VOLUME_ID, "0000" + TEST_ISSUE_NUMBER, false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getIssuesKey(TEST_VOLUME_ID, TEST_ISSUE_NUMBER));
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testGetIssuesIssueNumberIsZero() throws ScrapingException, JsonProcessingException {
    entries.add(TEST_ENCODED_VALUE);

    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(entries);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssue);

    final ScrapingIssue result =
        scrapingAdaptor.getIssue(TEST_API_KEY, TEST_VOLUME_ID, "000", false);

    assertNotNull(result);
    assertSame(scrapingIssue, result);

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(
            ComicVineScrapingAdaptor.CACHE_KEY, scrapingAdaptor.getIssuesKey(TEST_VOLUME_ID, "0"));
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testScrapeComicSkipCacheNoResults()
      throws ScrapingException, JsonProcessingException {
    Mockito.when(scrapeComicActionObjectFactory.getObject()).thenReturn(scrapeComicAction);
    Mockito.when(scrapeComicAction.execute()).thenReturn(null);

    scrapingAdaptor.scrapeComic(TEST_API_KEY, TEST_ISSUE_ID, true, comic);

    this.verifyComicScrapingNotDone();

    Mockito.verify(scrapeComicAction, Mockito.times(1))
        .setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(scrapeComicAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(scrapeComicAction, Mockito.times(1)).setIssueId(TEST_ISSUE_ID);
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  @Test
  public void testScrapeComicSkipCache() throws ScrapingException, JsonProcessingException {
    Mockito.when(scrapeComicActionObjectFactory.getObject()).thenReturn(scrapeComicAction);
    Mockito.when(scrapeComicAction.execute()).thenReturn(scrapingIssueDetails);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), valuesArgumentCaptor.capture());

    scrapingAdaptor.scrapeComic(TEST_API_KEY, TEST_ISSUE_ID, true, comic);

    this.verifyComicScraping(comic);

    Mockito.verify(scrapeComicAction, Mockito.times(1))
        .setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(scrapeComicAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(scrapeComicAction, Mockito.times(1)).setIssueId(TEST_ISSUE_ID);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssueDetails);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getComicDetailsKey(TEST_ISSUE_ID),
            valuesArgumentCaptor.getValue());
  }

  @Test
  public void testScrapeComicNoCachedData() throws ScrapingException, JsonProcessingException {
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(entries);
    Mockito.when(scrapeComicActionObjectFactory.getObject()).thenReturn(scrapeComicAction);
    Mockito.when(scrapeComicAction.execute()).thenReturn(scrapingIssueDetails);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenReturn(TEST_ENCODED_VALUE);
    Mockito.doNothing()
        .when(scrapingCacheService)
        .saveToCache(Mockito.anyString(), Mockito.anyString(), valuesArgumentCaptor.capture());

    scrapingAdaptor.scrapeComic(TEST_API_KEY, TEST_ISSUE_ID, false, comic);

    this.verifyComicScraping(comic);

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(
            ComicVineScrapingAdaptor.CACHE_KEY, scrapingAdaptor.getComicDetailsKey(TEST_ISSUE_ID));
    Mockito.verify(scrapeComicAction, Mockito.times(1))
        .setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(scrapeComicAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(scrapeComicAction, Mockito.times(1)).setIssueId(TEST_ISSUE_ID);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(scrapingIssueDetails);
    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .saveToCache(
            ComicVineScrapingAdaptor.CACHE_KEY,
            scrapingAdaptor.getComicDetailsKey(TEST_ISSUE_ID),
            valuesArgumentCaptor.getValue());
  }

  @Test
  public void testScrapeComicWithCachedData() throws ScrapingException, JsonProcessingException {
    entries.add(TEST_ENCODED_VALUE);
    Mockito.when(scrapingCacheService.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(entries);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(scrapingIssueDetails);

    scrapingAdaptor.scrapeComic(TEST_API_KEY, TEST_ISSUE_ID, false, comic);

    this.verifyComicScraping(comic);

    Mockito.verify(scrapingCacheService, Mockito.times(1))
        .getFromCache(
            ComicVineScrapingAdaptor.CACHE_KEY, scrapingAdaptor.getComicDetailsKey(TEST_ISSUE_ID));
    Mockito.verify(scrapeComicAction, Mockito.never()).execute();
    Mockito.verify(objectMapper, Mockito.never()).writeValueAsString(Mockito.anyString());
    Mockito.verify(scrapingCacheService, Mockito.never())
        .saveToCache(Mockito.anyString(), Mockito.anyString(), Mockito.anyList());
  }

  private void verifyComicScrapingNotDone() {
    Mockito.verify(comic, Mockito.never()).setPublisher(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setCoverDate(Mockito.any(Date.class));
    Mockito.verify(comic, Mockito.never()).setDescription(Mockito.anyString());
  }

  private void verifyComicScraping(final Comic comic) {
    Mockito.verify(this.comic, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(this.comic, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(this.comic, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(this.comic, Mockito.times(1)).setCoverDate(TEST_COVER_DATE);
    Mockito.verify(this.comic, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
  }
}
