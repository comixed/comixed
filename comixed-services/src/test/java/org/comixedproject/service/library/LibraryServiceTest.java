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

import static junit.framework.TestCase.*;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;
import org.apache.commons.lang.RandomStringUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.library.LastReadDatesRepository;
import org.comixedproject.service.comic.PageCacheService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.utils.Utils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
public class LibraryServiceTest {
  private static final String TEST_EMAIL = "reader@comixed.org";
  private static final Date TEST_LAST_UPDATED_TIMESTAMP = new Date();
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final long TEST_LAST_COMIC_ID = 23579;
  private static final int TEST_PROCESSING_COUNT = 273;
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_PHYSICAL_FILES = RANDOM.nextBoolean();
  private static final String TEST_FILENAME = "/home/comixeduser/Library/comicfile.cbz";
  private static final Long TEST_USER_ID = 723L;
  private static final String TEST_IMAGE_CACHE_DIRECTORY =
      "/home/ComiXedReader/.comixed/image-cache";
  private static final String TEST_DIRECTORY = "/home/comixedreader/Documents/comics";
  private static final String TEST_RENAMING_RULES =
      "$PUBLISHER/$SERIES/$VOLUME/$SERIES [v$VOLUME] #$ISSUE $COVERDATE";
  private static final boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_ORIGINAL_COMIC = RANDOM.nextBoolean();

  @InjectMocks private LibraryService libraryService;
  @Mock private ComicRepository comicRepository;
  @Mock private ReadingListService readingListService;
  @Mock private UserService userService;
  @Mock private TaskService taskService;
  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<List<Comic>> comicListArgumentCaptor;
  @Mock private File file;
  @Mock private Utils utils;
  @Mock private List<LastReadDate> lastReadDateList;
  @Mock private ComiXedUser user;
  @Mock private LastReadDatesRepository lastReadDatesRepository;
  @Mock private PageCacheService pageCacheService;

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
    comic1.setDateLastUpdated(new Date());
    comic1.setFilename(RandomStringUtils.random(128));
    // updated yesterday
    comic2.setId(2L);
    comic2.setDateLastUpdated(new Date(System.currentTimeMillis() - 24L * 60L * 60L * 1000L));
    comic2.setFilename(RandomStringUtils.random(128));
    // updated same as previous comic
    comic3.setId(3L);
    comic3.setDateLastUpdated(comic2.getDateLastUpdated());
    comic3.setFilename(RandomStringUtils.random(128));
    comic4.setId(4L);
    comic4.setDateLastUpdated(comic3.getDateLastUpdated());
    comic4.setFilename(RandomStringUtils.random(128));
  }

  @Test
  public void testGetComicsUpdatedSince() {
    List<Comic> comics = new ArrayList<>();
    comics.add(comic2);
    comics.add(comic3);
    comics.add(comic4);

    Mockito.when(
            comicRepository.getLibraryUpdates(
                Mockito.any(Date.class), pageableArgumentCaptor.capture()))
        .thenReturn(comics);

    List<Comic> result =
        libraryService.getComicsUpdatedSince(
            TEST_EMAIL, comic3.getDateLastUpdated(), TEST_MAXIMUM_COMICS, 2L);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(2, result.size());
    assertTrue(result.contains(comic3));
    assertTrue(result.contains(comic4));

    assertEquals(0, pageableArgumentCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageableArgumentCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getLibraryUpdates(comic3.getDateLastUpdated(), pageableArgumentCaptor.getValue());
    Mockito.verify(readingListService, Mockito.times(1))
        .getReadingListsForComics(TEST_EMAIL, result);
  }

  @Test
  public void testConsolidateLibraryNoDeleteFile() {
    Mockito.when(comicRepository.findAllMarkedForDeletion()).thenReturn(comicList);

    List<Comic> result = libraryService.consolidateLibrary(false);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(comicList.size())).delete(comic);
  }

  @Test
  public void testConsolidateLibraryDeleteFile() throws Exception {
    for (int index = 0; index < 25; index++) {
      comicList.add(comic);
    }

    Mockito.when(comicRepository.findAllMarkedForDeletion()).thenReturn(comicList);
    Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(comic.getFile()).thenReturn(file);
    Mockito.when(utils.deleteFile(Mockito.any(File.class))).thenReturn(true);

    List<Comic> result = libraryService.consolidateLibrary(true);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(comicList.size())).delete(comic);
    Mockito.verify(comic, Mockito.times(comicList.size())).getFilename();
    Mockito.verify(comic, Mockito.times(comicList.size())).getFile();
    Mockito.verify(utils, Mockito.times(comicList.size())).deleteFile(file);
  }

  @Test
  public void testGetLastReadDatesForUser() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(user.getId()).thenReturn(TEST_USER_ID);
    Mockito.when(lastReadDatesRepository.findAllForUser(Mockito.anyLong(), Mockito.any(Date.class)))
        .thenReturn(lastReadDateList);

    List<LastReadDate> result =
        libraryService.getLastReadDatesSince(TEST_EMAIL, TEST_LAST_UPDATED_TIMESTAMP);

    assertNotNull(result);
    assertSame(lastReadDateList, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(lastReadDatesRepository, Mockito.times(1))
        .findAllForUser(TEST_USER_ID, TEST_LAST_UPDATED_TIMESTAMP);
  }

  @Test
  public void testClearImageCache() throws LibraryException, IOException {
    Mockito.when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    Mockito.doNothing().when(utils).deleteDirectoryContents(Mockito.anyString());

    libraryService.clearImageCache();

    Mockito.verify(pageCacheService, Mockito.times(1)).getRootDirectory();
    Mockito.verify(utils, Mockito.times(1)).deleteDirectoryContents(TEST_IMAGE_CACHE_DIRECTORY);
  }

  @Test(expected = LibraryException.class)
  public void testClearImageCacheError() throws LibraryException, IOException {
    Mockito.when(pageCacheService.getRootDirectory()).thenReturn(TEST_IMAGE_CACHE_DIRECTORY);
    Mockito.doThrow(IOException.class).when(utils).deleteDirectoryContents(Mockito.anyString());

    libraryService.clearImageCache();

    Mockito.verify(pageCacheService, Mockito.times(1)).getRootDirectory();
    Mockito.verify(utils, Mockito.times(1)).deleteDirectoryContents(TEST_IMAGE_CACHE_DIRECTORY);
  }
}
