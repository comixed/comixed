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
import static org.comixedproject.model.admin.ConfigurationOption.CREATE_EXTERNAL_METADATA_FILE;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_NO_COMICINFO_ENTRY;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS;

import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.admin.ConfigurationService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class UpdateMetadataProcessorTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;
  private static final String TEST_TRUE = Boolean.TRUE.toString();
  private static final String TEST_FALSE = Boolean.FALSE.toString();

  @InjectMocks private UpdateMetadataProcessor processor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ConfigurationService configurationService;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;

  @Before
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
  }

  @Test
  public void testProcessUpdateException() throws Exception {
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
        .save(comicBook, TEST_ARCHIVE_TYPE, false, "");
  }

  @Test
  public void testProcessCreateExternalFileThrowsException() throws Exception {
    Mockito.when(configurationService.isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE))
        .thenReturn(true);
    Mockito.doThrow(AdaptorException.class)
        .when(comicBookAdaptor)
        .saveMetadataFile(Mockito.any(ComicBook.class));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(configurationService, Mockito.times(1))
        .isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).saveMetadataFile(comicBook);
  }

  @Test
  public void testProcessCreateExternalFile() throws Exception {
    Mockito.when(configurationService.isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE))
        .thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(configurationService, Mockito.times(1))
        .isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).saveMetadataFile(comicBook);
  }

  @Test
  public void testProcessForRarFile() throws Exception {
    Mockito.when(comicDetail.getArchiveType()).thenReturn(ArchiveType.CBR);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.never())
        .save(
            Mockito.any(ComicBook.class),
            Mockito.any(ArchiveType.class),
            Mockito.anyBoolean(),
            Mockito.anyString());
  }

  @Test
  public void testProcessNoComicInfoFileEnabled() throws Exception {
    Mockito.when(configurationService.isFeatureEnabled(CFG_LIBRARY_NO_COMICINFO_ENTRY))
        .thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.never())
        .save(
            Mockito.any(ComicBook.class),
            Mockito.any(ArchiveType.class),
            Mockito.anyBoolean(),
            Mockito.anyString());
  }

  @Test
  public void testProcessNoRecreateComicFileAlowed() throws Exception {
    Mockito.when(configurationService.isFeatureEnabled(CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.never())
        .save(
            Mockito.any(ComicBook.class),
            Mockito.any(ArchiveType.class),
            Mockito.anyBoolean(),
            Mockito.anyString());
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(configurationService.isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE))
        .thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .save(comicBook, TEST_ARCHIVE_TYPE, false, "");
    Mockito.verify(configurationService, Mockito.times(1))
        .isFeatureEnabled(CREATE_EXTERNAL_METADATA_FILE);
  }
}
