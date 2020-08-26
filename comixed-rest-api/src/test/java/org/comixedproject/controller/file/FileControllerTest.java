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
import org.comixedproject.model.file.FileDetails;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.model.net.GetAllComicsUnderRequest;
import org.comixedproject.model.net.ImportComicFilesRequest;
import org.comixedproject.service.file.FileService;
import org.comixedproject.task.model.QueueComicsWorkerTask;
import org.comixedproject.task.model.WorkerTask;
import org.comixedproject.task.runner.TaskManager;
import org.json.JSONException;
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
  private static final int TEST_IMPORT_STATUS = 129;
  private static final Integer TEST_LIMIT = RANDOM.nextInt();
  private static final Integer TEST_NO_LIMIT = -1;
  private static final boolean TEST_DELETE_BLOCKED_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_IGNORE_METADATA = RANDOM.nextBoolean();

  static {
    TEST_FILENAMES.add("First.cbz");
    TEST_FILENAMES.add("Second.cbz");
    TEST_FILENAMES.add("Third.cbr");
    TEST_FILENAMES.add("Fourth.cb7");
  }

  @InjectMocks private FileController controller;
  @Mock private FileService fileService;
  @Mock private List<FileDetails> fileDetailsList;
  @Mock private ObjectFactory<QueueComicsWorkerTask> queueComicsWorkerTaskObjectFactory;
  @Mock private QueueComicsWorkerTask queueComicsWorkerTask;
  @Mock private TaskManager taskManager;

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
        .thenReturn(fileDetailsList);

    final ApiResponse<List<FileDetails>> response =
        controller.getAllComicsUnder(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_NO_LIMIT));

    assertNotNull(response);
    assertSame(fileDetailsList, response.getResult());

    Mockito.verify(fileService, Mockito.times(1)).getAllComicsUnder(TEST_DIRECTORY, TEST_NO_LIMIT);
  }

  @Test
  public void testGetAllComicsUnder() throws IOException, JSONException {
    Mockito.when(fileService.getAllComicsUnder(Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(fileDetailsList);

    final ApiResponse<List<FileDetails>> response =
        controller.getAllComicsUnder(new GetAllComicsUnderRequest(TEST_DIRECTORY, TEST_LIMIT));

    assertNotNull(response);
    assertSame(fileDetailsList, response.getResult());

    Mockito.verify(fileService, Mockito.times(1)).getAllComicsUnder(TEST_DIRECTORY, TEST_LIMIT);
  }

  @Test
  public void testImportComicFiles() throws UnsupportedEncodingException {
    Mockito.when(queueComicsWorkerTaskObjectFactory.getObject()).thenReturn(queueComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    final ApiResponse<Void> response =
        controller.importComicFiles(
            new ImportComicFilesRequest(
                TEST_FILENAMES, TEST_IGNORE_METADATA, TEST_DELETE_BLOCKED_PAGES));

    assertNotNull(response);
    assertTrue(response.isSuccess());

    Mockito.verify(taskManager, Mockito.times(1)).runTask(queueComicsWorkerTask);
    Mockito.verify(queueComicsWorkerTask, Mockito.times(1)).setFilenames(TEST_FILENAMES);
    Mockito.verify(queueComicsWorkerTask, Mockito.times(1))
        .setDeleteBlockedPages(TEST_DELETE_BLOCKED_PAGES);
    Mockito.verify(queueComicsWorkerTask, Mockito.times(1)).setIgnoreMetadata(TEST_IGNORE_METADATA);
  }
}
