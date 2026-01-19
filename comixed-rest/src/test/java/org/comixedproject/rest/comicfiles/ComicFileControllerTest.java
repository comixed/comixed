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

import static org.comixedproject.rest.comicfiles.ComicFileController.COMIC_FILES;
import static org.junit.Assert.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.model.comicfiles.ComicFile;
import org.comixedproject.model.comicfiles.ComicFileGroup;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.model.net.comicfiles.*;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;

@ExtendWith(MockitoExtension.class)
class ComicFileControllerTest {
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
  private static final String TEST_ENCODED_COMIC_FILES = "The encoded comic file list";
  private static final boolean TEST_SELECTED = RandomUtils.nextBoolean();
  private static final boolean TEST_SINGLE = RandomUtils.nextBoolean();

  @InjectMocks private ComicFileController controller;
  @Mock private ComicFileService comicFileService;
  @Mock private FilenameScrapingRuleService filenameScrapingRuleService;
  @Mock private ObjectMapper objectMapper;
  @Mock private FilenameMetadata filenameMetadata;
  @Mock private HttpSession session;

  @Captor private ArgumentCaptor<TypeReference> typeReferenceArgumentCaptor;
  @Captor private ArgumentCaptor<List<String>> filenameListArgumentCaptor;

  private List<ComicFileGroup> comicFileGroupList = new ArrayList<>();
  private ComicFileGroup comicFileGroup = new ComicFileGroup();

  @BeforeEach
  void setUp() {
    for (int index = 0; index < 25; index++) {
      comicFileGroup
          .getFiles()
          .add(new ComicFile(String.format("comicfile-%d.cbz", index), 1024 * index));
    }
  }

  @Test
  void loadComicFilesFromSession() throws JsonProcessingException {
    Mockito.when(session.getAttribute(COMIC_FILES)).thenReturn(TEST_ENCODED_COMIC_FILES);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), typeReferenceArgumentCaptor.capture()))
        .thenReturn(comicFileGroupList);

    final LoadComicFilesResponse result = controller.loadComicFilesFromSession(session);

    assertNotNull(result);
    assertSame(comicFileGroupList, result.getGroups());

    final TypeReference<ComicFile> typeReference = typeReferenceArgumentCaptor.getValue();
    assertNotNull(typeReference);

    Mockito.verify(session, Mockito.times(2)).getAttribute(COMIC_FILES);
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_COMIC_FILES, typeReference);
  }

  @Test
  void loadComicFilesFromSession_nothingStored() throws JsonProcessingException {
    Mockito.when(session.getAttribute(COMIC_FILES)).thenReturn(null);

    final LoadComicFilesResponse result = controller.loadComicFilesFromSession(session);

    assertNotNull(result);
    assertTrue(result.getGroups().isEmpty());

    Mockito.verify(session, Mockito.times(1)).getAttribute(COMIC_FILES);
    Mockito.verify(objectMapper, Mockito.never())
        .readValue(Mockito.anyString(), Mockito.any(Class.class));
  }

  @Test
  void loadComicFilesFromSession_parsingError() throws JsonProcessingException {
    Mockito.when(session.getAttribute(COMIC_FILES)).thenReturn(TEST_ENCODED_COMIC_FILES);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), typeReferenceArgumentCaptor.capture()))
        .thenThrow(JsonProcessingException.class);

    final LoadComicFilesResponse result = controller.loadComicFilesFromSession(session);

    assertNotNull(result);
    assertTrue(result.getGroups().isEmpty());

    final TypeReference<ComicFile> typeReference = typeReferenceArgumentCaptor.getValue();
    assertNotNull(typeReference);

    Mockito.verify(session, Mockito.times(2)).getAttribute(COMIC_FILES);
    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_COMIC_FILES, typeReference);
  }

  @Test
  void getImportFileCoverServiceThrowsException() throws AdaptorException {
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);

    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  void getImportFileCover() throws AdaptorException {
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenReturn(IMAGE_CONTENT);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);
    assertEquals(IMAGE_CONTENT, result);

    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  void toggleComicFileSelections() throws JsonProcessingException {
    Mockito.when(session.getAttribute(COMIC_FILES)).thenReturn(TEST_ENCODED_COMIC_FILES);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), typeReferenceArgumentCaptor.capture()))
        .thenReturn(comicFileGroupList);

    Mockito.doNothing()
        .when(comicFileService)
        .toggleComicFileSelections(
            Mockito.anyList(), Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyBoolean());

    final LoadComicFilesResponse result =
        controller.toggleComicFileSelections(
            session, new ToggleComicFileSelectionsRequest("", TEST_SELECTED, TEST_SINGLE));

    assertNotNull(result);
    assertSame(comicFileGroupList, result.getGroups());

    final TypeReference typeReference = typeReferenceArgumentCaptor.getValue();
    assertNotNull(typeReference);

    Mockito.verify(comicFileService, Mockito.times(1))
        .toggleComicFileSelections(comicFileGroupList, "", TEST_SELECTED, TEST_SINGLE);
  }

  @Test
  void loadComicFiles_noLimit() throws IOException {
    Mockito.when(comicFileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileGroupList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_ENCODED_COMIC_FILES);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(
            session, new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_NO_LIMIT));

    assertNotNull(response);
    assertSame(comicFileGroupList, response.getGroups());

    Mockito.verify(comicFileService, Mockito.times(1))
        .getAllComicsUnder(TEST_DIRECTORY, TEST_NO_LIMIT);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(comicFileGroupList);
    Mockito.verify(session, Mockito.times(1)).setAttribute(COMIC_FILES, TEST_ENCODED_COMIC_FILES);
  }

  @Test
  void loadComicFiles_withLimit() throws IOException {
    Mockito.when(comicFileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileGroupList);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_ENCODED_COMIC_FILES);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(
            session, new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_LIMIT));

    assertNotNull(response);
    assertSame(comicFileGroupList, response.getGroups());

    Mockito.verify(comicFileService, Mockito.times(1))
        .getAllComicsUnder(TEST_DIRECTORY, TEST_LIMIT);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(comicFileGroupList);
    Mockito.verify(session, Mockito.times(1)).setAttribute(COMIC_FILES, TEST_ENCODED_COMIC_FILES);
  }

  @Test
  void importComicFiles()
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException,
          JsonProcessingException {
    comicFileGroupList.add(comicFileGroup);

    Mockito.when(session.getAttribute(COMIC_FILES)).thenReturn(TEST_ENCODED_COMIC_FILES);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), typeReferenceArgumentCaptor.capture()))
        .thenReturn(comicFileGroupList);
    Mockito.doNothing()
        .when(comicFileService)
        .importComicFiles(filenameListArgumentCaptor.capture());

    controller.importComicFiles(session, new ImportComicFilesRequest());

    final List<String> filenameList = filenameListArgumentCaptor.getValue();

    Mockito.verify(comicFileService, Mockito.times(1)).importComicFiles(filenameList);
    Mockito.verify(session, Mockito.times(1)).removeAttribute(COMIC_FILES);
  }

  @Test
  void scrapeFilename() {
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
  void scrapeFilenameNoRuleApplied() {
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
