/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixedproject.rest.comicfiles;

import static org.junit.Assert.*;

import java.io.IOException;
import java.util.List;
import java.util.Random;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.model.comicfiles.ComicFileGroup;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.model.net.comicfiles.FilenameMetadataRequest;
import org.comixedproject.model.net.comicfiles.FilenameMetadataResponse;
import org.comixedproject.model.net.comicfiles.GetAllComicsUnderRequest;
import org.comixedproject.model.net.comicfiles.ImportComicFilesRequest;
import org.comixedproject.model.net.comicfiles.LoadComicFilesResponse;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicFileControllerTest {
  private static final Random RANDOM = new Random();
  private static final String COMIC_ARCHIVE = "testcomic.cbz";
  private static final byte[] IMAGE_CONTENT = new byte[65535];
  private static final String TEST_DIRECTORY = "src/test";
  private static final Integer TEST_LIMIT = RANDOM.nextInt();
  private static final Integer TEST_NO_LIMIT = -1;
  private static final String TEST_COMIC_FILENAME = "The filename";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "The Volume";
  private static final String TEST_ISSUE_NUMBER = "983a";
  private static final Boolean TEST_SKIP_METADATA = RandomUtils.nextBoolean();
  private static final Boolean TEST_SKIP_BLOCKING_PAGES = RandomUtils.nextBoolean();

  @InjectMocks private ComicFileController controller;
  @Mock private ComicFileService comicFileService;
  @Mock private FilenameScrapingRuleService filenameScrapingRuleService;
  @Mock private List<ComicFileGroup> comicFileGroupList;
  @Mock private List<String> filenameList;
  @Mock private FilenameMetadata filenameMetadata;

  @Test
  public void testGetImportFileCoverServiceThrowsException() throws AdaptorException {
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);

    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  public void testGetImportFileCover() throws AdaptorException {
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenReturn(IMAGE_CONTENT);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);
    assertEquals(IMAGE_CONTENT, result);

    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  public void testGetAllComicsUnderNoLimit() throws IOException {
    Mockito.when(comicFileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileGroupList);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_NO_LIMIT));

    assertNotNull(response);
    assertSame(comicFileGroupList, response.getGroups());

    Mockito.verify(comicFileService, Mockito.times(1))
        .getAllComicsUnder(TEST_DIRECTORY, TEST_NO_LIMIT);
  }

  @Test
  public void testGetAllComicsUnder() throws IOException {
    Mockito.when(comicFileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileGroupList);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_LIMIT));

    assertNotNull(response);
    assertSame(comicFileGroupList, response.getGroups());

    Mockito.verify(comicFileService, Mockito.times(1))
        .getAllComicsUnder(TEST_DIRECTORY, TEST_LIMIT);
  }

  @Test
  public void testImportComicFiles()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException {
    controller.importComicFiles(
        new ImportComicFilesRequest(filenameList, TEST_SKIP_METADATA, TEST_SKIP_BLOCKING_PAGES));

    Mockito.verify(comicFileService, Mockito.times(1)).importComicFiles(filenameList);
  }

  @Test
  public void testScrapeFilename() {
    Mockito.when(filenameScrapingRuleService.loadFilenameMetadata(Mockito.anyString()))
        .thenReturn(filenameMetadata);
    Mockito.when(filenameMetadata.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(filenameMetadata.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(filenameMetadata.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);

    final FilenameMetadataResponse result =
        controller.scrapeFilename(new FilenameMetadataRequest(TEST_COMIC_FILENAME));

    assertNotNull(result);
    assertEquals(TEST_SERIES, result.getSeries());
    assertEquals(TEST_VOLUME, result.getVolume());
    assertEquals(TEST_ISSUE_NUMBER, result.getIssueNumber());

    Mockito.verify(filenameScrapingRuleService, Mockito.times(1))
        .loadFilenameMetadata(TEST_COMIC_FILENAME);
  }

  @Test
  public void testScrapeFilenameNoRuleApplied() {
    Mockito.when(filenameScrapingRuleService.loadFilenameMetadata(Mockito.anyString()))
        .thenReturn(new FilenameMetadata());

    final FilenameMetadataResponse result =
        controller.scrapeFilename(new FilenameMetadataRequest(TEST_COMIC_FILENAME));

    assertNotNull(result);
    assertNull(result.getSeries());
    assertNull(result.getVolume());
    assertNull(result.getIssueNumber());

    Mockito.verify(filenameScrapingRuleService, Mockito.times(1))
        .loadFilenameMetadata(TEST_COMIC_FILENAME);
  }
}
