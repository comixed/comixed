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

import static junit.framework.TestCase.*;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_NO_COMICINFO_ENTRY;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS;
import static org.comixedproject.service.admin.ConfigurationService.CREATE_EXTERNAL_METADATA_FILE;
import static org.mockito.Mockito.*;

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
class UpdateMetadataProcessorTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;

  @InjectMocks private UpdateMetadataProcessor processor;
  @Mock private ComicAdaptor comicAdaptor;
  @Mock private ConfigurationService configurationService;
  @Mock private Comic comic;

  @BeforeEach
  void setUp() {
    when(comic.isLoadingFileContents()).thenReturn(false);
    when(comic.isPurging()).thenReturn(false);
    when(comic.isBatchUpdatingMetadata()).thenReturn(false);
    when(comic.isEditingMetadata()).thenReturn(false);
    when(comic.isMissing()).thenReturn(false);
    when(comic.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
  }

  @Test
  void process_missing() {
    when(comic.isMissing()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isLoadingFileContents() {
    when(comic.isLoadingFileContents()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isPurging() {
    when(comic.isPurging()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isBatchUpdatingMetadata() {
    when(comic.isBatchUpdatingMetadata()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isEditingMetadata() {
    when(comic.isEditingMetadata()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_updateException() throws Exception {
    doThrow(AdaptorException.class)
        .when(comicAdaptor)
        .save(Mockito.any(Comic.class), Mockito.any(ArchiveType.class), Mockito.anyString());

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).save(comic, TEST_ARCHIVE_TYPE, "");
  }

  @Test
  void process_createExternalFileThrowsException() throws Exception {
    when(configurationService.isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE)).thenReturn(true);
    doThrow(AdaptorException.class).when(comicAdaptor).saveMetadataFile(Mockito.any(Comic.class));

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(configurationService).isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE);
    verify(comicAdaptor).saveMetadataFile(comic);
  }

  @Test
  void process_createExternalFile() throws Exception {
    when(configurationService.isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE)).thenReturn(true);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(configurationService).isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE);
    verify(comicAdaptor).saveMetadataFile(comic);
  }

  @Test
  void process_forRarFile() throws Exception {
    when(comic.getArchiveType()).thenReturn(ArchiveType.CBR);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor, never())
        .save(Mockito.any(Comic.class), Mockito.any(ArchiveType.class), Mockito.anyString());
  }

  @Test
  void process_noComicInfoFileEnabled() throws Exception {
    when(configurationService.isFeatureEnabled(CFG_LIBRARY_NO_COMICINFO_ENTRY)).thenReturn(true);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor, never())
        .save(Mockito.any(Comic.class), Mockito.any(ArchiveType.class), Mockito.anyString());
  }

  @Test
  void process_noRecreateComicFileAlowed() throws Exception {
    when(configurationService.isFeatureEnabled(CFG_LIBRARY_NO_RECREATE_COMICS)).thenReturn(true);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor, never())
        .save(Mockito.any(Comic.class), Mockito.any(ArchiveType.class), Mockito.anyString());
  }

  @Test
  void process() throws Exception {
    when(configurationService.isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE)).thenReturn(true);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).save(comic, TEST_ARCHIVE_TYPE, "");
    verify(configurationService).isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE);
  }
}
