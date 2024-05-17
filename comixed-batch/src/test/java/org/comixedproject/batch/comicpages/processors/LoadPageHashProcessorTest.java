/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicpages.processors;

import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LoadPageHashProcessorTest {
  private static final byte[] TEST_CONTENT = "The page content".getBytes();
  private static final Integer TEST_PAGE_NUMBER = 17;
  private static final String TEST_PAGE_HASH = "OICU812";

  @InjectMocks private LoadPageHashProcessor processor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private ComicPage page;
  @Mock private ComicBook comicBook;

  @Before
  public void setUp() throws AdaptorException {
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PAGE_HASH);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_CONTENT);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_NUMBER);
  }

  @Test
  public void testProcessCreateHashException() throws Exception {
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    processor.process(page);

    Mockito.verify(genericUtilitiesAdaptor, Mockito.never()).createHash(Mockito.any(byte[].class));
    Mockito.verify(page, Mockito.never()).setHash(TEST_PAGE_HASH);
  }

  @Test
  public void testProcess() throws Exception {

    processor.process(page);

    Mockito.verify(genericUtilitiesAdaptor, Mockito.times(1)).createHash(TEST_CONTENT);
    Mockito.verify(page, Mockito.times(1)).setHash(TEST_PAGE_HASH);
  }
}
