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

import java.util.Date;
import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.content.ComicInfoXmlFilenameContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorException;
import org.comixedproject.adaptors.content.ContentAdaptorRegistry;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
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
  @Mock private ComicCheckOutManager comicCheckOutManager;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ContentAdaptorRegistry contentAdaptorRegistry;
  @Mock private ComicInfoXmlFilenameContentAdaptor comicInfoXmlFilenameContentAdaptor;
  @Mock private MetadataService metadataService;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private MetadataAdaptor metadataAdaptor;
  @Mock private MetadataAdaptorProvider metadataAdaptorProvider;
  @Mock private MetadataSource metadataSource;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicMetadataSource comicMetadata;
  @Mock private ComicBook comicBook;
  @Mock private List<ComicPage> pageList;

  @Captor private ArgumentCaptor<byte[]> contentArgumentAdaptorArgumentCaptor;
  @Captor private ArgumentCaptor<ComicMetadataSource> comicMetadataSourceArgumentCaptor;

  @BeforeEach
  public void setUp() throws ContentAdaptorException, AdaptorException {
    Mockito.doNothing().when(comicBook).setMetadata(comicMetadataSourceArgumentCaptor.capture());
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(comicDetail.isMissing()).thenReturn(false);
    Mockito.when(comicBook.getLastScrapedDate()).thenReturn(TEST_LAST_SCRAPED_DATE);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(false);
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.anyString()))
        .thenReturn(TEST_METADATA_FILENAME);
    Mockito.when(contentAdaptorRegistry.getContentAdaptorForFilename(Mockito.anyString()))
        .thenReturn(comicInfoXmlFilenameContentAdaptor);
    Mockito.doNothing()
        .when(comicInfoXmlFilenameContentAdaptor)
        .loadContent(
            Mockito.any(ComicBook.class),
            Mockito.anyString(),
            contentArgumentAdaptorArgumentCaptor.capture());
    Mockito.doNothing().when(comicBookAdaptor).load(Mockito.any(ComicBook.class));
    Mockito.when(metadataAdaptorProvider.create()).thenReturn(metadataAdaptor);
    Mockito.when(metadataAdaptor.getReferenceId(Mockito.anyString())).thenReturn(TEST_REFERENCE_ID);
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenReturn(archiveAdaptor);
  }

  @Test
  void process_missing() {
    Mockito.when(comicDetail.isMissing()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final byte[] content = contentArgumentAdaptorArgumentCaptor.getValue();
    assertNotNull(content);

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).sortPages(Mockito.any());
    Mockito.verify(comicInfoXmlFilenameContentAdaptor, Mockito.times(1))
        .loadContent(comicBook, "", content);
  }

  @Test
  void process_metadataSourceFound() throws Exception {
    Mockito.when(comicDetail.getWebAddress()).thenReturn(TEST_WEB_ADDRESS);
    Mockito.when(metadataService.findForWebAddress(Mockito.anyString()))
        .thenReturn(metadataAdaptorProvider);
    Mockito.when(metadataAdaptorProvider.getName()).thenReturn(TEST_PROVIDER_NAME);
    Mockito.when(metadataSourceService.getByAdaptorName(Mockito.anyString()))
        .thenReturn(metadataSource);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ComicMetadataSource comicMetadataSource = comicMetadataSourceArgumentCaptor.getValue();
    assertNotNull(comicMetadataSource);
    assertSame(metadataSource, comicMetadataSource.getMetadataSource());
    assertEquals(TEST_REFERENCE_ID, comicMetadataSource.getReferenceId());
    assertSame(TEST_LAST_SCRAPED_DATE, comicMetadataSource.getLastScrapedDate());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
  }

  @Test
  void process_hasMetadataSourceAndMetadataSourceFound() throws Exception {
    Mockito.when(comicBook.getMetadata()).thenReturn(comicMetadata);
    Mockito.when(comicDetail.getWebAddress()).thenReturn(TEST_WEB_ADDRESS);
    Mockito.when(metadataService.findForWebAddress(Mockito.anyString()))
        .thenReturn(metadataAdaptorProvider);
    Mockito.when(metadataAdaptorProvider.getName()).thenReturn(TEST_PROVIDER_NAME);
    Mockito.when(metadataSourceService.getByAdaptorName(Mockito.anyString()))
        .thenReturn(metadataSource);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(comicMetadata, Mockito.times(1)).setMetadataSource(metadataSource);
    Mockito.verify(comicMetadata, Mockito.times(1)).setReferenceId(TEST_REFERENCE_ID);
  }

  @Test
  void process_contentsAlreadyLoaded() throws Exception {
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.never()).load(Mockito.any());
    Mockito.verify(comicInfoXmlFilenameContentAdaptor, Mockito.never())
        .loadContent(Mockito.any(), Mockito.any(), Mockito.any());
  }

  @Test
  void process_skippingMetadataNotProvided() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final byte[] content = contentArgumentAdaptorArgumentCaptor.getValue();
    assertNotNull(content);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).sortPages(Mockito.any());
    Mockito.verify(comicInfoXmlFilenameContentAdaptor, Mockito.times(1))
        .loadContent(comicBook, "", content);
  }

  @Test
  void process_noExternalMetadataFile() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.anyString()))
        .thenReturn(TEST_METADATA_FILENAME.substring(1));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).sortPages(Mockito.any());
    Mockito.verify(comicInfoXmlFilenameContentAdaptor, Mockito.never())
        .loadContent(Mockito.any(ComicBook.class), Mockito.anyString(), Mockito.any(byte[].class));
  }

  @Test
  void process_withExternalMetadataFile() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).sortPages(Mockito.any());
  }

  @Test
  void process_adaptorException() throws Exception {
    Mockito.doThrow(AdaptorException.class)
        .when(comicBookAdaptor)
        .load(Mockito.any(ComicBook.class));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
  }
}
