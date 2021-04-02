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

package org.comixedproject.controller.file;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.file.ComicFile;
import org.comixedproject.model.net.GetAllComicsUnderRequest;
import org.comixedproject.model.net.ImportComicFilesRequest;
import org.comixedproject.model.net.comicfiles.LoadComicFilesResponse;
import org.comixedproject.service.file.FileService;
import org.comixedproject.task.model.QueueComicsWorkerTask;
import org.comixedproject.task.model.WorkerTask;
import org.comixedproject.task.runner.TaskManager;
import org.json.JSONException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class FileControllerTest {
  private static final Random RANDOM = new Random();
  private static final String COMIC_ARCHIVE = "testcomic.cbz";
  private static final byte[] IMAGE_CONTENT = new byte[65535];
  private static final String TEST_DIRECTORY = "src/test";
  private static final List<String> TEST_FILENAMES = new ArrayList<>();
  private static final Integer TEST_LIMIT = RANDOM.nextInt();
  private static final Integer TEST_NO_LIMIT = -1;
  private static final boolean TEST_DELETE_BLOCKED_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_IGNORE_METADATA = RANDOM.nextBoolean();
  private static final byte[] TEST_MISSING_FILE_CONTENT = "Missing image file content".getBytes();

  static {
    TEST_FILENAMES.add("First.cbz");
    TEST_FILENAMES.add("Second.cbz");
    TEST_FILENAMES.add("Third.cbr");
    TEST_FILENAMES.add("Fourth.cb7");
  }

  @InjectMocks private FileController controller;
  @Mock private FileService fileService;
  @Mock private List<ComicFile> comicFileList;
  @Mock private ObjectFactory<QueueComicsWorkerTask> queueComicsWorkerTaskObjectFactory;
  @Mock private QueueComicsWorkerTask queueComicsWorkerTask;
  @Mock private TaskManager taskManager;

  @Before
  public void setUp() {
    controller.missingFileImageContent = TEST_MISSING_FILE_CONTENT;
  }

  @Test
  public void testGetImportFileCoverCoverLoadFailed()
      throws ArchiveAdaptorException, ComicFileHandlerException {
    Mockito.when(fileService.getImportFileCover(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);

    Mockito.verify(fileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  public void testGetImportFileCoverNoData()
      throws ArchiveAdaptorException, ComicFileHandlerException, IOException {
    Mockito.when(fileService.getImportFileCover(Mockito.anyString())).thenReturn(null);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);

    Mockito.verify(fileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  public void testGetImportFileCover() throws ArchiveAdaptorException, ComicFileHandlerException {
    Mockito.when(fileService.getImportFileCover(Mockito.anyString())).thenReturn(IMAGE_CONTENT);

    final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

    assertNotNull(result);
    assertEquals(IMAGE_CONTENT, result);

    Mockito.verify(fileService, Mockito.times(1)).getImportFileCover(COMIC_ARCHIVE);
  }

  @Test
  public void testGetAllComicsUnderNoLimit() throws IOException, JSONException {
    Mockito.when(fileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileList);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_NO_LIMIT));

    assertNotNull(response);
    assertSame(comicFileList, response.getFiles());

    Mockito.verify(fileService, Mockito.times(1)).getAllComicsUnder(TEST_DIRECTORY, TEST_NO_LIMIT);
  }

  @Test
  public void testGetAllComicsUnder() throws IOException, JSONException {
    Mockito.when(fileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicFileList);

    final LoadComicFilesResponse response =
        controller.loadComicFiles(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_LIMIT));

    assertNotNull(response);
    assertSame(comicFileList, response.getFiles());

    Mockito.verify(fileService, Mockito.times(1)).getAllComicsUnder(TEST_DIRECTORY, TEST_LIMIT);
  }

  @Test
  public void testImportComicFiles() throws UnsupportedEncodingException {
    Mockito.when(queueComicsWorkerTaskObjectFactory.getObject()).thenReturn(queueComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    controller.importComicFiles(
        new ImportComicFilesRequest(
            TEST_FILENAMES, TEST_IGNORE_METADATA, TEST_DELETE_BLOCKED_PAGES));

    Mockito.verify(taskManager, Mockito.times(1)).runTask(queueComicsWorkerTask);
    Mockito.verify(queueComicsWorkerTask, Mockito.times(1)).setFilenames(TEST_FILENAMES);
    Mockito.verify(queueComicsWorkerTask, Mockito.times(1))
        .setDeleteBlockedPages(TEST_DELETE_BLOCKED_PAGES);
    Mockito.verify(queueComicsWorkerTask, Mockito.times(1)).setIgnoreMetadata(TEST_IGNORE_METADATA);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    controller.afterPropertiesSet();

    assertNotNull(controller.missingFileImageContent);
  }
}
