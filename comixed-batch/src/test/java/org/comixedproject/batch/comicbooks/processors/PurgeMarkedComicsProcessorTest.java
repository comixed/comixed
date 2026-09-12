/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.batch.comicbooks.processors;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

import java.io.File;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.lists.ReadingListService;
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
class PurgeMarkedComicsProcessorTest {
  @InjectMocks private PurgeMarkedComicsProcessor processor;
  @Mock private ComicService comicService;
  @Mock private ReadingListService readingListService;
  @Mock private ConfigurationService configurationService;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private File comicFile;
  @Mock private Comic comic;

  @BeforeEach
  void setUp() {
    when(comic.getFile()).thenReturn(comicFile);
    when(comic.isLoadingFileContents()).thenReturn(false);
    when(configurationService.isFeatureEnabled(ConfigurationService.CFG_DELETE_PURGED_COMIC_FILES))
        .thenReturn(false);
  }

  @Test
  void process_fileContentsNotLoaded() throws Exception {
    when(comic.isLoadingFileContents()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_errorThrown() throws Exception {
    doThrow(NullPointerException.class).when(readingListService).deleteEntriesForComicBook(any());

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(readingListService).deleteEntriesForComicBook(comic);
    verify(comicService, never()).deleteComic(any());
  }

  @Test
  void process_deleteFilesEnabled() throws Exception {
    when(configurationService.isFeatureEnabled(ConfigurationService.CFG_DELETE_PURGED_COMIC_FILES))
        .thenReturn(true);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(readingListService).deleteEntriesForComicBook(comic);
    verify(comicService).deleteComic(comic);
    verify(fileAdaptor).deleteFile(comicFile);
  }
}
