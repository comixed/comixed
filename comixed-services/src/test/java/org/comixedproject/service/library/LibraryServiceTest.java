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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibraryServiceTest {
  private static final String TEST_IMAGE_CACHE_DIRECTORY =
      "/home/ComiXedReader/.comixed/image-cache";
  private static final long TEST_COMIC_COUNT = 717L;
  private static final long TEST_COMIC_BOOK_ID = 129L;

  @InjectMocks private LibraryService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBook comicBook;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicStateHandler comicStateHandler;

  @Captor private ArgumentCaptor<List<Long>> idListArgumentCaptor;

  private List<ComicBook> comicBookList = new ArrayList<>();
  private List<Long> comicIdList = new ArrayList<>();

  @Test
  public void testClearImageCache() throws LibraryException, IOException {
    Mockito.when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    Mockito.doNothing().when(fileAdaptor).deleteDirectoryContents(Mockito.anyString());

    service.clearImageCache();

    Mockito.verify(pageCacheService, Mockito.times(1)).getRootDirectory();
    Mockito.verify(fileAdaptor, Mockito.times(1))
        .deleteDirectoryContents(TEST_IMAGE_CACHE_DIRECTORY);
  }

  @Test(expected = LibraryException.class)
  public void testClearImageCacheError() throws LibraryException, IOException {
    Mockito.when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    Mockito.doThrow(IOException.class)
        .when(fileAdaptor)
        .deleteDirectoryContents(Mockito.anyString());

    service.clearImageCache();

    Mockito.verify(pageCacheService, Mockito.times(1)).getRootDirectory();
    Mockito.verify(fileAdaptor, Mockito.times(1))
        .deleteDirectoryContents(TEST_IMAGE_CACHE_DIRECTORY);
  }

  @Test
  public void testUpdateMetadata() {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    service.updateMetadata(comicIdList);

    Mockito.verify(comicBookService, Mockito.times(1)).prepareForMetadataUpdate(comicIdList);
  }

  @Test
  public void testPrepareForOrganization() throws LibraryException {
    for (int index = 0; index < 25; index++) comicBookList.add(comicBook);

    service.prepareForOrganization(comicIdList);

    Mockito.verify(comicBookService, Mockito.times(1)).prepareForOrganization(comicIdList);
  }

  @Test
  public void testPrepareAllForOrganization() {
    service.prepareAllForOrganization();

    Mockito.verify(comicBookService, Mockito.times(1)).prepareAllForOrganization();
  }

  @Test
  public void testPrepareToRecreate() {
    service.prepareToRecreate(comicIdList);

    Mockito.verify(comicBookService, Mockito.times(1)).prepareForRecreation(comicIdList);
  }

  @Test
  public void testPrepareForPurge() throws ComicBookException {
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_COUNT);
    Mockito.when(comicBookService.findComicsMarkedForDeletion(Mockito.anyInt()))
        .thenReturn(comicBookList);
    comicBookList.add(comicBook);

    service.prepareForPurging();

    for (int index = 0; index < comicIdList.size(); index++) {
      final Long id = comicIdList.get(index);
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(id);
    }
    Mockito.verify(comicBookService, Mockito.times(1)).getComicBookCount();
    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsMarkedForDeletion((int) TEST_COMIC_COUNT);
    Mockito.verify(comicStateHandler, Mockito.times(comicBookList.size()))
        .fireEvent(comicBook, ComicEvent.prepareToPurge);
  }

  @Test
  public void testPrepareForPurgeNoComicsFound() throws ComicBookException {
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(0L);

    service.prepareForPurging();

    Mockito.verify(comicBookService, Mockito.times(1)).getComicBookCount();
    Mockito.verify(comicBookService, Mockito.never()).findComicsMarkedForDeletion(Mockito.anyInt());
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(Mockito.any(), Mockito.any());
  }
}
