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
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.HashSet;
import java.util.Set;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LibraryScannerServiceTest {
  private static final String TEST_ROOT_DIRECTORY =
      new File("target/test-classes").getAbsolutePath();
  private static final String TEST_COMIC_FILENAME =
      new File("target/test-classes/example.cbz").getAbsolutePath();
  private static final String TEST_MISSING_COMIC_FILENAME = TEST_COMIC_FILENAME + "-not-found";
  private static final String TEST_RELATIVE_FILENAME = "example.cbz";
  private static final String TEST_LIBRARY_DIRECTORY = "target/test-class";

  @InjectMocks private LibraryScannerService scanner;
  @Mock private ConfigurationService configurationService;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ComicFileService comicFileService;
  @Mock private WatchService watchService;
  @Mock private WatchKey key;
  @Mock private Path watchEventPath;
  @Mock private WatchEvent<Path> watchEvent;
  @Mock private Path keyWatchablePath;
  @Mock private Path resolvedPath;

  private Set<String> missingComicDetailSet = new HashSet<>();
  private Set<String> notMissingComicDetailSet = new HashSet<>();

  @BeforeEach
  void setUp() {
    when(configurationService.getOptionValue(anyString())).thenReturn(TEST_ROOT_DIRECTORY);
    missingComicDetailSet.add(TEST_COMIC_FILENAME);
    missingComicDetailSet.add(TEST_MISSING_COMIC_FILENAME);
    when(comicBookService.getAllComicDetails(true)).thenReturn(missingComicDetailSet);
    notMissingComicDetailSet.add(TEST_COMIC_FILENAME);
    notMissingComicDetailSet.add(TEST_MISSING_COMIC_FILENAME);
    when(comicBookService.getAllComicDetails(false)).thenReturn(notMissingComicDetailSet);
    when(resolvedPath.toString()).thenReturn(TEST_COMIC_FILENAME);
    when(keyWatchablePath.resolve(any(Path.class))).thenReturn(resolvedPath);
    when(key.watchable()).thenReturn(keyWatchablePath);
    when(watchEventPath.toString()).thenReturn(TEST_RELATIVE_FILENAME);
    when(watchEvent.context()).thenReturn(watchEventPath);
    when(comicDetailService.filenameFound(anyString())).thenReturn(true);
  }

  @AfterEach
  void tearDown() throws IOException {
    if (scanner.watchService != null) {
      scanner.stopWatching();
    }
  }

  @Test
  void afterPropertiesSet() throws Exception {
    scanner.afterPropertiesSet();

    assertNotNull(scanner.watchService);

    verify(configurationService).addConfigurationChangedListener(scanner);
  }

  @Test
  void optionChanged_directoryIsEmpty() {
    scanner.rootDirectory = null;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, "");

    assertNull(scanner.rootDirectory);
    assertNull(scanner.watchService);

    verify(comicBookService, never()).markComicAsFound(anyString());
    verify(comicBookService, never()).markComicAsMissing(anyString());
  }

  @Test
  void optionChanged_fileNotDirectory() {
    scanner.rootDirectory = null;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, TEST_COMIC_FILENAME);

    assertNull(scanner.rootDirectory);
    assertNull(scanner.watchService);

    verify(comicBookService, never()).markComicAsFound(anyString());
    verify(comicBookService, never()).markComicAsMissing(anyString());
  }

  @Test
  void optionChanged() {
    scanner.rootDirectory = null;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, TEST_ROOT_DIRECTORY);

    assertEquals(TEST_ROOT_DIRECTORY, scanner.rootDirectory);
    assertNotNull(scanner.watchService);

    verify(comicBookService).markComicAsFound(TEST_COMIC_FILENAME);
    verify(comicBookService).markComicAsMissing(TEST_MISSING_COMIC_FILENAME);
  }

  @Test
  void watchDirectory_fileNotDirectory() throws IOException, InterruptedException {
    scanner.watchService = watchService;

    scanner.watchDirectory(TEST_ROOT_DIRECTORY.substring(0, TEST_ROOT_DIRECTORY.length() - 1));

    assertNull(scanner.watchService);

    verify(watchService).close();
  }

  @Test
  void processWatchEvent_entrycreate_notInLibrary() throws IOException {
    when(watchEvent.kind()).thenReturn(ENTRY_CREATE);
    when(comicDetailService.filenameFound(anyString())).thenReturn(false);

    scanner.processWatchEvent(key, watchEvent);

    verify(comicDetailService).filenameFound(TEST_COMIC_FILENAME);
    verify(comicFileService).discoverComicFile(TEST_COMIC_FILENAME);
  }

  @Test
  void processWatchEvent_entrycreate_inLibrary() throws IOException {
    when(watchEvent.kind()).thenReturn(ENTRY_CREATE);
    when(comicDetailService.filenameFound(anyString())).thenReturn(true);

    scanner.processWatchEvent(key, watchEvent);

    verify(comicDetailService).filenameFound(TEST_COMIC_FILENAME);
    verify(comicBookService).markComicAsFound(TEST_COMIC_FILENAME);
  }

  @Test
  void processWatchEvent_fileDeleted() throws IOException {
    when(watchEvent.kind()).thenReturn(ENTRY_DELETE);

    scanner.processWatchEvent(key, watchEvent);

    verify(comicBookService).markComicAsMissing(TEST_COMIC_FILENAME);
  }

  @Test
  void processWatchEvent_fileModified() throws IOException {
    when(watchEvent.kind()).thenReturn(ENTRY_MODIFY);

    scanner.processWatchEvent(key, watchEvent);

    verify(comicDetailService).filenameFound(TEST_COMIC_FILENAME);
    verify(comicBookService).markComicAsFound(TEST_COMIC_FILENAME);
  }

  @Test
  void processWatchEvent_fileCreated() throws IOException {
    when(watchEvent.kind()).thenReturn(ENTRY_CREATE);

    scanner.processWatchEvent(key, watchEvent);

    verify(comicDetailService).filenameFound(TEST_COMIC_FILENAME);
    verify(comicBookService).markComicAsFound(TEST_COMIC_FILENAME);
  }
}
