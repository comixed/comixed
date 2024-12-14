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

package org.comixedproject.service.metadata;

import static junit.framework.TestCase.*;
import static org.comixedproject.service.admin.ConfigurationService.CFG_METADATA_CACHE_EXPIRATION_DAYS;
import static org.comixedproject.service.metadata.MetadataCacheService.MAX_EXPIRATION_DAYS;
import static org.comixedproject.service.metadata.MetadataCacheService.MIN_EXPIRATION_DAYS;
import static org.junit.Assert.assertNotEquals;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.metadata.MetadataCache;
import org.comixedproject.model.metadata.MetadataCacheEntry;
import org.comixedproject.repositories.metadata.MetadataCacheRepository;
import org.comixedproject.service.admin.ConfigurationService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MetadataCacheServiceTest {
  private static final String TEST_SOURCE = "Source.Name";
  private static final String TEST_KEY = "Entry.Key";
  private static final long TEST_EXPIRATION_DAYS = 14L;
  private static final Date TEST_EXPIRED_CREATED_ON_DATE =
      new Date(System.currentTimeMillis() - TEST_EXPIRATION_DAYS * 24L * 60L * 60L * 1000L);
  private static final Date TEST_UNEXPECTED_CREATED_ON_DATE =
      new Date(System.currentTimeMillis() - 6L * 24L * 60L * 60L * 1000L);
  private static final String TEST_SCRAPING_CACHE_ENTRY = "This is the scraping cache entry value";

  @InjectMocks private MetadataCacheService service;
  @Mock private MetadataCacheRepository metadataCacheRepository;
  @Mock private ConfigurationService configurationService;
  @Captor private ArgumentCaptor<MetadataCache> scrapingCacheArgumentCaptor;
  @Mock private MetadataCache existingScapingCache;
  @Mock private MetadataCache metadataCacheRecord;
  @Mock private MetadataCacheEntry metadataCacheEntry;

  private List<String> valuesList = new ArrayList<>();
  private List<MetadataCacheEntry> scrapingCacheEntries = new ArrayList<>();

  @Before
  public void setUp() {
    service.expirationDays = TEST_EXPIRATION_DAYS;
  }

  @Test
  public void testAfterPropertiesSet_noPropertyFound() throws Exception {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString(), Mockito.anyString()))
        .thenAnswer(input -> input.getArguments()[1]);

    service.expirationDays = 0L;

    service.afterPropertiesSet();

    assertNotEquals(0L, service.expirationDays);

    Mockito.verify(configurationService, Mockito.times(1)).addConfigurationChangedListener(service);
  }

  @Test
  public void testAfterPropertiesSet_tooSmall() throws Exception {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(String.valueOf(MIN_EXPIRATION_DAYS - 1));

    service.expirationDays = 0L;

    service.afterPropertiesSet();

    assertEquals(MIN_EXPIRATION_DAYS, service.expirationDays);

    Mockito.verify(configurationService, Mockito.times(1)).addConfigurationChangedListener(service);
  }

  @Test
  public void testAfterPropertiesSet_tooLarge() throws Exception {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(String.valueOf(MAX_EXPIRATION_DAYS + 1));

    service.expirationDays = 0L;

    service.afterPropertiesSet();

    assertEquals(MAX_EXPIRATION_DAYS, service.expirationDays);

    Mockito.verify(configurationService, Mockito.times(1)).addConfigurationChangedListener(service);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(String.valueOf(TEST_EXPIRATION_DAYS));

    service.afterPropertiesSet();

    assertEquals(TEST_EXPIRATION_DAYS, service.expirationDays);

    Mockito.verify(configurationService, Mockito.times(1)).addConfigurationChangedListener(service);
  }

  @Test
  public void testConfigurationChanged_unknownSetting() {
    service.expirationDays = TEST_EXPIRATION_DAYS;

    service.optionChanged("NOT-EXPIRATION-DAYS", String.valueOf(TEST_EXPIRATION_DAYS + 1));

    assertEquals(TEST_EXPIRATION_DAYS, service.expirationDays);
  }

  @Test
  public void testConfigurationChanged_valueTooLarge() {
    service.expirationDays = TEST_EXPIRATION_DAYS;

    service.optionChanged(
        CFG_METADATA_CACHE_EXPIRATION_DAYS, String.valueOf(MAX_EXPIRATION_DAYS + 1));

    assertEquals(MAX_EXPIRATION_DAYS, service.expirationDays);
  }

  @Test
  public void testConfigurationChanged_valueTooSmall() {
    service.expirationDays = TEST_EXPIRATION_DAYS;

    service.optionChanged(
        CFG_METADATA_CACHE_EXPIRATION_DAYS, String.valueOf(MIN_EXPIRATION_DAYS - 1));

    assertEquals(MIN_EXPIRATION_DAYS, service.expirationDays);
  }

  @Test
  public void testConfigurationChanged() {
    service.expirationDays = TEST_EXPIRATION_DAYS;

    service.optionChanged(
        CFG_METADATA_CACHE_EXPIRATION_DAYS, String.valueOf(TEST_EXPIRATION_DAYS + 1));

    assertEquals(TEST_EXPIRATION_DAYS + 1, service.expirationDays);
  }

  @Test
  public void testSaveToCache() {
    for (int index = 0; index < 100; index++)
      valuesList.add(String.valueOf(System.currentTimeMillis()));

    Mockito.when(metadataCacheRepository.getFromCache(Mockito.any(), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(metadataCacheRepository.save(scrapingCacheArgumentCaptor.capture()))
        .thenReturn(metadataCacheRecord);

    service.saveToCache(TEST_SOURCE, TEST_KEY, valuesList);

    assertNotNull(scrapingCacheArgumentCaptor.getValue());
    final MetadataCache cacheEntry = scrapingCacheArgumentCaptor.getValue();
    for (int index = 0; index < cacheEntry.getEntries().size(); index++) {
      final MetadataCacheEntry entry = cacheEntry.getEntries().get(index);
      assertSame(cacheEntry, entry.getMetadataCache());
      assertEquals(index, entry.getEntryNumber().intValue());
      assertEquals(valuesList.get(index), entry.getEntryValue());
    }

    Mockito.verify(metadataCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(metadataCacheRepository, Mockito.never()).delete(Mockito.any());
    Mockito.verify(metadataCacheRepository, Mockito.times(1))
        .save(scrapingCacheArgumentCaptor.getValue());
  }

  @Test
  public void testSaveToCache_existingEntry() {
    for (int index = 0; index < 100; index++)
      valuesList.add(String.valueOf(System.currentTimeMillis()));

    Mockito.when(metadataCacheRepository.getFromCache(Mockito.any(), Mockito.anyString()))
        .thenReturn(existingScapingCache);
    Mockito.when(metadataCacheRepository.save(scrapingCacheArgumentCaptor.capture()))
        .thenReturn(metadataCacheRecord);

    service.saveToCache(TEST_SOURCE, TEST_KEY, valuesList);

    assertNotNull(scrapingCacheArgumentCaptor.getValue());
    final MetadataCache cacheEntry = scrapingCacheArgumentCaptor.getValue();
    for (int index = 0; index < cacheEntry.getEntries().size(); index++) {
      final MetadataCacheEntry entry = cacheEntry.getEntries().get(index);
      assertSame(cacheEntry, entry.getMetadataCache());
      assertEquals(index, entry.getEntryNumber().intValue());
      assertEquals(valuesList.get(index), entry.getEntryValue());
    }

    Mockito.verify(metadataCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(metadataCacheRepository, Mockito.times(1)).delete(existingScapingCache);
    Mockito.verify(metadataCacheRepository, Mockito.times(1)).flush();
    Mockito.verify(metadataCacheRepository, Mockito.times(1))
        .save(scrapingCacheArgumentCaptor.getValue());
  }

  @Test
  public void testGetFromCache_noExistingEntry() {
    Mockito.when(metadataCacheRepository.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    final List<String> result = this.service.getFromCache(TEST_SOURCE, TEST_KEY);

    assertNull(result);

    Mockito.verify(metadataCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
  }

  @Test
  public void testGetFromCache_expiredEntry() {
    Mockito.when(metadataCacheRepository.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(existingScapingCache);
    Mockito.when(existingScapingCache.getCreatedOn()).thenReturn(TEST_EXPIRED_CREATED_ON_DATE);

    final List<String> result = this.service.getFromCache(TEST_SOURCE, TEST_KEY);

    assertNull(result);

    Mockito.verify(metadataCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(metadataCacheRepository, Mockito.times(1)).delete(existingScapingCache);
  }

  @Test
  public void testGetFromCache() {
    for (int index = 0; index < 100; index++) scrapingCacheEntries.add(metadataCacheEntry);

    Mockito.when(metadataCacheRepository.getFromCache(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(existingScapingCache);
    Mockito.when(existingScapingCache.getCreatedOn()).thenReturn(TEST_UNEXPECTED_CREATED_ON_DATE);
    Mockito.when(existingScapingCache.getEntries()).thenReturn(scrapingCacheEntries);
    Mockito.when(metadataCacheEntry.getEntryValue()).thenReturn(TEST_SCRAPING_CACHE_ENTRY);

    final List<String> result = this.service.getFromCache(TEST_SOURCE, TEST_KEY);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(scrapingCacheEntries.size(), result.size());
    for (int index = 0; index < result.size(); index++) {
      assertEquals(TEST_SCRAPING_CACHE_ENTRY, result.get(index));
    }

    Mockito.verify(metadataCacheRepository, Mockito.times(1)).getFromCache(TEST_SOURCE, TEST_KEY);
    Mockito.verify(metadataCacheRepository, Mockito.never()).delete(Mockito.any());
  }

  @Test
  public void testClearCache() {
    service.clearCache();

    Mockito.verify(metadataCacheRepository, Mockito.times(1)).deleteAll();
  }
}
