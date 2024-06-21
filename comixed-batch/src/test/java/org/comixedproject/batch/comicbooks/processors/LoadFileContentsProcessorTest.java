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
import static junit.framework.TestCase.assertFalse;

import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.content.ComicMetadataContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorException;
import org.comixedproject.adaptors.content.ContentAdaptorRules;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataService;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LoadFileContentsProcessorTest {
  private static final String TEST_METADATA_FILENAME = "src/test/resources/example-metadata.xml";
  private static final String TEST_PROVIDER_NAME = "Provider Name";
  private static final String TEST_WEB_ADDRESS = "The metadata web reference";
  private static final String TEST_REFERENCE_ID = "The reference id";

  @InjectMocks private LoadFileContentsProcessor processor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicMetadataContentAdaptor comicMetadataContentAdaptor;
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
  @Captor private ArgumentCaptor<ContentAdaptorRules> comicBookContentAdaptorRulesArgumentCaptor;
  @Captor private ArgumentCaptor<ContentAdaptorRules> contentAdaptorRulesArgumentCaptor;
  @Captor private ArgumentCaptor<ComicMetadataSource> comicMetadataSourceArgumentCaptor;

  @Before
  public void setUp() throws ContentAdaptorException, AdaptorException, InterruptedException {
    Mockito.doNothing().when(comicBook).setMetadata(comicMetadataSourceArgumentCaptor.capture());
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(false);
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_METADATA_FILENAME);
    Mockito.doNothing()
        .when(comicMetadataContentAdaptor)
        .loadContent(
            Mockito.any(ComicBook.class),
            Mockito.anyString(),
            contentArgumentAdaptorArgumentCaptor.capture(),
            contentAdaptorRulesArgumentCaptor.capture());
    Mockito.doNothing()
        .when(comicBookAdaptor)
        .load(Mockito.any(ComicBook.class), comicBookContentAdaptorRulesArgumentCaptor.capture());
    Mockito.when(metadataAdaptorProvider.create()).thenReturn(metadataAdaptor);
    Mockito.when(metadataAdaptor.getReferenceId(Mockito.anyString())).thenReturn(TEST_REFERENCE_ID);
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final byte[] content = contentArgumentAdaptorArgumentCaptor.getValue();
    assertNotNull(content);

    final ContentAdaptorRules comicBookRules =
        comicBookContentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(comicBookRules);
    assertFalse(comicBookRules.isSkipMetadata());

    final ContentAdaptorRules contentRules = contentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(contentRules);
    assertFalse(contentRules.isSkipMetadata());

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .load(comicBook, comicBookContentAdaptorRulesArgumentCaptor.getValue());
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
    Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1))
        .loadContent(comicBook, "", content, contentRules);
  }

  @Test
  public void testProcessMetadataSourceFound() throws Exception {
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

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .load(comicBook, comicBookContentAdaptorRulesArgumentCaptor.getValue());
  }

  @Test
  public void testProcessHasMetadataSourceAndMetadataSourceFound() throws Exception {
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

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .load(comicBook, comicBookContentAdaptorRulesArgumentCaptor.getValue());
    Mockito.verify(comicMetadata, Mockito.times(1)).setMetadataSource(metadataSource);
    Mockito.verify(comicMetadata, Mockito.times(1)).setReferenceId(TEST_REFERENCE_ID);
  }

  @Test
  public void testProcessContentsAlreadyLoaded() throws Exception {
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(true);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.never()).load(Mockito.any(), Mockito.any());
    Mockito.verify(comicMetadataContentAdaptor, Mockito.never())
        .loadContent(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());
  }

  @Test
  public void testProcessSkippingMetadataNotProvided() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final byte[] content = contentArgumentAdaptorArgumentCaptor.getValue();
    assertNotNull(content);

    final ContentAdaptorRules comicBookRules =
        comicBookContentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(comicBookRules);
    assertFalse(comicBookRules.isSkipMetadata());

    final ContentAdaptorRules contentRules = contentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(contentRules);
    assertFalse(contentRules.isSkipMetadata());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook, comicBookRules);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
    Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1))
        .loadContent(comicBook, "", content, contentRules);
  }

  @Test
  public void testProcessNoExternalMetadataFile() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_METADATA_FILENAME.substring(1));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ContentAdaptorRules comicBookRules =
        comicBookContentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(comicBookRules);
    assertFalse(comicBookRules.isSkipMetadata());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook, comicBookRules);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
    Mockito.verify(comicMetadataContentAdaptor, Mockito.never())
        .loadContent(
            Mockito.any(ComicBook.class),
            Mockito.anyString(),
            Mockito.any(byte[].class),
            Mockito.any(ContentAdaptorRules.class));
  }

  @Test
  public void testProcessWithExternalMetadataFile() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ContentAdaptorRules comicBookRules =
        comicBookContentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(comicBookRules);
    assertFalse(comicBookRules.isSkipMetadata());

    final ContentAdaptorRules contentRules = contentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(contentRules);
    assertFalse(contentRules.isSkipMetadata());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook, comicBookRules);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
  }

  @Test
  public void testProcessAdaptorException() throws Exception {
    Mockito.doThrow(AdaptorException.class)
        .when(comicBookAdaptor)
        .load(Mockito.any(ComicBook.class), comicBookContentAdaptorRulesArgumentCaptor.capture());

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ContentAdaptorRules comicRookRules =
        comicBookContentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(comicRookRules);
    assertFalse(comicRookRules.isSkipMetadata());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook, comicRookRules);
  }
}
