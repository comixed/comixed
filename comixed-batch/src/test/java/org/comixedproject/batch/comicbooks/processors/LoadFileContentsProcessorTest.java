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

import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.content.ComicMetadataContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorException;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LoadFileContentsProcessorTest {
  private static final String TEST_METADATA_FILENAME = "src/test/resources/example.meta";

  @InjectMocks private LoadFileContentsProcessor processor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicMetadataContentAdaptor comicMetadataContentAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private List<Page> pageList;

  @Captor private ArgumentCaptor<byte[]> contentArgumentAdaptor;

  @Before
  public void setUp() throws ContentAdaptorException {
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_METADATA_FILENAME);
    Mockito.doNothing()
        .when(comicMetadataContentAdaptor)
        .loadContent(
            Mockito.any(ComicBook.class), Mockito.anyString(), contentArgumentAdaptor.capture());
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    final byte[] content = contentArgumentAdaptor.getValue();
    assertNotNull(content);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
    Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1))
        .loadContent(comicBook, "", content);
  }

  @Test
  public void testProcessNoExternalMetadataFile() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_METADATA_FILENAME.substring(1));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
    Mockito.verify(comicMetadataContentAdaptor, Mockito.never())
        .loadContent(
            Mockito.any(ComicBook.class), Mockito.anyString(), contentArgumentAdaptor.capture());
  }

  @Test
  public void testProcessWithExternalMetadataFile() throws Exception {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
  }

  @Test
  public void testProcessAdaptorException() throws Exception {
    Mockito.doThrow(AdaptorException.class)
        .when(comicBookAdaptor)
        .load(Mockito.any(ComicBook.class));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comicBook);
  }
}
