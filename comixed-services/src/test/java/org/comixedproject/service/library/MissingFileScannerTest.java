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

import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY;
import static org.junit.Assert.*;

import java.io.File;
import java.util.HashSet;
import java.util.Set;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.devtools.filewatch.ChangedFile;
import org.springframework.boot.devtools.filewatch.ChangedFiles;
import org.springframework.boot.devtools.filewatch.FileSystemWatcher;

@RunWith(MockitoJUnitRunner.class)
public class MissingFileScannerTest {
  private static final String TEST_ROOT_DIRECTORY =
      new File("target/test-classes").getAbsolutePath();
  private static final String TEST_COMIC_FILENAME =
      new File("target/test-classes/example.cbz").getAbsolutePath();
  private static final String TEST_MISSING_COMIC_FILENAME = TEST_COMIC_FILENAME.substring(1);
  private static final String TEST_RELATIVE_FILENAME =
      new File(TEST_ROOT_DIRECTORY)
          .toURI()
          .relativize(new File(TEST_COMIC_FILENAME).toURI())
          .getPath();

  @InjectMocks private MissingFileScanner scanner;
  @Mock private ConfigurationService configurationService;
  @Mock private ComicBookService comicBookService;
  @Mock private ChangedFile changedFile;
  @Mock private ChangedFiles changedFiles;
  @Mock private FileSystemWatcher existingWatcher;

  private Set<ChangedFile> changedFileSet = new HashSet<>();
  private Set<ChangedFiles> changedFilesSet = new HashSet<>();
  private Set<String> missingComicDetailSet = new HashSet<>();
  private Set<String> notMissingComicDetailSet = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY))
        .thenReturn(TEST_ROOT_DIRECTORY);
    Mockito.when(changedFile.getRelativeName()).thenReturn(TEST_RELATIVE_FILENAME);
    changedFileSet.add(changedFile);
    changedFilesSet.add(changedFiles);
    Mockito.when(changedFiles.getFiles()).thenReturn(changedFileSet);
    changedFilesSet.add(changedFiles);
    missingComicDetailSet.add(TEST_COMIC_FILENAME);
    missingComicDetailSet.add(TEST_MISSING_COMIC_FILENAME);
    Mockito.when(comicBookService.getAllComicDetails(true)).thenReturn(missingComicDetailSet);
    notMissingComicDetailSet.add(TEST_COMIC_FILENAME);
    notMissingComicDetailSet.add(TEST_MISSING_COMIC_FILENAME);
    Mockito.when(comicBookService.getAllComicDetails(false)).thenReturn(notMissingComicDetailSet);
  }

  @After
  public void tearDown() {
    if (scanner.watcher != null) {
      scanner.stopWatching();
    }
  }

  @Test
  public void testAfterPropertiesSet_noRootDirectory() throws Exception {
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY)).thenReturn(null);

    scanner.afterPropertiesSet();

    assertNull(scanner.watcher);

    Mockito.verify(configurationService, Mockito.times(1)).addConfigurationChangedListener(scanner);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    scanner.afterPropertiesSet();

    assertNotNull(scanner.watcher);

    Mockito.verify(configurationService, Mockito.times(1)).addConfigurationChangedListener(scanner);
  }

  @Test
  public void testOptionChanged_filesAdded_notInLibrary() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(false);

    scanner.onChange(changedFilesSet);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.never()).markComicAsFound(Mockito.anyString());
  }

  @Test
  public void testOptionChanged_filesAdded_inLibrary() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;
    Mockito.when(changedFile.getType()).thenReturn(ChangedFile.Type.ADD);
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(true);

    scanner.onChange(changedFilesSet);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsFound(TEST_COMIC_FILENAME);
  }

  @Test
  public void testOptionChanged_filesModified_notInLibrary() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(false);
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(false);

    scanner.onChange(changedFilesSet);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.never()).markComicAsMissing(Mockito.anyString());
  }

  @Test
  public void testOptionChanged_filesModified_inLibrary() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;
    Mockito.when(changedFile.getType()).thenReturn(ChangedFile.Type.MODIFY);
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(true);

    scanner.onChange(changedFilesSet);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsFound(TEST_COMIC_FILENAME);
  }

  @Test
  public void testOptionChanged_filesRemoved_notInLibrary() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(false);

    scanner.onChange(changedFilesSet);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.never()).markComicAsMissing(Mockito.anyString());
  }

  @Test
  public void testOptionChanged_filesRemoved_iInLibrary() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;
    Mockito.when(changedFile.getType()).thenReturn(ChangedFile.Type.DELETE);
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(true);

    scanner.onChange(changedFilesSet);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsMissing(TEST_COMIC_FILENAME);
  }

  @Test
  public void testOptionChanged_notRootDirectory() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;

    scanner.optionChanged("NOT_ROOT_DIRECTORY", TEST_ROOT_DIRECTORY.substring(1));

    assertEquals(TEST_ROOT_DIRECTORY, scanner.rootDirectory);
  }

  @Test
  public void testOptionChanged_rootDirectoryIsBlank() {
    scanner.rootDirectory = TEST_ROOT_DIRECTORY;
    scanner.watcher = existingWatcher;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, "");

    assertEquals("", scanner.rootDirectory);
    assertNull(scanner.watcher);

    Mockito.verify(existingWatcher, Mockito.times(1)).stop();
  }

  @Test
  public void testOptionChanged_alreadyScanning() {
    scanner.active = true;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, TEST_ROOT_DIRECTORY);

    assertEquals(TEST_ROOT_DIRECTORY, scanner.rootDirectory);
    assertNotNull(scanner.watcher);

    Mockito.verify(comicBookService, Mockito.never()).markComicAsFound(Mockito.anyString());
    Mockito.verify(comicBookService, Mockito.never()).markComicAsMissing(Mockito.anyString());
  }

  @Test
  public void testOptionChanged() {
    scanner.rootDirectory = null;

    scanner.optionChanged(CFG_LIBRARY_ROOT_DIRECTORY, TEST_ROOT_DIRECTORY);

    assertEquals(TEST_ROOT_DIRECTORY, scanner.rootDirectory);
    assertNotNull(scanner.watcher);

    Mockito.verify(comicBookService, Mockito.times(1)).markComicAsFound(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookService, Mockito.times(1))
        .markComicAsMissing(TEST_MISSING_COMIC_FILENAME);
  }
}
