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
import static org.junit.Assert.assertNotEquals;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
public class PageCacheServiceTest {
  private static final String TEST_MISSING_PAGE_HASH = "4C6DD238138491B89A3DB9BC6E3A3E2D";
  private static final String TEST_PAGE_HASH = "D5397C1B6053B093CB133CA3B7081C9E";
  private static final Integer TEST_PAGE_NUMBER = 17;
  private static final long TEST_PAGE_ID = 717L;
  private static final String TEST_PAGE_BASE_FILENAME = "page-7.jpg";
  private static final String TEST_PAGE_FILENAME = "src/test/resources/" + TEST_PAGE_BASE_FILENAME;
  private static final String TEST_MISSING_FILENAME = "/example.jpg";
  private static final String TEST_COMIC_FILENAME = "example-comic.cbz";

  @InjectMocks private PageCacheService service;
  @Mock private ComicPageService comicPageService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicPage page;
  @Mock private ComicPage savedPage;

  @Captor private ArgumentCaptor<byte[]> contentArgumentCaptor;

  private byte[] pageContent;
  private Set<String> pageHashList = new HashSet<>();

  @Before
  public void setUp() throws ComicPageException, AdaptorException, IOException {
    service.cacheDirectory = "target/test-classes/image-cache";
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_NUMBER);

    // clean up any remnant
    final File file = service.getFileForHash(TEST_MISSING_PAGE_HASH);
    if (file.exists()) {
      file.delete();
    }

    pageContent = FileUtils.readFileToByteArray(new File(TEST_PAGE_FILENAME));
    Mockito.when(comicPageService.getOneForHash(Mockito.anyString())).thenReturn(page);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(pageContent);
    Mockito.when(savedPage.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(savedPage.getFilename()).thenReturn(TEST_PAGE_BASE_FILENAME);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_BASE_FILENAME);
    Mockito.when(comicPageService.getComicFilenameForPage(Mockito.anyLong()))
        .thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(comicPageService.getPageFilename(Mockito.anyLong()))
        .thenReturn(TEST_PAGE_FILENAME);
  }

  @Test
  public void testFindByHashInvalidHash() {
    final byte[] result = service.findByHash(TEST_MISSING_PAGE_HASH.substring(1));

    assertNull(result);
  }

  @Test
  public void testFindByHashNotCached() {
    final byte[] result = service.findByHash(TEST_MISSING_PAGE_HASH);

    assertNull(result);
  }

  @Test
  public void testFindByHash() {
    final byte[] result = service.findByHash(TEST_PAGE_HASH);

    assertNotNull(result);
  }

  @Test
  public void testSaveByHash() {
    service.saveByHash(TEST_MISSING_PAGE_HASH, TEST_MISSING_PAGE_HASH.getBytes());

    assertTrue(service.getFileForHash(TEST_MISSING_PAGE_HASH).exists());
  }

  @Test
  public void testAddPageToCacheComicBookAdaptorException() throws AdaptorException {
    Mockito.when(page.getHash()).thenReturn(TEST_MISSING_PAGE_HASH);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    service.addPageToCache(page);

    assertFalse(service.getFileForHash(TEST_MISSING_PAGE_HASH).exists());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_NUMBER);
  }

  @Test
  public void testAddPageToCache() throws AdaptorException {
    Mockito.when(page.getHash()).thenReturn(TEST_MISSING_PAGE_HASH);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_MISSING_PAGE_HASH.getBytes());

    service.addPageToCache(page);

    assertTrue(service.getFileForHash(TEST_MISSING_PAGE_HASH).exists());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_NUMBER);
  }

  @Test
  public void testPrepareCoverPagesWithoutCacheEntries() {
    final String missingHash = StringUtils.reverse(TEST_PAGE_HASH);
    final File file = service.getFileForHash(missingHash);
    if (file.exists()) {
      file.delete();
    }

    pageHashList.clear();
    pageHashList.add(TEST_PAGE_HASH);
    pageHashList.add(missingHash);

    Mockito.when(comicPageService.findAllCoverPageHashes()).thenReturn(pageHashList);

    service.prepareCoverPagesWithoutCacheEntries();

    Mockito.verify(comicPageService, Mockito.times(1))
        .markCoverPagesToHaveCacheEntryCreated(missingHash);
    Mockito.verify(comicPageService, Mockito.never())
        .markCoverPagesToHaveCacheEntryCreated(TEST_PAGE_HASH);
  }

  @Test
  public void testGetPageContent_foundInPageCache() throws ComicPageException {
    final ResponseEntity<byte[]> result =
        service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME);

    assertNotNull(result);

    this.doCommonChecks(result, pageContent);
  }

  @Test
  public void testGetPageContent_pageNotFoundInCache() throws ComicPageException {
    final ResponseEntity<byte[]> result =
        service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME);

    assertNotNull(result);

    final byte[] content = result.getBody();

    this.doCommonChecks(result, content);
  }

  @Test(expected = ComicPageException.class)
  public void testGetPageContentForPageHashAdaptorException()
      throws ComicPageException, AdaptorException {
    Mockito.when(page.getHash()).thenReturn(null);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    try {
      service.getPageContent(TEST_PAGE_HASH, TEST_MISSING_FILENAME);
    } finally {
      Mockito.verify(comicPageService, Mockito.times(1)).getOneForHash(TEST_PAGE_HASH);
      Mockito.verify(comicPageService, Mockito.never())
          .updatePageContent(Mockito.any(), Mockito.any());
    }
  }

  @Test(expected = ComicPageException.class)
  public void testGetPageContentForPageHashNotFound() throws ComicPageException {
    Mockito.when(comicPageService.getOneForHash(Mockito.anyString())).thenReturn(null);

    try {
      service.getPageContent(TEST_PAGE_HASH, TEST_MISSING_FILENAME);
    } finally {
      Mockito.verify(comicPageService, Mockito.times(1)).getOneForHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testGetPageContentForPageHashInCache() throws ComicPageException {
    final ResponseEntity<byte[]> result =
        service.getPageContent(TEST_PAGE_HASH, TEST_MISSING_FILENAME);

    assertNotNull(result);

    this.doCommonChecks(result, pageContent);

    Mockito.verify(comicPageService, Mockito.times(1)).getOneForHash(TEST_PAGE_HASH);
  }

  @Test
  public void testGetPageContentForPageHashNotInCache() throws ComicPageException {
    Mockito.when(page.getHash()).thenReturn(null);
    Mockito.when(
            comicPageService.updatePageContent(
                Mockito.any(ComicPage.class), contentArgumentCaptor.capture()))
        .thenReturn(savedPage);

    final ResponseEntity<byte[]> result =
        service.getPageContent(TEST_PAGE_HASH, TEST_MISSING_FILENAME);

    assertNotNull(result);

    final byte[] content = contentArgumentCaptor.getValue();

    this.doCommonChecks(result, content);

    Mockito.verify(comicPageService, Mockito.times(1)).getOneForHash(TEST_PAGE_HASH);
    Mockito.verify(comicPageService, Mockito.times(1)).updatePageContent(page, content);
  }

  @Test(expected = ComicPageException.class)
  public void testGetPageContent_adaptorThrowsException()
      throws ComicPageException, AdaptorException {
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    try {
      service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME);
    } finally {
      Mockito.verify(comicPageService, Mockito.never())
          .updatePageContent(Mockito.any(), Mockito.any());
    }
  }

  @Test
  public void testGetPageContent_pageAdaptorLoadsNothing()
      throws ComicPageException, AdaptorException {
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    try {
      service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME);
    } finally {
      Mockito.verify(comicPageService, Mockito.never())
          .updatePageContent(Mockito.any(), Mockito.any());
    }
  }

  @Test(expected = ComicPageException.class)
  public void testGetPageContent_pageAdaptoReturnsNull_missingPageIsInvalid()
      throws ComicPageException, AdaptorException {
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    try {
      service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME.substring(1));
    } finally {
      Mockito.verify(comicPageService, Mockito.never())
          .updatePageContent(Mockito.any(), Mockito.any());
    }
  }

  private void doCommonChecks(final ResponseEntity<byte[]> result, final byte[] content) {
    assertEquals(content.length, result.getBody().length);
    assertNotEquals(
        -1, result.getHeaders().get("Content-Disposition").get(0).indexOf(TEST_PAGE_BASE_FILENAME));
  }
}
