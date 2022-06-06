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
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookInsertProcessorTest {
  private static final String TEST_BASE_FILENAME = "comicBook.cbz";
  private static final String TEST_FILENAME = "/users/comixed/library/" + TEST_BASE_FILENAME;
  private static final String TEST_SERIES = "Test Series";
  private static final String TEST_VOLUME = "2021";
  private static final String TEST_ISSUE_NUMBER = "27";
  private static final Date TEST_COVER_DATE = new Date();

  @InjectMocks private ComicInsertProcessor processor;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicFileDescriptor descriptor;
  @Mock private FilenameScrapingRuleService filenameScrapingRuleService;
  @Mock private ComicBook comicBookRecord;
  @Mock private ComicBook comicBook;

  private FilenameMetadata filenameMetadata;

  @Before
  public void setUp() {
    Mockito.when(descriptor.getFilename()).thenReturn(TEST_FILENAME);
    filenameMetadata =
        new FilenameMetadata(true, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_COVER_DATE);
  }

  @Test
  public void testProcessFilenameUsed() throws Exception {
    Mockito.when(comicBookService.findByFilename(Mockito.anyString())).thenReturn(comicBookRecord);

    final ComicBook result = processor.process(descriptor);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1)).findByFilename(TEST_FILENAME);
  }

  @Test
  public void testProcessCreateComicException() throws Exception {
    Mockito.when(comicBookService.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicBookAdaptor.createComic(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    final ComicBook result = processor.process(descriptor);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1)).findByFilename(TEST_FILENAME);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).createComic(TEST_FILENAME);
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comicBookService.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicBookAdaptor.createComic(Mockito.anyString())).thenReturn(comicBook);
    Mockito.when(comicBook.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    Mockito.when(filenameScrapingRuleService.loadFilenameMetadata(Mockito.anyString()))
        .thenReturn(filenameMetadata);

    final ComicBook result = processor.process(descriptor);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBook, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicBook, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicBook, Mockito.times(1)).setCoverDate(TEST_COVER_DATE);

    Mockito.verify(comicBookService, Mockito.times(1)).findByFilename(TEST_FILENAME);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).createComic(TEST_FILENAME);
    Mockito.verify(filenameScrapingRuleService, Mockito.times(1))
        .loadFilenameMetadata(TEST_BASE_FILENAME);
  }

  @Test
  public void testProcessNoneApplied() throws Exception {
    Mockito.when(comicBookService.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicBookAdaptor.createComic(Mockito.anyString())).thenReturn(comicBook);
    Mockito.when(comicBook.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    Mockito.when(filenameScrapingRuleService.loadFilenameMetadata(Mockito.anyString()))
        .thenReturn(new FilenameMetadata());

    final ComicBook result = processor.process(descriptor);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBook, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(comicBook, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(comicBook, Mockito.never()).setIssueNumber(Mockito.anyString());
    Mockito.verify(comicBook, Mockito.never()).setCoverDate(Mockito.any(Date.class));

    Mockito.verify(comicBookService, Mockito.times(1)).findByFilename(TEST_FILENAME);
    Mockito.verify(filenameScrapingRuleService, Mockito.times(1))
        .loadFilenameMetadata(TEST_BASE_FILENAME);
  }
}
