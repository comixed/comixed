/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.service.comicpages;

import static junit.framework.TestCase.*;

import java.io.File;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PageCacheServiceTest {
  private static final String TEST_MISSING_PAGE_HASH = "4C6DD238138491B89A3DB9BC6E3A3E2D";
  private static final String TEST_PAGE_HASH = "D5397C1B6053B093CB133CA3B7081C9E";
  private static final Integer TEST_PAGE_NUMBER = 17;

  @InjectMocks private PageCacheService pageCacheService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private Page page;

  @Before
  public void setUp() {
    pageCacheService.cacheDirectory = "target/test-classes/image-cache";
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_NUMBER);

    // clean up any remnant
    final File file = pageCacheService.getFileForHash(TEST_MISSING_PAGE_HASH);
    if (file.exists()) {
      file.delete();
    }
  }

  @Test
  public void testFindByHashInvalidHash() {
    final byte[] result = pageCacheService.findByHash(TEST_MISSING_PAGE_HASH.substring(1));

    assertNull(result);
  }

  @Test
  public void testFindByHashNotCached() {
    final byte[] result = pageCacheService.findByHash(TEST_MISSING_PAGE_HASH);

    assertNull(result);
  }

  @Test
  public void testFindByHash() {
    final byte[] result = pageCacheService.findByHash(TEST_PAGE_HASH);

    assertNotNull(result);
  }

  @Test
  public void testSaveByHash() {
    pageCacheService.saveByHash(TEST_MISSING_PAGE_HASH, TEST_MISSING_PAGE_HASH.getBytes());

    assertTrue(pageCacheService.getFileForHash(TEST_MISSING_PAGE_HASH).exists());
  }

  @Test
  public void testAddPageToCacheComicBookAdaptorException() throws AdaptorException {
    Mockito.when(page.getHash()).thenReturn(TEST_MISSING_PAGE_HASH);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    pageCacheService.addPageToCache(page);

    assertFalse(pageCacheService.getFileForHash(TEST_MISSING_PAGE_HASH).exists());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_NUMBER);
  }

  @Test
  public void testAddPageToCache() throws AdaptorException {
    Mockito.when(page.getHash()).thenReturn(TEST_MISSING_PAGE_HASH);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_MISSING_PAGE_HASH.getBytes());

    pageCacheService.addPageToCache(page);

    assertTrue(pageCacheService.getFileForHash(TEST_MISSING_PAGE_HASH).exists());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_NUMBER);
  }
}
