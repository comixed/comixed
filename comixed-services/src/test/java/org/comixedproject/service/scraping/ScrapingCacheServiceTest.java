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

package org.comixedproject.service.scraping;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.scraping.ScrapingCache;
import org.comixedproject.model.scraping.ScrapingCacheEntry;
import org.comixedproject.repositories.scraping.ScrapingCacheRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ScrapingCacheServiceTest {
  private static final String TEST_SOURCE = "Source.Name";
  private static final String TEST_KEY = "Entry.Key";
  private static final Date TEST_EXPIRED_FETCH_DATE =
      new Date(System.currentTimeMillis() - 8L * 24L * 60L * 60L * 1000L);
  private static final Date TEST_UNEXPIRED_FETCH_DATE =
      new Date(System.currentTimeMillis() - 6L * 24L * 60L * 60L * 1000L);
  private static final String TEST_SCRAPING_CACHE_ENTRY = "This is the scraping cache entry value";

  @InjectMocks private ScrapingCacheService scrapingCacheService;
  @Mock private ScrapingCacheRepository scrapingCacheRepository;
  @Captor private ArgumentCaptor<ScrapingCache> scrapingCacheArgumentCaptor;
  @Mock private ScrapingCache existingScapingCache;
  @Mock private ScrapingCache scrapingCacheRecord;
  @Mock private ScrapingCacheEntry scrapingCacheEntry;

  private List<String> valuesList = new ArrayList<>();
  private List<ScrapingCacheEntry> scrapingCacheEntries = new ArrayList<>();

  @Test
  public void testSaveToCache() {
    for (int index = 0; index < 100; index++)
      valuesList.add(String.valueOf(System.currentTimeMillis()));

    Mockito.when(scrapingCacheRepository.getFromCache(Mockito.any(), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(scrapingCacheRepository.save(scrapingCacheArgumentCaptor.capture()))
        .thenReturn(scrapingCacheRecord);

    scrapingCacheService.saveToCache(TEST_SOURCE, TEST_KEY, valuesList);

    assertNotNull(scrapingCacheArgumentCaptor.getValue());
    final ScrapingCache cacheEntry = scrapingCacheArgumentCaptor.getValue();
    for (int index = 0; index < cacheEntry.getEntries().size(); index++) {
      final ScrapingCacheEntry entry = cacheEntry.getEntries().get(index);
      assertSame(cacheEntry, entry.getScrapingCache());
      assertEquals(index, entry.getEntryNumber().intValue());
      assertEquals(valuesList.get(index), entry.getEntryValue());
    }

    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(scrapingCacheRepository, Mockito.never()).delete(Mockito.any());
    Mockito.verify(scrapingCacheRepository, Mockito.times(1))
        .save(scrapingCacheArgumentCaptor.getValue());
  }

  @Test
  public void testSaveToCacheExistingEntry() {
    for (int index = 0; index < 100; index++)
      valuesList.add(String.valueOf(System.currentTimeMillis()));

    Mockito.when(scrapingCacheRepository.getFromCache(Mockito.any(), Mockito.anyString()))
        .thenReturn(existingScapingCache);
    Mockito.when(scrapingCacheRepository.save(scrapingCacheArgumentCaptor.capture()))
        .thenReturn(scrapingCacheRecord);

    scrapingCacheService.saveToCache(TEST_SOURCE, TEST_KEY, valuesList);

    assertNotNull(scrapingCacheArgumentCaptor.getValue());
    final ScrapingCache cacheEntry = scrapingCacheArgumentCaptor.getValue();
    for (int index = 0; index < cacheEntry.getEntries().size(); index++) {
      final ScrapingCacheEntry entry = cacheEntry.getEntries().get(index);
      assertSame(cacheEntry, entry.getScrapingCache());
      assertEquals(index, entry.getEntryNumber().intValue());
      assertEquals(valuesList.get(index), entry.getEntryValue());
    }

    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).delete(existingScapingCache);
    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).flush();
    Mockito.verify(scrapingCacheRepository, Mockito.times(1))
        .save(scrapingCacheArgumentCaptor.getValue());
  }

  @Test
  public void testGetFromCacheNoExistingEntry() {
    Mockito.when(scrapingCacheRepository.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    final List<String> result = this.scrapingCacheService.getFromCache(TEST_SOURCE, TEST_KEY);

    assertNull(result);

    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
  }

  @Test
  public void testGetFromCacheExpiredEntry() {
    Mockito.when(scrapingCacheRepository.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(existingScapingCache);
    Mockito.when(existingScapingCache.getFetched()).thenReturn(TEST_EXPIRED_FETCH_DATE);

    final List<String> result = this.scrapingCacheService.getFromCache(TEST_SOURCE, TEST_KEY);

    assertNull(result);

    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).delete(existingScapingCache);
  }

  @Test
  public void testGetFromCache() {
    for (int index = 0; index < 100; index++) scrapingCacheEntries.add(scrapingCacheEntry);

    Mockito.when(scrapingCacheRepository.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(existingScapingCache);
    Mockito.when(existingScapingCache.getFetched()).thenReturn(TEST_UNEXPIRED_FETCH_DATE);
    Mockito.when(existingScapingCache.getEntries()).thenReturn(scrapingCacheEntries);
    Mockito.when(scrapingCacheEntry.getEntryValue()).thenReturn(TEST_SCRAPING_CACHE_ENTRY);

    final List<String> result = this.scrapingCacheService.getFromCache(TEST_SOURCE, TEST_KEY);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(scrapingCacheEntries.size(), result.size());
    for (int index = 0; index < result.size(); index++) {
      assertEquals(TEST_SCRAPING_CACHE_ENTRY, result.get(index));
    }

    Mockito.verify(scrapingCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(scrapingCacheRepository, Mockito.never()).delete(Mockito.any());
  }
}
