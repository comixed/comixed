/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.controller.page;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.net.library.AddBlockedPageHashRequest;
import org.comixedproject.model.page.Page;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.page.BlockedPageHashService;
import org.comixedproject.service.page.PageCacheService;
import org.comixedproject.utils.FileTypeIdentifier;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
public class BlockedPageControllerTest {
  private static final String TEST_PAGE_HASH = "TESTPAGEHASH";
  private static final byte[] TEST_PAGE_CONTENT = "Cached image data".getBytes();
  private static final String TEST_PAGE_FILENAME = "image.png";
  private static final String TEST_FILE_TYPE = "type";
  private static final String TEST_FILE_SUBTYPE = "subtype";

  @InjectMocks private BlockedPageController controller;
  @Mock private BlockedPageHashService blockedPageHashService;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private FileTypeIdentifier fileTypeIdentifier;
  @Mock private Page page;
  @Mock private Comic comic;
  @Mock private ArchiveAdaptor archiveAdaptor;

  @Before
  public void setUp() throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(page.getComic()).thenReturn(comic);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(comic.getArchiveType()).thenReturn(ArchiveType.CBZ);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.when(archiveAdaptor.loadSingleFile(Mockito.any(Comic.class), Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeIdentifier.typeFor(Mockito.any())).thenReturn(TEST_FILE_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(Mockito.any())).thenReturn(TEST_FILE_SUBTYPE);
  }

  @Test
  public void testAddBlockedPageHash() {
    Mockito.doNothing().when(blockedPageHashService).addHash(Mockito.anyString());

    controller.addBlockedPageHash(new AddBlockedPageHashRequest(TEST_PAGE_HASH));

    Mockito.verify(blockedPageHashService, Mockito.times(1)).addHash(TEST_PAGE_HASH);
  }

  @Test
  public void testDeleteBlockedPageHash() {
    Mockito.doNothing().when(blockedPageHashService).deleteHash(Mockito.anyString());

    controller.deleteBlockedPageHash(TEST_PAGE_HASH);

    Mockito.verify(blockedPageHashService, Mockito.times(1)).deleteHash(TEST_PAGE_HASH);
  }

  @Test(expected = ComicException.class)
  public void testGetBlockedPageContentLoadingFromArchiveFails()
      throws IOException, ComicException, ArchiveAdaptorException {
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageHashService.findPageForHash(Mockito.anyString())).thenReturn(page);
    Mockito.when(archiveAdaptor.loadSingleFile(Mockito.any(Comic.class), Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      controller.getBlockedPageContent(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(blockedPageHashService, Mockito.times(1)).findPageForHash(TEST_PAGE_HASH);
      Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
      Mockito.verify(archiveAdaptor, Mockito.times(1)).loadSingleFile(comic, TEST_PAGE_FILENAME);
    }
  }

  @Test
  public void testGetBlockedPageContentSavingToCacheFails()
      throws IOException, ComicException, ArchiveAdaptorException {
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageHashService.findPageForHash(Mockito.anyString())).thenReturn(page);
    Mockito.doThrow(IOException.class)
        .when(pageCacheService)
        .saveByHash(Mockito.anyString(), Mockito.any());

    final ResponseEntity<byte[]> result = controller.getBlockedPageContent(TEST_PAGE_HASH);

    assertNotNull(result);
    assertNotNull(result.getBody());

    Mockito.verify(blockedPageHashService, Mockito.times(1)).findPageForHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).loadSingleFile(comic, TEST_PAGE_FILENAME);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .saveByHash(TEST_PAGE_HASH, TEST_PAGE_CONTENT);
  }

  @Test
  public void testGetBlockedPageContentNotCached() throws IOException, ComicException {
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageHashService.findPageForHash(Mockito.anyString())).thenReturn(page);

    ResponseEntity<byte[]> result = controller.getBlockedPageContent(TEST_PAGE_HASH);

    assertNotNull(result);
    assertNotNull(result.getBody());

    Mockito.verify(blockedPageHashService, Mockito.times(1)).findPageForHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testGetBlockedPageNotFoundInLibrary() throws IOException, ComicException {
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageHashService.findPageForHash(Mockito.anyString())).thenReturn(null);

    final ResponseEntity<byte[]> result = controller.getBlockedPageContent(TEST_PAGE_HASH);

    assertNotNull(result);
    assertNotNull(result.getBody());
    assertEquals(
        MediaType.valueOf(String.format("%s/%s", TEST_FILE_TYPE, TEST_FILE_SUBTYPE)),
        result.getHeaders().getContentType());

    Mockito.verify(blockedPageHashService, Mockito.times(1)).findPageForHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testGetBlockedPageContentCached() throws IOException, ComicException {
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(TEST_PAGE_CONTENT);

    ResponseEntity<byte[]> result = controller.getBlockedPageContent(TEST_PAGE_HASH);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());
    assertEquals(
        MediaType.valueOf(String.format("%s/%s", TEST_FILE_TYPE, TEST_FILE_SUBTYPE)),
        result.getHeaders().getContentType());

    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }
}
