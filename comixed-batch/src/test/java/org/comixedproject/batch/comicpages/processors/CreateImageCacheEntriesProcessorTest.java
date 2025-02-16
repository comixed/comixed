/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicpages.processors;

import static org.junit.Assert.*;

import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.service.comicpages.PageCacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreateImageCacheEntriesProcessorTest {
  private static final String TEST_PAGE_HASH = "0123456789ABCDEF0123456789ABCDEF";

  @InjectMocks private CreateImageCacheEntriesProcessor processor;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicPage page;

  private byte[] cachedPage = "THis is the cached page".getBytes();

  @BeforeEach
  public void setUp() {
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
  }

  @Test
  void process_imageAlreadyCached() {
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(cachedPage);

    final String result = processor.process(page);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, result);

    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  void process_imageNotFound() {
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);

    final String result = processor.process(page);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, result);

    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1)).addPageToCache(page);
  }
}
