/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import static java.nio.file.StandardWatchEventKinds.*;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY;
import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.HashSet;
import java.util.Set;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MissingFileScannerTest {
  private static final String TEST_ROOT_DIRECTORY =
      new File("target/test-classes").getAbsolutePath();
  private static final String TEST_COMIC_FILENAME =
      new File("target/test-classes/example.cbz").getAbsolutePath();
  private static final String TEST_MISSING_COMIC_FILENAME = TEST_COMIC_FILENAME + "-not-found";
  private static final String TEST_RELATIVE_FILENAME = "example.cbz";

  @InjectMocks private MissingFileScanner scanner;
  @Mock private ConfigurationService configurationService;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetailService comicDetailService;
  @Mock private WatchService watchService;
  @Mock private WatchKey key;
  @Mock private Path watchEventPath;
  @Mock private WatchEvent<Path> watchEvent;
  @Mock private Path keyWatchablePath;
  @Mock private Path resolvedPath;

  private Set<String> missingComicDetailSet = new HashSet<>();
  private Set<String> notMissingComicDetailSet = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString()))
        .thenReturn(TEST_ROOT_DIRECTORY);
    missingComicDetailSet.add(TEST_COMIC_FILENAME);
    missingComicDetailSet.add(TEST_MISSING_COMIC_FILENAME);
    Mockito.when(comicBookService.getAllComicDetails(true)).thenReturn(missingComicDetailSet);
    notMissingComicDetailSet.add(TEST_COMIC_FILENAME);
    notMissingComicDetailSet.add(TEST_MISSING_COMIC_FILENAME);
    Mockito.when(comicBookService.getAllComicDetails(false)).thenReturn(notMissingComicDetailSet);
    Mockito.when(resolvedPath.toString()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(keyWatchablePath.resolve(Mockito.any(Path.class))).thenReturn(resolvedPath);
    Mockito.when(key.watchable()).thenReturn(keyWatchablePath);
    Mockito.when(watchEventPath.toString()).thenReturn(TEST_RELATIVE_FILENAME);
    Mockito.when(watchEvent.context()).thenReturn(watchEventPath);
    Mockito.when(comicDetailService.filenameFound(Mockito.anyString())).thenReturn(true);
  }

  @After
  public void tearDown() throws IOException {
    if (scanner.watchService != null) {
      scanner.stopWatching();
    }
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    scanner.afterPropertiesSet();

    assertNotNull(scanner.watchService);

    Mockito.verify(configurationService, Mockito.times(1)).addConfigurationChangedListener(scanner);
  }

  @Test
  public void testOptionChanged_directoryIsEmpty() {
    scanner.rootDirectory = null;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, "");

    assertNull(scanner.rootDirectory);
    assertNull(scanner.watchService);

    Mockito.verify(comicBookService, Mockito.never()).markComicAsFound(Mockito.anyString());
    Mockito.verify(comicBookService, Mockito.never()).markComicAsMissing(Mockito.anyString());
  }

  @Test
  public void testOptionChanged_fileNotDirectory() {
    scanner.rootDirectory = null;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, TEST_COMIC_FILENAME);

    assertNull(scanner.rootDirectory);
    assertNull(scanner.watchService);

    Mockito.verify(comicBookService, Mockito.never()).markComicAsFound(Mockito.anyString());
    Mockito.verify(comicBookService, Mockito.never()).markComicAsMissing(Mockito.anyString());
  }

  @Test
  public void testOptionChanged() {
    scanner.rootDirectory = null;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, TEST_ROOT_DIRECTORY);

    assertEquals(TEST_ROOT_DIRECTORY, scanner.rootDirectory);
    assertNotNull(scanner.watchService);

    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1))
        .markComicAsMissing(TEST_MISSING_COMIC_FILENAME);
  }

  @Test
  public void testWatchDirectory_fileNotDirectory() throws IOException, InterruptedException {
    scanner.watchService = watchService;

    scanner.watchDirectory(TEST_ROOT_DIRECTORY.substring(0, TEST_ROOT_DIRECTORY.length() - 1));

    assertNull(scanner.watchService);

    Mockito.verify(watchService, Mockito.times(1)).close();
  }

  @Test
  public void testProcessWatchEvent_notInLibrary() {
    Mockito.when(comicDetailService.filenameFound(Mockito.anyString())).thenReturn(false);

    scanner.processWatchEvent(key, watchEvent);

    Mockito.verify(comicDetailService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.never()).markComicAsFound(Mockito.anyString());
    Mockito.verify(comicBookService, Mockito.never()).markComicAsMissing(Mockito.anyString());
  }

  @Test
  public void testProcessWatchEvent_fileDeleted() {
    Mockito.when(watchEvent.kind()).thenReturn(ENTRY_DELETE);

    scanner.processWatchEvent(key, watchEvent);

    Mockito.verify(comicDetailService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsMissing(TEST_COMIC_FILENAME);
  }

  @Test
  public void testProcessWatchEvent_fileModified() {
    Mockito.when(watchEvent.kind()).thenReturn(ENTRY_MODIFY);

    scanner.processWatchEvent(key, watchEvent);

    Mockito.verify(comicDetailService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsFound(TEST_COMIC_FILENAME);
  }

  @Test
  public void testProcessWatchEvent_fileCreated() {
    Mockito.when(watchEvent.kind()).thenReturn(ENTRY_CREATE);

    scanner.processWatchEvent(key, watchEvent);

    Mockito.verify(comicDetailService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsFound(TEST_COMIC_FILENAME);
  }
}
