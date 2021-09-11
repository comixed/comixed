/*
 * ComiXed - A digital comic book library management application.
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

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.apache.commons.lang.RandomStringUtils;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicbooks.PageCacheService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibraryServiceTest {
  private static final Random RANDOM = new Random();
  private static final String TEST_FILENAME = "/home/comixeduser/Library/comicfile.cbz";
  private static final String TEST_IMAGE_CACHE_DIRECTORY =
      "/home/ComiXedReader/.comixed/image-cache";

  @InjectMocks private LibraryService service;
  @Mock private ComicService comicService;
  @Mock private Comic comic;
  @Mock private File file;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicStateHandler comicStateHandler;

  private List<Comic> comicList = new ArrayList<>();
  private Comic comic1 = new Comic();
  private Comic comic2 = new Comic();
  private Comic comic3 = new Comic();
  private Comic comic4 = new Comic();
  private List<Long> comicIdList = new ArrayList<>();

  @Before
  public void setUp() {
    // updated now
    comic1.setId(1L);
    comic1.setFilename(RandomStringUtils.random(128));
    // updated yesterday
    comic2.setId(2L);
    comic2.setFilename(RandomStringUtils.random(128));
    // updated same as previous comic
    comic3.setId(3L);
    comic3.setFilename(RandomStringUtils.random(128));
    comic4.setId(4L);
    comic4.setFilename(RandomStringUtils.random(128));
  }

  @Test
  public void testConsolidateLibraryNoDeleteFile() {
    Mockito.when(comicService.findAllMarkedForDeletion()).thenReturn(comicList);

    List<Comic> result = service.consolidateLibrary(false);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicService, Mockito.times(comicList.size())).delete(comic);
  }

  @Test
  public void testConsolidateLibraryDeleteFile() throws Exception {
    for (int index = 0; index < 25; index++) {
      comicList.add(comic);
    }

    Mockito.when(comicService.findAllMarkedForDeletion()).thenReturn(comicList);
    Mockito.doNothing().when(comicService).delete(Mockito.any(Comic.class));
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(comic.getFile()).thenReturn(file);
    Mockito.when(genericUtilitiesAdaptor.deleteFile(Mockito.any(File.class))).thenReturn(true);

    List<Comic> result = service.consolidateLibrary(true);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicService, Mockito.times(comicList.size())).delete(comic);
    Mockito.verify(comic, Mockito.times(comicList.size())).getFilename();
    Mockito.verify(comic, Mockito.times(comicList.size())).getFile();
    Mockito.verify(genericUtilitiesAdaptor, Mockito.times(comicList.size())).deleteFile(file);
  }

  @Test
  public void testClearImageCache() throws LibraryException, IOException {
    Mockito.when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    Mockito.doNothing().when(genericUtilitiesAdaptor).deleteDirectoryContents(Mockito.anyString());

    service.clearImageCache();

    Mockito.verify(pageCacheService, Mockito.times(1)).getRootDirectory();
    Mockito.verify(genericUtilitiesAdaptor, Mockito.times(1))
        .deleteDirectoryContents(TEST_IMAGE_CACHE_DIRECTORY);
  }

  @Test(expected = LibraryException.class)
  public void testClearImageCacheError() throws LibraryException, IOException {
    Mockito.when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    Mockito.doThrow(IOException.class)
        .when(genericUtilitiesAdaptor)
        .deleteDirectoryContents(Mockito.anyString());

    service.clearImageCache();

    Mockito.verify(pageCacheService, Mockito.times(1)).getRootDirectory();
    Mockito.verify(genericUtilitiesAdaptor, Mockito.times(1))
        .deleteDirectoryContents(TEST_IMAGE_CACHE_DIRECTORY);
  }

  @Test
  public void testUpdateMetadata() throws ComicException {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);

    service.updateMetadata(comicIdList);

    for (int index = 0; index < comicIdList.size(); index++) {
      final Long id = comicIdList.get(index);
      Mockito.verify(comicService, Mockito.times(1)).getComic(id);
    }
    Mockito.verify(comicStateHandler, Mockito.times(comicIdList.size()))
        .fireEvent(comic, ComicEvent.updateMetadata);
  }

  @Test
  public void testUpdateMetadataInvalidComic() throws ComicException {
    for (long index = 0L; index < 25L; index++) comicIdList.add(index + 100L);

    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    service.updateMetadata(comicIdList);

    for (int index = 0; index < comicIdList.size(); index++) {
      final Long id = comicIdList.get(index);
      Mockito.verify(comicService, Mockito.times(1)).getComic(id);
    }
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(comic, ComicEvent.updateMetadata);
  }
}
