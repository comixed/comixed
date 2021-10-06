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

import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.scraping.ScrapingRuleService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicInsertProcessorTest {
  private static final String TEST_FILENAME = "/users/comixed/library/comic.cbz";

  @InjectMocks private ComicInsertProcessor processor;
  @Mock private ComicService comicService;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ComicFileDescriptor descriptor;
  @Mock private ScrapingRuleService scrapingRuleService;
  @Mock private Comic comicRecord;

  @Captor private ArgumentCaptor<Comic> comicArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(descriptor.getFilename()).thenReturn(TEST_FILENAME);
  }

  @Test
  public void testProcessFilenameUsed() throws Exception {
    Mockito.when(comicService.findByFilename(Mockito.anyString())).thenReturn(comicRecord);

    final Comic result = processor.process(descriptor);

    assertNull(result);

    Mockito.verify(comicService, Mockito.times(1)).findByFilename(TEST_FILENAME);
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comicService.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.doNothing().when(comicFileHandler).loadComicArchiveType(comicArgumentCaptor.capture());

    final Comic result = processor.process(descriptor);

    final Comic comic = comicArgumentCaptor.getValue();
    assertNotNull(comic);
    assertEquals(TEST_FILENAME, comic.getFilename());

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).findByFilename(TEST_FILENAME);
    Mockito.verify(scrapingRuleService, Mockito.times(1)).scrapeFilename(comic);
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComicArchiveType(comic);
  }
}
