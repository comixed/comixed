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
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.admin.ConfigurationService;
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
class RecreateComicFileProcessorTest {
  private static final ArchiveType TEST_TARGET_ARCHIVE = ArchiveType.CBZ;
  private static final String TEST_PAGE_RENAMING_RULE = "The page renaming rule";

  @InjectMocks private RecreateComicFileProcessor processor;
  @Mock private ComicCheckOutManager comicCheckOutManager;
  @Mock private ConfigurationService configurationService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private File comicFile;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;

  @BeforeEach
  public void setUp() {
    Mockito.when(comicFile.exists()).thenReturn(true);
    Mockito.when(comicFile.isFile()).thenReturn(true);
    Mockito.when(comicDetail.isMissing()).thenReturn(false);
    Mockito.when(comicDetail.getFile()).thenReturn(comicFile);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(true);
    Mockito.when(comicBook.isPurging()).thenReturn(false);
    Mockito.when(comicBook.isBatchMetadataUpdate()).thenReturn(false);
    Mockito.when(comicBook.isEditDetails()).thenReturn(false);
    Mockito.when(comicBook.isUpdateMetadata()).thenReturn(false);
    Mockito.when(comicBook.getTargetArchiveType()).thenReturn(TEST_TARGET_ARCHIVE);
    Mockito.when(comicBook.isDeletePages()).thenReturn(false);
    Mockito.when(
            configurationService.getOptionValue(
                ConfigurationService.CFG_LIBRARY_PAGE_RENAMING_RULE, ""))
        .thenReturn(TEST_PAGE_RENAMING_RULE);
  }

  @Test
  void process_missing() throws Exception {
    Mockito.when(comicDetail.isMissing()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_fileContentsNotLoaded() throws Exception {
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(false);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_isPurging() throws Exception {
    Mockito.when(comicBook.isPurging()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_isBatchMetadataUpdate() throws Exception {
    Mockito.when(comicBook.isBatchMetadataUpdate()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_isEditDetails() throws Exception {
    Mockito.when(comicBook.isEditDetails()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_isUpdateMetadata() throws Exception {
    Mockito.when(comicBook.isUpdateMetadata()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_deleteMarkedPages() throws Exception {
    Mockito.when(comicBook.isDeletePages()).thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .save(comicBook, TEST_TARGET_ARCHIVE, true, TEST_PAGE_RENAMING_RULE);
  }

  @Test
  void process_adaptorExceptionOnSave() throws Exception {
    Mockito.doThrow(AdaptorException.class)
        .when(comicBookAdaptor)
        .save(
            Mockito.any(ComicBook.class),
            Mockito.any(ArchiveType.class),
            Mockito.anyBoolean(),
            Mockito.anyString());

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .save(comicBook, TEST_TARGET_ARCHIVE, false, TEST_PAGE_RENAMING_RULE);
  }

  @Test
  void process_sourceNotFound() throws Exception {
    Mockito.when(comicFile.exists()).thenReturn(false);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.never())
        .save(Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.anyString());
  }

  @Test
  void process_sourceNotFile() throws Exception {
    Mockito.when(comicFile.isFile()).thenReturn(false);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.never())
        .save(Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.anyString());
  }

  @Test
  void process() throws Exception {
    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .save(comicBook, TEST_TARGET_ARCHIVE, false, TEST_PAGE_RENAMING_RULE);
  }
}
