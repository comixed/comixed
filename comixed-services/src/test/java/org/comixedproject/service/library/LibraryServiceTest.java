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

import static org.comixedproject.state.comicbooks.ComicStateHandler.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibraryServiceTest {
  private static final String TEST_IMAGE_CACHE_DIRECTORY =
      "/home/ComiXedReader/.comixed/image-cache";
  private static final String TEST_RENAMING_RULE = "The renaming rule";
  private static final String TEST_TARGET_DIRECTORY = "/home/comixed/Documents/comics";
  private static final boolean TEST_DELETE_REMOVED_COMIC_FILES = RandomUtils.nextBoolean();
  private static final long TEST_COMIC_COUNT = 717L;

  @InjectMocks private LibraryService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicStateHandler comicStateHandler;

  @Captor private ArgumentCaptor<Map<String, Object>> headersArgumentCaptor;

  private List<ComicBook> comicBookList = new ArrayList<>();
  private List<Long> comicIdList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
  }

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
  public void testUpdateMetadata() throws ComicBookException {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMetadata(comicIdList);

    for (int index = 0; index < comicIdList.size(); index++) {
      final Long id = comicIdList.get(index);
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(id);
    }
    Mockito.verify(comicStateHandler, Mockito.times(comicIdList.size()))
        .fireEvent(comicBook, ComicEvent.updateMetadata);
  }

  @Test
  public void testUpdateMetadataInvalidComic() throws ComicBookException {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    service.updateMetadata(comicIdList);

    for (int index = 0; index < comicIdList.size(); index++) {
      final Long id = comicIdList.get(index);
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(id);
    }
    Mockito.verify(comicStateHandler, Mockito.never())
        .fireEvent(comicBook, ComicEvent.updateMetadata);
  }

  @Test(expected = LibraryException.class)
  public void testPrepareForConsolidationNoTargetDirectory() throws LibraryException {
    service.prepareForConsolidation(comicIdList, "");
  }

  @Test
  public void testPrepareForConsolidation() throws LibraryException {
    for (int index = 0; index < 25; index++) comicBookList.add(comicBook);

    Mockito.when(comicBookService.findAll()).thenReturn(comicBookList);

    service.prepareForConsolidation(comicIdList, TEST_TARGET_DIRECTORY);

    Mockito.verify(comicBookService, Mockito.times(1)).prepareForConsolidation(comicIdList);
  }

  @Test
  public void testPrepareToRecreateComics() throws ComicBookException {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    service.prepareToRecreateComics(comicIdList);

    for (int index = 0; index < comicIdList.size(); index++) {
      final Long id = comicIdList.get(index);
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(id);
    }
    Mockito.verify(comicStateHandler, Mockito.times(comicIdList.size()))
        .fireEvent(comicBook, ComicEvent.recreateComicFile);
  }

  @Test
  public void testPrepareToRecreateComicsInvalid() throws ComicBookException {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    service.prepareToRecreateComics(comicIdList);

    for (int index = 0; index < comicIdList.size(); index++) {
      final Long id = comicIdList.get(index);
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(id);
    }
    Mockito.verify(comicStateHandler, Mockito.never())
        .fireEvent(comicBook, ComicEvent.recreateComicFile);
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
