/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.service.comicfiles;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicfiles.ComicFileGroup;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicFileServiceTest {
  private static final String TEST_ARCHIVE_FILENAME = "example.cbz";
  private static final byte[] TEST_COVER_CONTENT = "this is image data".getBytes();
  private static final String TEST_ROOT_DIRECTORY = "src/test/resources";
  private static final String TEST_COMIC_ARCHIVE =
      new File(TEST_ROOT_DIRECTORY + "/" + TEST_ARCHIVE_FILENAME).getAbsolutePath();
  private static final int TEST_LIMIT = 2;
  private static final int TEST_NO_LIMIT = -1;
  private static final String TEST_SERIES_NAME = "The Series Name";
  private static final String TEST_VOLUME = "2024";
  private static final String TEST_ISSUE_NUMBER = "717";
  private static final Date TEST_COVER_DATE = new Date();

  @InjectMocks private ComicFileService service;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private FilenameScrapingRuleService filenameScrapingRuleService;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;
  @Mock private FilenameMetadata metadata;

  @Captor private ArgumentCaptor<ComicBook> comicBookArgumentCaptor;

  private List<String> filenameList = new ArrayList<>();

  @Before
  public void setUp() throws AdaptorException {
    filenameList.add(TEST_COMIC_ARCHIVE);

    Mockito.doNothing()
        .when(comicStateHandler)
        .fireEvent(comicBookArgumentCaptor.capture(), Mockito.any(ComicEvent.class));
    Mockito.when(comicDetail.getBaseFilename()).thenReturn(TEST_ARCHIVE_FILENAME);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBookAdaptor.createComic(Mockito.anyString())).thenReturn(comicBook);
    Mockito.when(metadata.isFound()).thenReturn(false);
    Mockito.when(filenameScrapingRuleService.loadFilenameMetadata(Mockito.anyString()))
        .thenReturn(metadata);
  }

  @Test
  public void testGetImportFileCoverWithNoCover() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadCover(Mockito.anyString())).thenReturn(null);

    assertNull(service.getImportFileCover(TEST_COMIC_ARCHIVE));

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadCover(TEST_COMIC_ARCHIVE);
  }

  @Test
  public void testGetImportFileCover() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadCover(Mockito.anyString())).thenReturn(TEST_COVER_CONTENT);

    final byte[] result = service.getImportFileCover(TEST_COMIC_ARCHIVE);

    assertNotNull(result);
    assertEquals(TEST_COVER_CONTENT, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadCover(TEST_COMIC_ARCHIVE);
  }

  @Test
  public void testGetAllComicsUnderInvalidDirectory() throws IOException {
    final List<ComicFileGroup> result =
        service.getAllComicsUnder(TEST_ROOT_DIRECTORY + "/nonexistent", TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetAllComicsUnderWithFileSupplied() throws IOException {
    final List<ComicFileGroup> result = service.getAllComicsUnder(TEST_COMIC_ARCHIVE, TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetAllComicsAlreadyImported() throws IOException {
    Mockito.when(comicFileAdaptor.isComicFile(Mockito.any(File.class))).thenReturn(true);
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(true);

    final List<ComicFileGroup> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .filenameFound(new File(TEST_COMIC_ARCHIVE).getCanonicalPath().replace("\\", "/"));
  }

  @Test
  public void testGetAllComicsUnderWithLimit() throws IOException {
    Mockito.when(comicFileAdaptor.isComicFile(Mockito.any(File.class))).thenReturn(true);

    final List<ComicFileGroup> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_LIMIT);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(
        TEST_LIMIT,
        result.stream()
            .map(comicFileGroup -> comicFileGroup.getFiles().size())
            .reduce((sum, size) -> sum += size)
            .get()
            .intValue());
  }

  @Test
  public void testGetAllComicsUnder() throws IOException {
    Mockito.when(comicFileAdaptor.isComicFile(Mockito.any(File.class))).thenCallRealMethod();

    final List<ComicFileGroup> result =
        service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_NO_LIMIT);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(1, result.size());
    assertEquals(3, result.get(0).getFiles().size());
  }

  @Test
  public void testGetAllComicsUnderWithExistingComicBook() throws IOException {
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(true);
    Mockito.when(comicFileAdaptor.isComicFile(Mockito.any(File.class))).thenCallRealMethod();

    final List<ComicFileGroup> result =
        service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_NO_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(comicBookService, Mockito.atLeast(1)).filenameFound(Mockito.anyString());
  }

  @Test
  public void testImporComicFilesAlreadyFound() {
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(true);

    service.importComicFiles(filenameList);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_ARCHIVE);
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  public void testImporComicFiles() throws AdaptorException {
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(false);

    service.importComicFiles(filenameList);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_ARCHIVE);
    Mockito.verify(comicBookAdaptor, Mockito.times(filenameList.size()))
        .createComic(TEST_COMIC_ARCHIVE);
    Mockito.verify(filenameScrapingRuleService, Mockito.times(filenameList.size()))
        .loadFilenameMetadata(TEST_ARCHIVE_FILENAME);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.readygForProcessing);
  }

  @Test
  public void testImporComicFilesComicBookAdaptorException() throws AdaptorException {
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(false);
    Mockito.when(comicBookAdaptor.createComic(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    service.importComicFiles(filenameList);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_ARCHIVE);
    Mockito.verify(comicBookAdaptor, Mockito.times(filenameList.size()))
        .createComic(TEST_COMIC_ARCHIVE);
    Mockito.verify(filenameScrapingRuleService, Mockito.never())
        .loadFilenameMetadata(Mockito.anyString());
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  public void testImporComicFilesWithFilenameMetadata() throws AdaptorException {
    Mockito.when(metadata.isFound()).thenReturn(true);
    Mockito.when(metadata.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(metadata.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(metadata.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(metadata.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(comicBookService.filenameFound(Mockito.anyString())).thenReturn(false);

    service.importComicFiles(filenameList);

    Mockito.verify(comicBookService, Mockito.times(1)).filenameFound(TEST_COMIC_ARCHIVE);
    Mockito.verify(comicBookAdaptor, Mockito.times(filenameList.size()))
        .createComic(TEST_COMIC_ARCHIVE);
    Mockito.verify(filenameScrapingRuleService, Mockito.times(filenameList.size()))
        .loadFilenameMetadata(TEST_ARCHIVE_FILENAME);
    Mockito.verify(comicDetail, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(comicDetail, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicDetail, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicDetail, Mockito.times(1)).setCoverDate(TEST_COVER_DATE);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.readygForProcessing);
  }
}
