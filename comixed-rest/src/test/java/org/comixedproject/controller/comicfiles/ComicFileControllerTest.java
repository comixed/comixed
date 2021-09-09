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

package org.comixedproject.controller.comicfiles;

import static org.junit.Assert.*;

import java.io.IOException;
import java.util.List;
import java.util.Random;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.comicfiles.ComicFile;
import org.comixedproject.model.net.GetAllComicsUnderRequest;
import org.comixedproject.model.net.ImportComicFilesRequest;
import org.comixedproject.model.net.comicfiles.LoadComicFilesResponse;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.json.JSONException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.launch.JobLauncher;
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
  private static final boolean TEST_DELETE_BLOCKED_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_IGNORE_METADATA = RANDOM.nextBoolean();

  @InjectMocks private ComicFileController controller;
  @Mock private ComicFileService comicFileService;
  @Mock private Job addComicsToLibraryJob;
  @Mock private JobLauncher jobLauncher;
  @Mock private List<ComicFile> comicFileList;
  @Mock private List<String> filenameList;
  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Test
  public void testGetImportFileCoverServiceThrowsException()
      throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenThrow(ComicFileHandlerException.class);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);

    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  public void testGetImportFileCover() throws ArchiveAdaptorException, ComicFileHandlerException {
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenReturn(IMAGE_CONTENT);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);
    assertEquals(IMAGE_CONTENT, result);

    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  public void testGetAllComicsUnderNoLimit() throws IOException, JSONException {
    Mockito.when(comicFileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileList);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_NO_LIMIT));

    assertNotNull(response);
    assertSame(comicFileList, response.getFiles());

    Mockito.verify(comicFileService, Mockito.times(1))
        .getAllComicsUnder(TEST_DIRECTORY, TEST_NO_LIMIT);
  }

  @Test
  public void testGetAllComicsUnder() throws IOException, JSONException {
    Mockito.when(comicFileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileList);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_LIMIT));

    assertNotNull(response);
    assertSame(comicFileList, response.getFiles());

    Mockito.verify(comicFileService, Mockito.times(1))
        .getAllComicsUnder(TEST_DIRECTORY, TEST_LIMIT);
  }

  @Test
  public void testImportComicFiles() throws Exception {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.importComicFiles(
        new ImportComicFilesRequest(filenameList, TEST_IGNORE_METADATA, TEST_DELETE_BLOCKED_PAGES));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);

    Mockito.verify(comicFileService, Mockito.times(1)).importComicFiles(filenameList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(addComicsToLibraryJob, jobParameters);
  }
}
