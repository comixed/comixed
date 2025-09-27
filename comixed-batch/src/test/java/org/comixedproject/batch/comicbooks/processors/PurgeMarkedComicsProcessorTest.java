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

import java.io.File;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PurgeMarkedComicsProcessorTest {
  @InjectMocks private PurgeMarkedComicsProcessor processor;
  @Mock private ComicBookService comicBookService;
  @Mock private ReadingListService readingListService;
  @Mock private ConfigurationService configurationService;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private File comicFile;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;

  @BeforeEach
  public void setUp() {
    Mockito.when(comicDetail.getFile()).thenReturn(comicFile);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(true);
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_DELETE_PURGED_COMIC_FILES))
        .thenReturn(false);
  }

  @Test
  void process_fileContentsNotLoaded() throws Exception {
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(false);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_errorThrown() throws Exception {
    Mockito.doThrow(NullPointerException.class)
        .when(readingListService)
        .deleteEntriesForComicBook(Mockito.any());

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(readingListService, Mockito.times(1)).deleteEntriesForComicBook(comicBook);
    Mockito.verify(comicBookService, Mockito.never()).deleteComicBook(Mockito.any());
  }

  @Test
  void process_deleteFilesEnabled() throws Exception {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_DELETE_PURGED_COMIC_FILES))
        .thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(readingListService, Mockito.times(1)).deleteEntriesForComicBook(comicBook);
    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(comicBook);
    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteFile(comicFile);
  }
}
