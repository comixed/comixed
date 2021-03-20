/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.controller.library;

import static junit.framework.TestCase.*;

import java.security.Principal;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.net.*;
import org.comixedproject.model.net.library.MoveComicsRequest;
import org.comixedproject.model.net.library.SetReadStateRequest;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.library.LibraryService;
import org.comixedproject.task.model.ConvertComicsWorkerTask;
import org.comixedproject.task.model.MoveComicsWorkerTask;
import org.comixedproject.task.model.WorkerTask;
import org.comixedproject.task.runner.TaskManager;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class LibraryControllerTest {
  private static final String TEST_USER_EMAIL = "reader@localhost";
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_PHYSICAL_FILES = RANDOM.nextBoolean();
  private static final String TEST_RENAMING_RULE = "PUBLISHER/SERIES/VOLUME/SERIES vVOLUME #ISSUE";
  private static final String TEST_DESTINATION_DIRECTORY = "/home/comixedreader/Documents/comics";
  private static final Boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_ORIGINAL_COMIC = RANDOM.nextBoolean();
  private static final Boolean TEST_READ = RANDOM.nextBoolean();

  @InjectMocks private LibraryController libraryController;
  @Mock private LibraryService libraryService;
  @Mock private List<Comic> comicList;
  @Mock private Principal principal;
  @Mock private List<Long> idList;
  @Mock private TaskManager taskManager;
  @Mock private ObjectFactory<ConvertComicsWorkerTask> convertComicsWorkerTaskObjectFactory;
  @Mock private ConvertComicsWorkerTask convertComicsWorkerTask;
  @Mock private ObjectFactory<MoveComicsWorkerTask> moveComicsWorkerTaskObjectFactory;
  @Mock private MoveComicsWorkerTask moveComicsWorkerTask;
  @Mock private List<Long> comicIdList;

  @Test
  public void testConvertComics() {
    Mockito.when(convertComicsWorkerTaskObjectFactory.getObject())
        .thenReturn(convertComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    libraryController.convertComics(
        new ConvertComicsRequest(
            idList,
            TEST_ARCHIVE_TYPE,
            TEST_RENAME_PAGES,
            TEST_DELETE_PAGES,
            TEST_DELETE_ORIGINAL_COMIC));

    Mockito.verify(taskManager, Mockito.times(1)).runTask(convertComicsWorkerTask);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1)).setIdList(idList);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1))
        .setTargetArchiveType(TEST_ARCHIVE_TYPE);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1)).setRenamePages(TEST_RENAME_PAGES);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1)).setDeletePages(TEST_DELETE_PAGES);
    Mockito.verify(convertComicsWorkerTask, Mockito.times(1))
        .setDeleteOriginal(TEST_DELETE_ORIGINAL_COMIC);
  }

  @Test
  public void testConsolidate() {
    Mockito.when(libraryService.consolidateLibrary(Mockito.anyBoolean())).thenReturn(comicList);

    List<Comic> response =
        libraryController.consolidateLibrary(
            new ConsolidateLibraryRequest(TEST_DELETE_PHYSICAL_FILES));

    assertNotNull(response);
    assertSame(comicList, response);

    Mockito.verify(libraryService, Mockito.times(1)).consolidateLibrary(TEST_DELETE_PHYSICAL_FILES);
  }

  @Test
  public void testClearImageCache() throws LibraryException {
    Mockito.doNothing().when(libraryService).clearImageCache();

    ClearImageCacheResponse result = libraryController.clearImageCache();

    assertNotNull(result);
    assertTrue(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
    ;
  }

  @Test
  public void testClearImageCacheWithError() throws LibraryException {
    Mockito.doThrow(LibraryException.class).when(libraryService).clearImageCache();

    ClearImageCacheResponse result = libraryController.clearImageCache();

    assertNotNull(result);
    assertFalse(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
  }

  @Test
  public void testMoveLibrary() {
    Mockito.when(moveComicsWorkerTaskObjectFactory.getObject()).thenReturn(moveComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    libraryController.moveComics(
        new MoveComicsRequest(
            TEST_DELETE_PHYSICAL_FILES, TEST_DESTINATION_DIRECTORY, TEST_RENAMING_RULE));

    Mockito.verify(moveComicsWorkerTask, Mockito.times(1)).setDirectory(TEST_DESTINATION_DIRECTORY);
    Mockito.verify(moveComicsWorkerTask, Mockito.times(1)).setRenamingRule(TEST_RENAMING_RULE);
    Mockito.verify(taskManager, Mockito.times(1)).runTask(moveComicsWorkerTask);
  }

  @Test
  public void testSetReadState() throws LibraryException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.doNothing()
        .when(libraryService)
        .setReadState(Mockito.anyString(), Mockito.anyList(), Mockito.anyBoolean());

    libraryController.setReadState(principal, new SetReadStateRequest(comicIdList, TEST_READ));

    Mockito.verify(libraryService, Mockito.times(1))
        .setReadState(TEST_USER_EMAIL, comicIdList, TEST_READ);
  }
}
