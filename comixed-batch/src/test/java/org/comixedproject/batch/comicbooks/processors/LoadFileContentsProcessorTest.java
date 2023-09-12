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
import static org.comixedproject.batch.comicbooks.AddComicsConfiguration.PARAM_SKIP_METADATA;

import java.util.List;
import java.util.Map;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.content.ComicMetadataContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorException;
import org.comixedproject.adaptors.content.ContentAdaptorRules;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameter;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@RunWith(MockitoJUnitRunner.class)
public class LoadFileContentsProcessorTest {
  private static final String TEST_METADATA_FILENAME = "src/test/resources/example.meta";

  @InjectMocks private LoadFileContentsProcessor processor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicMetadataContentAdaptor comicMetadataContentAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private List<Page> pageList;
  @Mock private Map<String, JobParameter> parameters;
  @Mock private JobParameters jobParameters;
  @Mock private JobExecution jobExecution;
  @Mock private StepExecution stepExecution;

  @Captor private ArgumentCaptor<byte[]> contentArgumentAdaptorArgumentCaptor;
  @Captor private ArgumentCaptor<ContentAdaptorRules> comicBookContentAdaptorRulesArgumentCaptor;
  @Captor private ArgumentCaptor<ContentAdaptorRules> contentAdaptorRulesArgumentCaptor;

  @Before
  public void setUp() throws ContentAdaptorException, AdaptorException {
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

    Mockito.when(parameters.containsKey(PARAM_SKIP_METADATA)).thenReturn(true);
    Mockito.when(jobParameters.getParameters()).thenReturn(parameters);
    Mockito.when(jobParameters.getString(PARAM_SKIP_METADATA)).thenReturn(Boolean.FALSE.toString());
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    processor.beforeStep(stepExecution);
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
  public void testProcessSkippingMetadataNotProvided() throws Exception {
    Mockito.when(parameters.containsKey(PARAM_SKIP_METADATA)).thenReturn(false);
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
  public void testProcessSkippingMetadata() throws Exception {
    Mockito.when(jobParameters.getString(PARAM_SKIP_METADATA)).thenReturn(Boolean.TRUE.toString());
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final ContentAdaptorRules comicBookRules =
        comicBookContentAdaptorRulesArgumentCaptor.getValue();
    assertNotNull(comicBookRules);
    assertTrue(comicBookRules.isSkipMetadata());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook, comicBookRules);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
    Mockito.verify(comicMetadataContentAdaptor, Mockito.never())
        .loadContent(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());
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

  @Test
  public void testAfterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}
