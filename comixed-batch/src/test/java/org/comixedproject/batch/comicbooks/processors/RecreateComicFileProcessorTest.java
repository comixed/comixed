/*
 * ComiXed - A digital comic book library management application.
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
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
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
  @Mock private ConfigurationService configurationService;
  @Mock private ComicAdaptor comicAdaptor;
  @Mock private File comicFile;
  @Mock private Comic comic;

  @BeforeEach
  void setUp() {
    when(comicFile.exists()).thenReturn(true);
    when(comicFile.isFile()).thenReturn(true);
    when(comic.isMissing()).thenReturn(false);
    when(comic.getFile()).thenReturn(comicFile);
    when(comic.isLoadingFileContents()).thenReturn(false);
    when(comic.isPurging()).thenReturn(false);
    when(comic.isBatchUpdatingMetadata()).thenReturn(false);
    when(comic.isEditingMetadata()).thenReturn(false);
    when(comic.isUpdatingMetadata()).thenReturn(false);
    when(comic.getTargetArchiveType()).thenReturn(TEST_TARGET_ARCHIVE);
    when(configurationService.getOptionValue(
            ConfigurationService.CFG_LIBRARY_PAGE_RENAMING_RULE, ""))
        .thenReturn(TEST_PAGE_RENAMING_RULE);
  }

  @Test
  void process_missing() throws Exception {
    when(comic.isMissing()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_fileContentsNotLoaded() throws Exception {
    when(comic.isLoadingFileContents()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isPurging() throws Exception {
    when(comic.isPurging()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isBatchMetadataUpdate() throws Exception {
    when(comic.isBatchUpdatingMetadata()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isEditDetails() throws Exception {
    when(comic.isEditingMetadata()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isUpdateMetadata() throws Exception {
    when(comic.isUpdatingMetadata()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_adaptorExceptionOnSave() throws Exception {
    doThrow(AdaptorException.class)
        .when(comicAdaptor)
        .save(Mockito.any(Comic.class), Mockito.any(ArchiveType.class), Mockito.anyString());

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).save(comic, TEST_TARGET_ARCHIVE, TEST_PAGE_RENAMING_RULE);
  }

  @Test
  void process_sourceNotFound() throws Exception {
    when(comicFile.exists()).thenReturn(false);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor, never()).save(Mockito.any(), Mockito.any(), Mockito.anyString());
  }

  @Test
  void process_sourceNotFile() throws Exception {
    when(comicFile.isFile()).thenReturn(false);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor, never()).save(Mockito.any(), Mockito.any(), Mockito.anyString());
  }

  @Test
  void process() throws Exception {
    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).save(comic, TEST_TARGET_ARCHIVE, TEST_PAGE_RENAMING_RULE);
  }
}
