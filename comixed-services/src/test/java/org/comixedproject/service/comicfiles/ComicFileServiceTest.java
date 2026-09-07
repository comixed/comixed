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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.batch.LoadComicBooksEvent;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicfiles.ComicFile;
import org.comixedproject.model.comicfiles.ComicFileGroup;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicFileServiceTest {
  private static final String TEST_ARCHIVE_FILENAME = "example.cbz";
  private static final byte[] TEST_COVER_CONTENT = "this is image data".getBytes();
  private static final String TEST_ROOT_DIRECTORY =
      new File("src/test/resources").getAbsolutePath();
  private static final String TEST_COMIC_ARCHIVE =
      String.format("%s%s%s", TEST_ROOT_DIRECTORY, File.separator, TEST_ARCHIVE_FILENAME);
  private static final int TEST_LIMIT = 2;
  private static final int TEST_NO_LIMIT = -1;
  private static final String TEST_SERIES_NAME = "The Series Name";
  private static final String TEST_VOLUME = "2024";
  private static final String TEST_ISSUE_NUMBER = "717";
  private static final Date TEST_COVER_DATE = new Date();
  private static final boolean TEST_SELECTED = RandomUtils.nextBoolean();
  private static final long TEST_FILE_SIZE = 867530L;

  @InjectMocks private ComicFileService service;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ComicStateAdaptor comicStateAdaptor;
  @Mock private ApplicationEventPublisher applicationEventPublisher;
  @Mock private FilenameScrapingRuleService filenameScrapingRuleService;
  @Mock private ComicDetail comic;
  @Mock private ComicBook comicBook;
  @Mock private FilenameMetadata metadata;
  @Mock private ComicFile comicFile;

  @Captor private ArgumentCaptor<ComicDetail> comicArgumentCaptor;

  private List<String> filenameList = new ArrayList<>();
  private List<ComicFileGroup> comicFileGroupList = new ArrayList<>();
  private ComicFileGroup comicFileGroup = new ComicFileGroup(TEST_ROOT_DIRECTORY);

  @BeforeEach
  public void setUp() throws AdaptorException {
    filenameList.add(TEST_COMIC_ARCHIVE);

    doNothing()
        .when(comicStateAdaptor)
        .fireEvent(comicArgumentCaptor.capture(), any(ComicEvent.class));
    when(comic.getBaseFilename()).thenReturn(TEST_ARCHIVE_FILENAME);
    when(comicBook.getComicDetail()).thenReturn(comic);
    when(comicBookAdaptor.createComic(anyString())).thenReturn(comicBook);
    when(metadata.isFound()).thenReturn(false);
    when(filenameScrapingRuleService.loadFilenameMetadata(anyString())).thenReturn(metadata);

    comicFileGroupList.add(comicFileGroup);
  }

  @Test
  void getImportFileCover_noNoCover() throws AdaptorException {
    when(comicBookAdaptor.loadCover(anyString())).thenReturn(null);

    assertNull(service.getImportFileCover(TEST_COMIC_ARCHIVE));

    verify(comicBookAdaptor).loadCover(TEST_COMIC_ARCHIVE);
  }

  @Test
  void getImportFileCover() throws AdaptorException {
    when(comicBookAdaptor.loadCover(anyString())).thenReturn(TEST_COVER_CONTENT);

    final byte[] result = service.getImportFileCover(TEST_COMIC_ARCHIVE);

    assertNotNull(result);
    assertEquals(TEST_COVER_CONTENT, result);

    verify(comicBookAdaptor).loadCover(TEST_COMIC_ARCHIVE);
  }

  @Test
  void getAllComicsUnder_directoryNotFound() throws IOException {
    final List<ComicFileGroup> result =
        service.getAllComicsUnder(TEST_ROOT_DIRECTORY + "/nonexistent", TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void getAllComicsUnder_fileNotDirectory() throws IOException {
    final List<ComicFileGroup> result = service.getAllComicsUnder(TEST_COMIC_ARCHIVE, TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void getAllComicsUnder_nothingNewFound() throws IOException {
    when(comicFileAdaptor.isComicFile(any(File.class))).thenReturn(true);
    when(comicDetailService.filenameFound(anyString())).thenReturn(true);

    final List<ComicFileGroup> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(comicDetailService)
        .filenameFound(new File(TEST_COMIC_ARCHIVE).getCanonicalPath().replace("\\", "/"));
  }

  @Test
  void getAllComicsUnder_withLimit() throws IOException {
    when(comicFileAdaptor.isComicFile(any(File.class))).thenReturn(true);

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
  void getAllComicsUnder() throws IOException {
    when(comicFileAdaptor.isComicFile(any(File.class))).thenCallRealMethod();

    final List<ComicFileGroup> result =
        service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_NO_LIMIT);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(1, result.size());
    assertEquals(3, result.get(0).getFiles().size());
  }

  @Test
  void getAllComicsUnder_withExistingComicBook() throws IOException {
    when(comicDetailService.filenameFound(anyString())).thenReturn(true);
    when(comicFileAdaptor.isComicFile(any(File.class))).thenCallRealMethod();

    final List<ComicFileGroup> result =
        service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_NO_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(comicDetailService, atLeast(1)).filenameFound(anyString());
  }

  @Test
  void importComicFiles_alreadyFound() {
    when(comicDetailService.filenameFound(anyString())).thenReturn(true);

    service.importComicFiles(filenameList);

    verify(comicDetailService).filenameFound(TEST_COMIC_ARCHIVE);
    verify(comicStateAdaptor, never()).fireEvent(any(), any());
    verify(applicationEventPublisher).publishEvent(LoadComicBooksEvent.instance);
  }

  @Test
  void importComicFiles() throws AdaptorException {
    when(comicDetailService.filenameFound(anyString())).thenReturn(false);

    service.importComicFiles(filenameList);

    verify(comicDetailService).filenameFound(TEST_COMIC_ARCHIVE);
    verify(comicBookAdaptor, times(filenameList.size())).createComic(TEST_COMIC_ARCHIVE);
    verify(filenameScrapingRuleService, times(filenameList.size()))
        .loadFilenameMetadata(TEST_ARCHIVE_FILENAME);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicBookImported);
    verify(applicationEventPublisher).publishEvent(LoadComicBooksEvent.instance);
  }

  @Test
  void importComicFiles_comicBookAdaptorException() throws AdaptorException {
    when(comicDetailService.filenameFound(anyString())).thenReturn(false);
    when(comicBookAdaptor.createComic(anyString())).thenThrow(AdaptorException.class);

    service.importComicFiles(filenameList);

    verify(comicDetailService).filenameFound(TEST_COMIC_ARCHIVE);
    verify(comicBookAdaptor, times(filenameList.size())).createComic(TEST_COMIC_ARCHIVE);
    verify(filenameScrapingRuleService, never()).loadFilenameMetadata(anyString());
    verify(comicStateAdaptor, never()).fireEvent(any(), any());
    verify(applicationEventPublisher).publishEvent(LoadComicBooksEvent.instance);
  }

  @Test
  void importComicFiles_withFilenameMetadata() throws AdaptorException {
    when(metadata.isFound()).thenReturn(true);
    when(metadata.getSeries()).thenReturn(TEST_SERIES_NAME);
    when(metadata.getVolume()).thenReturn(TEST_VOLUME);
    when(metadata.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    when(metadata.getCoverDate()).thenReturn(TEST_COVER_DATE);
    when(comicDetailService.filenameFound(anyString())).thenReturn(false);

    service.importComicFiles(filenameList);

    verify(comicDetailService).filenameFound(TEST_COMIC_ARCHIVE);
    verify(comicBookAdaptor, times(filenameList.size())).createComic(TEST_COMIC_ARCHIVE);
    verify(filenameScrapingRuleService, times(filenameList.size()))
        .loadFilenameMetadata(TEST_ARCHIVE_FILENAME);
    verify(comic).setSeries(TEST_SERIES_NAME);
    verify(comic).setVolume(TEST_VOLUME);
    verify(comic).setIssueNumber(TEST_ISSUE_NUMBER);
    verify(comic).setCoverDate(TEST_COVER_DATE);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicBookImported);
    verify(applicationEventPublisher).publishEvent(LoadComicBooksEvent.instance);
  }

  @Test
  void discoverComicFile() throws AdaptorException {
    when(comicDetailService.filenameFound(anyString())).thenReturn(false);

    service.discoverComicFile(TEST_ARCHIVE_FILENAME);

    verify(comicBookAdaptor).createComic(TEST_ARCHIVE_FILENAME);
    verify(filenameScrapingRuleService).loadFilenameMetadata(TEST_ARCHIVE_FILENAME);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicFileDiscovered);
  }

  @Test
  void toggleComicFileSelections_allFiles() {
    comicFileGroup.getFiles().add(new ComicFile(TEST_COMIC_ARCHIVE, TEST_FILE_SIZE));
    comicFileGroup.getFiles().get(0).setSelected(!TEST_SELECTED);

    service.toggleComicFileSelections(comicFileGroupList, "", TEST_SELECTED, false);

    assertEquals(TEST_SELECTED, comicFileGroup.getFiles().get(0).isSelected());
  }

  @Test
  void toggleComicFileSelections_specificFile() {
    comicFileGroup.getFiles().add(comicFile);
    when(comicFile.getFilename()).thenReturn(TEST_COMIC_ARCHIVE);
    when(comicFile.isSelected()).thenReturn(!TEST_SELECTED);

    service.toggleComicFileSelections(comicFileGroupList, TEST_COMIC_ARCHIVE, TEST_SELECTED, true);

    verify(comicFile).setSelected(TEST_SELECTED);
  }

  @Test
  void toggleComicFileSelections_specificDirectory() {
    comicFileGroup.getFiles().add(new ComicFile(TEST_COMIC_ARCHIVE, TEST_FILE_SIZE));
    comicFileGroup.getFiles().get(0).setSelected(!TEST_SELECTED);

    service.toggleComicFileSelections(
        comicFileGroupList, comicFileGroup.getDirectory(), TEST_SELECTED, false);

    assertEquals(TEST_SELECTED, comicFileGroup.getFiles().get(0).isSelected());
  }

  @Test
  void toggleComicFileSelections_specifiedFileNotFound() {
    comicFileGroup.getFiles().add(new ComicFile(TEST_COMIC_ARCHIVE, TEST_FILE_SIZE));
    comicFileGroup.getFiles().get(0).setSelected(!TEST_SELECTED);

    service.toggleComicFileSelections(
        comicFileGroupList, TEST_COMIC_ARCHIVE.substring(1), TEST_SELECTED, true);

    assertEquals(!TEST_SELECTED, comicFileGroup.getFiles().get(0).isSelected());
  }
}
