/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.controller.comic;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.comic.PageType;
import org.comixedproject.model.library.BlockedPageHash;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.model.net.SetBlockingStateRequest;
import org.comixedproject.model.net.SetDeletedStateRequest;
import org.comixedproject.model.net.SetPageTypeRequest;
import org.comixedproject.service.comic.PageCacheService;
import org.comixedproject.service.comic.PageException;
import org.comixedproject.service.comic.PageService;
import org.comixedproject.utils.FileTypeIdentifier;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageControllerTest {
  private static final long TEST_PAGE_TYPE_ID = 717;
  private static final long TEST_PAGE_ID = 129;
  private static final List<String> TEST_PAGE_HASH_LIST = new ArrayList<>();
  private static final List<DuplicatePage> TEST_DUPLICATE_PAGES = new ArrayList<>();
  private static final int TEST_PAGE_INDEX = 7;
  private static final long TEST_COMIC_ID = 1002L;
  private static final byte[] TEST_PAGE_CONTENT = new byte[53253];
  private static final int TEST_DELETED_PAGE_COUNT = 17;
  private static final String TEST_PAGE_HASH = "12345";
  private static final String TEST_PAGE_CONTENT_TYPE = "application";
  private static final String TEST_PAGE_CONTENT_SUBTYPE = "image";
  private static final Boolean TEST_BLOCKING = true;
  private static final Boolean TEST_DELETED = false;
  private static final String TEST_PAGE_TYPE_NAME = "Story";
  private static final String TEST_PAGE_FILENAME = "page01.jpg";

  static {
    TEST_PAGE_HASH_LIST.add("12345");
    TEST_PAGE_HASH_LIST.add("23456");
    TEST_PAGE_HASH_LIST.add("34567");
  }

  @InjectMocks private PageController pageController;
  @Mock private PageService pageService;
  @Mock private PageCacheService pageCacheService;
  @Mock private Page page;
  @Mock private BlockedPageHash blockedPageHash = new BlockedPageHash();
  @Mock private List<Page> pageList;
  @Mock private Comic comic;
  @Mock private List<PageType> pageTypes;
  @Mock private FileTypeIdentifier fileTypeIdentifier;
  @Mock private List<DuplicatePage> duplicatePageList;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ArchiveAdaptor archiveAdaptor;

  @Captor private ArgumentCaptor<InputStream> inputStream;
  private ArchiveType archiveType = ArchiveType.CB7;

  @Test
  public void testSetPageType() throws PageException {
    Mockito.when(pageService.updateTypeForPage(Mockito.anyLong(), Mockito.anyString()))
        .thenReturn(page);

    final Page result =
        pageController.updateTypeForPage(TEST_PAGE_ID, new SetPageTypeRequest(TEST_PAGE_TYPE_NAME));

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(pageService, Mockito.times(1))
        .updateTypeForPage(TEST_PAGE_ID, TEST_PAGE_TYPE_NAME);
  }

  @Test
  public void testAddBlockedPageHash() throws PageException {
    Mockito.when(pageService.addBlockedPageHash(Mockito.anyLong(), Mockito.anyString()))
        .thenReturn(comic);

    final Comic result = pageController.addBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageService, Mockito.times(1)).addBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);
  }

  @Test
  public void testRemoveBlockedPageHash() throws PageException {
    Mockito.when(pageService.removeBlockedPageHash(Mockito.anyLong(), Mockito.anyString()))
        .thenReturn(comic);

    final Comic result = pageController.removeBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageService, Mockito.times(1))
        .removeBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);
  }

  @Test
  public void testGetBlockedPageHashes() {
    Mockito.when(pageService.getAllBlockedPageHashes()).thenReturn(TEST_PAGE_HASH_LIST);

    List<String> result = pageController.getAllBlockedPageHashes();

    assertSame(TEST_PAGE_HASH_LIST, result);

    Mockito.verify(pageService, Mockito.times(1)).getAllBlockedPageHashes();
  }

  @Test
  public void testGetDuplicatePages() {

    Mockito.when(pageService.getDuplicatePages()).thenReturn(TEST_DUPLICATE_PAGES);

    List<DuplicatePage> result = pageController.getDuplicatePages();

    assertNotNull(result);
    assertSame(TEST_DUPLICATE_PAGES, result);

    Mockito.verify(pageService, Mockito.times(1)).getDuplicatePages();
  }

  @Test
  public void testGetImageInComicByIndex()
      throws IOException, ArchiveAdaptorException, ComicFileHandlerException {
    Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(page);
    Mockito.when(page.getComic()).thenReturn(comic);
    Mockito.when(comic.getArchiveType()).thenReturn(archiveType);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(archiveAdaptor.loadSingleFile(Mockito.any(Comic.class), Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeIdentifier.typeFor(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    ResponseEntity<byte[]> result =
        pageController.getImageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(pageService, Mockito.times(1))
        .getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeIdentifier, Mockito.times(1))
        .subtypeFor(inputStream.getAllValues().get(1));
  }

  @Test
  public void testDeletePageInvalidId() {
    Mockito.when(pageService.deletePage(Mockito.anyLong())).thenReturn(null);

    final Comic result = pageController.deletePage(TEST_PAGE_ID);

    assertNull(result);

    Mockito.verify(pageService, Mockito.times(1)).deletePage(TEST_PAGE_ID);
  }

  @Test
  public void testDeletePage() {
    Mockito.when(pageService.deletePage(Mockito.anyLong())).thenReturn(comic);

    final Comic result = pageController.deletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageService, Mockito.times(1)).deletePage(TEST_PAGE_ID);
  }

  @Test
  public void testUndeletePageForNonexistentPage() {
    Mockito.when(pageService.undeletePage(Mockito.anyLong())).thenReturn(null);

    final Comic result = pageController.undeletePage(TEST_PAGE_ID);

    assertNull(result);

    Mockito.verify(pageService, Mockito.times(1)).undeletePage(TEST_PAGE_ID);
  }

  @Test
  public void testUndeletePage() {
    Mockito.when(pageService.undeletePage(Mockito.anyLong())).thenReturn(comic);

    final Comic result = pageController.undeletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageService, Mockito.times(1)).undeletePage(TEST_PAGE_ID);
  }

  @Test
  public void testGetPageContentForNonexistentPage()
      throws IOException, ArchiveAdaptorException, ComicFileHandlerException {
    Mockito.when(pageService.findById(Mockito.anyLong())).thenReturn(null);

    assertNull(pageController.getPageContent(TEST_PAGE_ID));

    Mockito.verify(pageService, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testGetPageContent()
      throws IOException, ArchiveAdaptorException, ComicFileHandlerException {
    Mockito.when(pageService.findById(Mockito.anyLong())).thenReturn(page);
    Mockito.when(page.getComic()).thenReturn(comic);
    Mockito.when(comic.getArchiveType()).thenReturn(archiveType);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(archiveAdaptor.loadSingleFile(Mockito.any(Comic.class), Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeIdentifier.typeFor(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.doNothing()
        .when(pageCacheService)
        .saveByHash(Mockito.anyString(), Mockito.any(byte[].class));

    ResponseEntity<byte[]> result = pageController.getPageContent(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());
    assertEquals(HttpStatus.OK, result.getStatusCode());

    Mockito.verify(pageService, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeIdentifier, Mockito.times(1))
        .subtypeFor(inputStream.getAllValues().get(1));
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .saveByHash(TEST_PAGE_HASH, TEST_PAGE_CONTENT);
  }

  @Test
  public void testGetPageContentCached()
      throws IOException, ArchiveAdaptorException, ComicFileHandlerException {
    Mockito.when(pageService.findById(TEST_PAGE_ID)).thenReturn(page);
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(fileTypeIdentifier.typeFor(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(TEST_PAGE_CONTENT);

    ResponseEntity<byte[]> result = pageController.getPageContent(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());
    assertEquals(HttpStatus.OK, result.getStatusCode());

    Mockito.verify(pageService, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeIdentifier, Mockito.times(1))
        .subtypeFor(inputStream.getAllValues().get(1));
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testGetPageInComicWithIndexNonexistentComic() {
    Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(null);

    assertNull(pageController.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX));

    Mockito.verify(pageService, Mockito.times(1))
        .getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
  }

  @Test
  public void testGetPageInComicWithInvalidIndex() {
    Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(null);

    assertNull(pageController.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX));

    Mockito.verify(pageService, Mockito.times(1))
        .getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
  }

  @Test
  public void testGetPageInComic() {
    Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(page);

    Page result = pageController.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(pageService, Mockito.times(1))
        .getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
  }

  @Test
  public void testGetAllPagesForComic() {
    Mockito.when(pageService.getAllPagesForComic(Mockito.anyLong())).thenReturn(pageList);

    List<Page> result = pageController.getAllPagesForComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(pageList, result);

    Mockito.verify(pageService, Mockito.times(1)).getAllPagesForComic(TEST_COMIC_ID);
  }

  @Test
  public void testGetPageTypes() {
    Mockito.when(pageService.getPageTypes()).thenReturn(pageTypes);

    assertSame(pageTypes, pageController.getPageTypes());

    Mockito.verify(pageService, Mockito.times(1)).getPageTypes();
  }

  @Test
  public void testDeletePagesByHash() {
    Mockito.when(pageService.deleteAllWithHash(Mockito.anyString()))
        .thenReturn(TEST_DELETED_PAGE_COUNT);

    int result = pageController.deleteAllWithHash(TEST_PAGE_HASH);

    assertEquals(TEST_DELETED_PAGE_COUNT, result);

    Mockito.verify(pageService, Mockito.times(1)).deleteAllWithHash(TEST_PAGE_HASH);
  }

  @Test
  public void testUndeletePagesByHash() {
    Mockito.when(pageService.undeleteAllWithHash(Mockito.anyString()))
        .thenReturn(TEST_DELETED_PAGE_COUNT);

    int result = pageController.undeleteAllWithHash(TEST_PAGE_HASH);

    assertEquals(TEST_DELETED_PAGE_COUNT, result);

    Mockito.verify(pageService, Mockito.times(1)).undeleteAllWithHash(TEST_PAGE_HASH);
  }

  @Test
  public void testSetBlockingState() {
    Mockito.when(pageService.setBlockingState(Mockito.anyList(), Mockito.anyBoolean()))
        .thenReturn(duplicatePageList);

    final List<DuplicatePage> result =
        pageController.setBlockingState(
            new SetBlockingStateRequest(TEST_PAGE_HASH_LIST, TEST_BLOCKING));

    assertNotNull(result);
    assertSame(duplicatePageList, result);

    Mockito.verify(pageService, Mockito.times(1))
        .setBlockingState(TEST_PAGE_HASH_LIST, TEST_BLOCKING);
  }

  @Test
  public void testSetDeletedState() {
    Mockito.doNothing().when(pageService).setDeletedState(Mockito.anyList(), Mockito.anyBoolean());
    Mockito.when(pageService.getDuplicatePages()).thenReturn(duplicatePageList);

    final List<DuplicatePage> result =
        pageController.setDeletedState(
            new SetDeletedStateRequest(TEST_PAGE_HASH_LIST, TEST_DELETED));

    assertNotNull(result);
    assertSame(duplicatePageList, result);

    Mockito.verify(pageService, Mockito.times(1))
        .setDeletedState(TEST_PAGE_HASH_LIST, TEST_DELETED);
    Mockito.verify(pageService, Mockito.times(1)).getDuplicatePages();
  }
}
