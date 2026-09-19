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

import static junit.framework.TestCase.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Date;
import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicAdaptor;
import org.comixedproject.adaptors.content.ComicInfoXmlFilenameContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorException;
import org.comixedproject.adaptors.content.ContentAdaptorRegistry;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataService;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LoadFileContentsProcessorTest {
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example-metadata.cbz";
  private static final String TEST_METADATA_FILENAME = "src/test/resources/example-metadata.xml";
  private static final String TEST_PROVIDER_NAME = "Provider Name";
  private static final String TEST_WEB_ADDRESS = "The metadata web reference";
  private static final String TEST_REFERENCE_ID = "The reference id";
  private static final Date TEST_LAST_SCRAPED_DATE = new Date();

  @InjectMocks private LoadFileContentsProcessor processor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ComicAdaptor comicAdaptor;
  @Mock private ContentAdaptorRegistry contentAdaptorRegistry;
  @Mock private ComicInfoXmlFilenameContentAdaptor comicInfoXmlFilenameContentAdaptor;
  @Mock private MetadataService metadataService;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private MetadataAdaptor metadataAdaptor;
  @Mock private MetadataAdaptorProvider metadataAdaptorProvider;
  @Mock private MetadataSource metadataSource;
  @Mock private Comic comic;
  @Mock private ComicMetadataSource comicMetadata;
  @Mock private List<ComicPage> pageList;

  @Captor private ArgumentCaptor<byte[]> contentArgumentAdaptorArgumentCaptor;
  @Captor private ArgumentCaptor<ComicMetadataSource> comicMetadataSourceArgumentCaptor;

  @BeforeEach
  void setUp() throws ContentAdaptorException, AdaptorException {
    doNothing().when(comic).setMetadata(comicMetadataSourceArgumentCaptor.capture());
    when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    when(comic.isMissing()).thenReturn(false);
    when(comic.getLastScrapedDate()).thenReturn(TEST_LAST_SCRAPED_DATE);
    when(comic.isLoadingFileContents()).thenReturn(true);
    when(comicAdaptor.getMetadataFilename(anyString())).thenReturn(TEST_METADATA_FILENAME);
    when(contentAdaptorRegistry.getContentAdaptorForFilename(anyString()))
        .thenReturn(comicInfoXmlFilenameContentAdaptor);
    doNothing()
        .when(comicInfoXmlFilenameContentAdaptor)
        .loadContent(any(Comic.class), anyString(), contentArgumentAdaptorArgumentCaptor.capture());
    doNothing().when(comicAdaptor).load(any(Comic.class));
    when(metadataAdaptorProvider.create()).thenReturn(metadataAdaptor);
    when(metadataAdaptor.getReferenceId(anyString())).thenReturn(TEST_REFERENCE_ID);
    when(fileTypeAdaptor.getArchiveAdaptorFor(anyString())).thenReturn(archiveAdaptor);
  }

  @Test
  void process_missing() {
    when(comic.isMissing()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process() throws Exception {
    when(comic.getPages()).thenReturn(pageList);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    final byte[] content = contentArgumentAdaptorArgumentCaptor.getValue();
    assertNotNull(content);

    verify(fileTypeAdaptor).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    verify(comicAdaptor).load(comic);
    verify(comicAdaptor).sortPages(any());
    verify(comicInfoXmlFilenameContentAdaptor).loadContent(comic, "", content);
  }

  @Test
  void process_metadataSourceFound() throws Exception {
    when(comic.getWebAddress()).thenReturn(TEST_WEB_ADDRESS);
    when(metadataService.findForWebAddress(anyString())).thenReturn(metadataAdaptorProvider);
    when(metadataAdaptorProvider.getName()).thenReturn(TEST_PROVIDER_NAME);
    when(metadataSourceService.getByAdaptorName(anyString())).thenReturn(metadataSource);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    final ComicMetadataSource comicMetadataSource = comicMetadataSourceArgumentCaptor.getValue();
    assertNotNull(comicMetadataSource);
    assertSame(metadataSource, comicMetadataSource.getMetadataSource());
    assertEquals(TEST_REFERENCE_ID, comicMetadataSource.getReferenceId());
    assertSame(TEST_LAST_SCRAPED_DATE, comicMetadataSource.getLastScrapedDate());

    verify(comicAdaptor).load(comic);
  }

  @Test
  void process_hasMetadataSourceAndMetadataSourceFound() throws Exception {
    when(comic.getMetadata()).thenReturn(comicMetadata);
    when(comic.getWebAddress()).thenReturn(TEST_WEB_ADDRESS);
    when(metadataService.findForWebAddress(anyString())).thenReturn(metadataAdaptorProvider);
    when(metadataAdaptorProvider.getName()).thenReturn(TEST_PROVIDER_NAME);
    when(metadataSourceService.getByAdaptorName(anyString())).thenReturn(metadataSource);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).load(comic);
    verify(comicMetadata).setMetadataSource(metadataSource);
    verify(comicMetadata).setReferenceId(TEST_REFERENCE_ID);
  }

  @Test
  void process_contentsAlreadyLoaded() throws Exception {
    when(comic.isLoadingFileContents()).thenReturn(false);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor, never()).load(any());
    verify(comicInfoXmlFilenameContentAdaptor, never()).loadContent(any(), any(), any());
  }

  @Test
  void process_skippingMetadataNotProvided() throws Exception {
    when(comic.getPages()).thenReturn(pageList);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    final byte[] content = contentArgumentAdaptorArgumentCaptor.getValue();
    assertNotNull(content);

    verify(comicAdaptor).load(comic);
    verify(comicAdaptor).sortPages(any());
    verify(comicInfoXmlFilenameContentAdaptor).loadContent(comic, "", content);
  }

  @Test
  void process_noExternalMetadataFile() throws Exception {
    when(comic.getPages()).thenReturn(pageList);
    when(comicAdaptor.getMetadataFilename(anyString()))
        .thenReturn(TEST_METADATA_FILENAME.substring(1));

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).load(comic);
    verify(comicAdaptor).sortPages(any());
    verify(comicInfoXmlFilenameContentAdaptor, never())
        .loadContent(any(Comic.class), anyString(), any(byte[].class));
  }

  @Test
  void process_withExternalMetadataFile() throws Exception {
    when(comic.getPages()).thenReturn(pageList);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).load(comic);
    verify(comicAdaptor).sortPages(any());
  }

  @Test
  void process_adaptorException() throws Exception {
    doThrow(AdaptorException.class).when(comicAdaptor).load(any(Comic.class));

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(comicAdaptor).load(comic);
  }
}
