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
import static org.junit.Assert.assertThrows;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PageCacheServiceTest {
  private static final String TEST_MISSING_PAGE_HASH = "4C6DD238138491B89A3DB9BC6E3A3E2D";
  private static final String TEST_PAGE_HASH = "D5397C1B6053B093CB133CA3B7081C9E";
  private static final Integer TEST_PAGE_NUMBER = 17;
  private static final long TEST_PAGE_ID = 717L;
  private static final String TEST_PAGE_BASE_FILENAME = "page-7.jpg";
  private static final String TEST_PAGE_FILENAME = "src/test/resources/" + TEST_PAGE_BASE_FILENAME;
  private static final String TEST_MISSING_FILENAME = "/example.jpg";
  private static final String TEST_COMIC_FILENAME = "example-comic.cbz";
  private static final String TEST_CONTENT_TYPE = "application";
  private static final String TEST_CONTENT_SUBTYPE = "binary";

  @InjectMocks private PageCacheService service;
  @Mock private ComicPageService comicPageService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicPage page;
  @Mock private ComicPage savedPage;

  @Captor private ArgumentCaptor<byte[]> contentArgumentCaptor;
  @Captor private ArgumentCaptor<InputStream> inputStreamArgumentCaptor;

  private byte[] pageContent;
  private Set<String> pageHashList = new HashSet<>();

  @BeforeEach
  public void setUp() throws ComicPageException, AdaptorException, IOException {
    service.cacheDirectory = "target/test-classes/image-cache";
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_NUMBER);
    Mockito.when(fileTypeAdaptor.getType(inputStreamArgumentCaptor.capture()))
        .thenReturn(TEST_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStreamArgumentCaptor.capture()))
        .thenReturn(TEST_CONTENT_SUBTYPE);

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
  void findByHash_invalidHash() {
    final byte[] result = service.findByHash(TEST_MISSING_PAGE_HASH.substring(1));

    assertNull(result);
  }

  @Test
  void findByHash_notCached() {
    final byte[] result = service.findByHash(TEST_MISSING_PAGE_HASH);

    assertNull(result);
  }

  @Test
  void findByHash() {
    final byte[] result = service.findByHash(TEST_PAGE_HASH);

    assertNotNull(result);
  }

  @Test
  void saveByHash() {
    service.saveByHash(TEST_MISSING_PAGE_HASH, TEST_MISSING_PAGE_HASH.getBytes());

    assertTrue(service.getFileForHash(TEST_MISSING_PAGE_HASH).exists());
  }

  @Test
  void saveByHash_withoutHash() {
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PAGE_HASH);

    service.saveByHash(null, TEST_MISSING_PAGE_HASH.getBytes());

    assertTrue(service.getFileForHash(TEST_PAGE_HASH).exists());
  }

  @Test
  void addPageToCache_comicBookAdaptorException() throws AdaptorException {
    Mockito.when(page.getHash()).thenReturn(TEST_MISSING_PAGE_HASH);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    service.addPageToCache(page);

    assertFalse(service.getFileForHash(TEST_MISSING_PAGE_HASH).exists());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_NUMBER);
  }

  @Test
  void addPageToCache() throws AdaptorException {
    Mockito.when(page.getHash()).thenReturn(TEST_MISSING_PAGE_HASH);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_MISSING_PAGE_HASH.getBytes());

    service.addPageToCache(page);

    assertTrue(service.getFileForHash(TEST_MISSING_PAGE_HASH).exists());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_NUMBER);
  }

  @Test
  void prepareCoverPagesWithoutCacheEntries() {
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
  void getPageContent_foundInPageCache() throws ComicPageException {
    final ResponseEntity<byte[]> result =
        service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME);

    assertNotNull(result);

    this.doCommonChecks(result, pageContent);
  }

  @Test
  void getPageContent_pageNotFoundInCache() throws ComicPageException {
    final ResponseEntity<byte[]> result =
        service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME);

    assertNotNull(result);

    this.doCommonChecks(result, pageContent);
  }

  @Test
  void getPageContentForPageHashAdaptorException() throws AdaptorException {
    Mockito.when(page.getHash()).thenReturn(null);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    assertThrows(
        ComicPageException.class,
        () -> service.getPageContent(TEST_PAGE_HASH, TEST_MISSING_FILENAME));
  }

  @Test
  void GetPageContentForPageHashNotFound() {
    Mockito.when(comicPageService.getOneForHash(Mockito.anyString())).thenReturn(null);

    assertThrows(
        ComicPageException.class,
        () -> service.getPageContent(TEST_PAGE_HASH, TEST_MISSING_FILENAME));
  }

  @Test
  void getPageContent_pageHashInCache() throws ComicPageException {
    final ResponseEntity<byte[]> result =
        service.getPageContent(TEST_PAGE_HASH, TEST_MISSING_FILENAME);

    assertNotNull(result);

    Mockito.verify(comicPageService, Mockito.times(1)).getOneForHash(TEST_PAGE_HASH);
  }

  @Test
  void getPageContent_pageHashNotInCache() throws ComicPageException {
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

  @Test
  void getPageContent_adaptorThrowsException() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    assertThrows(
        ComicPageException.class,
        () -> service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME));
  }

  @Test
  void getPageContent_pageAdaptorLoadsNothing() throws ComicPageException, AdaptorException {
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    try {
      service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME);
    } finally {
      Mockito.verify(comicPageService, Mockito.never())
          .updatePageContent(Mockito.any(), Mockito.any());
    }
  }

  @Test
  void GetPageContent_pageAdaptoReturnsNull_missingPageIsInvalid() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    assertThrows(
        ComicPageException.class,
        () -> service.getPageContent(TEST_PAGE_ID, TEST_MISSING_FILENAME.substring(1)));
  }

  private void doCommonChecks(final ResponseEntity<byte[]> result, final byte[] content) {
    assertEquals(content.length, result.getBody().length);
    assertNotEquals(
        -1, result.getHeaders().get("Content-Disposition").get(0).indexOf(TEST_PAGE_BASE_FILENAME));
  }
}
