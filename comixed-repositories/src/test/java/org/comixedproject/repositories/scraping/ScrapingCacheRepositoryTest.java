/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.repositories.scraping;

import static junit.framework.TestCase.*;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import org.comixedproject.model.scraping.ScrapingCache;
import org.comixedproject.model.scraping.ScrapingCacheEntry;
import org.comixedproject.repositories.RepositoryContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:application.properties")
@DatabaseSetup("classpath:test-database.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class ScrapingCacheRepositoryTest {
  private static final String TEST_SOURCE = "ComicVine";
  private static final String TEST_CACHE_KEY = "volumes[Iron Man]";
  private static final String TEST_NEW_ENTRY_CACHE_KEY = "volumes[The Avengers]";

  @Autowired private ScrapingCacheRepository scrapingCacheRepository;

  @Test
  public void testGetFromCacheNonexistent() {
    final ScrapingCache result =
        this.scrapingCacheRepository.getFromCache(TEST_SOURCE, TEST_CACHE_KEY.substring(1));

    assertNull(result);
  }

  @Test
  public void testGetFromCache() {
    final ScrapingCache result =
        this.scrapingCacheRepository.getFromCache(TEST_SOURCE, TEST_CACHE_KEY);

    assertNotNull(result);
    assertEquals(TEST_SOURCE, result.getSource());
    assertEquals(TEST_CACHE_KEY, result.getCacheKey());
    assertFalse(result.getEntries().isEmpty());
    for (int index = 0; index < result.getEntries().size(); index++) {
      final ScrapingCacheEntry entry = result.getEntries().get(index);
      assertEquals(index, entry.getEntryNumber().intValue());
      assertEquals(String.format("cached-value-%d", index), entry.getEntryValue());
    }
  }

  @Test
  public void testSaveToCache() {
    final ScrapingCache entry = new ScrapingCache();
    entry.setSource(TEST_SOURCE);
    entry.setCacheKey(TEST_NEW_ENTRY_CACHE_KEY);
    for (int index = 0; index < 100; index++) {
      final ScrapingCacheEntry value = new ScrapingCacheEntry();
      value.setEntryNumber(index);
      value.setEntryValue(String.valueOf(System.currentTimeMillis()));
      value.setScrapingCache(entry);
      entry.getEntries().add(value);
    }

    this.scrapingCacheRepository.save(entry);

    final ScrapingCache result =
        this.scrapingCacheRepository.getFromCache(TEST_SOURCE, TEST_NEW_ENTRY_CACHE_KEY);

    assertNotNull(result);
    assertEquals(TEST_SOURCE, result.getSource());
    assertEquals(TEST_NEW_ENTRY_CACHE_KEY, result.getCacheKey());
    assertFalse(result.getEntries().isEmpty());
    for (int index = 0; index < entry.getEntries().size(); index++) {
      assertEquals(index, result.getEntries().get(index).getEntryNumber().intValue());
      assertEquals(
          entry.getEntries().get(index).getEntryValue(),
          result.getEntries().get(index).getEntryValue());
    }
  }
}
