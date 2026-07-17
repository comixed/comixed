/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.service.library;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.batch.UpdateMetadataEvent;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class LibraryServiceTest {
  private static final String TEST_IMAGE_CACHE_DIRECTORY =
      "/home/ComiXedReader/.comixed/image-cache";

  @InjectMocks private LibraryService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ArchiveType archiveType;
  @Mock private ComicBook comicBook;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private PageCacheService pageCacheService;
  @Mock private ApplicationEventPublisher applicationEventPublisher;

  private List<ComicBook> comicBookList = new ArrayList<>();
  private List<Long> comicIdList = new ArrayList<>();

  @Test
  void ClearImageCache() throws LibraryException, IOException {
    when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    Mockito.doNothing().when(fileAdaptor).deleteDirectoryContents(Mockito.anyString());

    service.clearImageCache();

    verify(pageCacheService).getRootDirectory();
    verify(fileAdaptor).deleteDirectoryContents(TEST_IMAGE_CACHE_DIRECTORY);
  }

  @Test
  void clearImageCacheError() throws IOException {
    when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    doThrow(IOException.class).when(fileAdaptor).deleteDirectoryContents(Mockito.anyString());

    assertThrows(LibraryException.class, () -> service.clearImageCache());
  }

  @Test
  void updateMetadata() {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    service.updateMetadata(comicIdList);

    verify(comicBookService).prepareForMetadataUpdate(comicIdList);
    verify(applicationEventPublisher).publishEvent(UpdateMetadataEvent.instance);
  }

  @Test
  void prepareForOrganization() {
    for (int index = 0; index < 25; index++) comicBookList.add(comicBook);

    service.prepareForOrganization(comicIdList);

    verify(comicBookService).prepareForOrganization(comicIdList);
  }

  @Test
  void prepareAllForOrganization() {
    service.prepareAllForOrganization();

    verify(comicBookService).prepareAllForOrganization();
  }

  @Test
  void prepareToRecreate() {
    service.prepareToRecreate(comicIdList, archiveType);

    verify(comicBookService).prepareForRecreation(comicIdList, archiveType);
  }

  @Test
  void prepareForPurge() {
    service.prepareForPurging();

    verify(comicBookService).prepareComicBooksForDeleting();
  }
}
