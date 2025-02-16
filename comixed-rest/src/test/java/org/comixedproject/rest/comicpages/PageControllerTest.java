/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.rest.comicpages;

import static org.comixedproject.rest.comicbooks.ComicBookController.MISSING_COMIC_COVER_FILENAME;
import static org.junit.Assert.*;

import java.io.InputStream;
import java.util.List;
import org.comixedproject.model.net.comicpages.UpdatePageDeletionRequest;
import org.comixedproject.service.comicpages.ComicPageException;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PageControllerTest {
  private static final long TEST_PAGE_ID = 129;
  private static final String TEST_PAGE_HASH = "12345";

  @InjectMocks private PageController controller;
  @Mock private ComicPageService comicPageService;
  @Mock private PageCacheService pageCacheService;
  @Mock private List<Long> idList;
  @Mock private ResponseEntity<byte[]> responseEntity;

  @Captor private ArgumentCaptor<InputStream> inputStream;

  @Test
  void getPageContentAdaptorException() throws ComicPageException {
    Mockito.when(pageCacheService.getPageContent(Mockito.anyLong(), Mockito.anyString()))
        .thenThrow(ComicPageException.class);

    assertThrows(ComicPageException.class, () -> controller.getPageContent(TEST_PAGE_ID));
  }

  @Test
  void getPageContent() throws ComicPageException {
    Mockito.when(pageCacheService.getPageContent(Mockito.anyLong(), Mockito.anyString()))
        .thenReturn(responseEntity);

    final ResponseEntity<byte[]> result = controller.getPageContent(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(responseEntity, result);

    Mockito.verify(pageCacheService, Mockito.times(1))
        .getPageContent(TEST_PAGE_ID, MISSING_COMIC_COVER_FILENAME);
  }

  @Test
  void getPageForHashNoPageFound() throws ComicPageException {
    Mockito.when(pageCacheService.getPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComicPageException.class);

    assertThrows(ComicPageException.class, () -> controller.getPageForHash(TEST_PAGE_HASH));
  }

  @Test
  void getPageForHash() throws ComicPageException {
    Mockito.when(pageCacheService.getPageContent(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(responseEntity);

    final ResponseEntity<byte[]> result = controller.getPageForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(responseEntity, result);

    Mockito.verify(pageCacheService, Mockito.times(1))
        .getPageContent(TEST_PAGE_HASH, MISSING_COMIC_COVER_FILENAME);
  }

  @Test
  void updatePageDeletionMarkDeleted() {
    controller.markPagesForDeletion(new UpdatePageDeletionRequest(idList));

    Mockito.verify(comicPageService, Mockito.times(1)).updatePageDeletion(idList, true);
  }

  @Test
  void updatePageDeletionUnmarkDeleted() {
    controller.unmarkPagesForDeletion(new UpdatePageDeletionRequest(idList));

    Mockito.verify(comicPageService, Mockito.times(1)).updatePageDeletion(idList, false);
  }
}
