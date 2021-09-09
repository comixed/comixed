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
import static org.comixedproject.controller.library.LibraryController.MAXIMUM_RECORDS;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.net.ClearImageCacheResponse;
import org.comixedproject.model.net.ConsolidateLibraryRequest;
import org.comixedproject.model.net.ConvertComicsRequest;
import org.comixedproject.model.net.library.*;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.library.LibraryService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.task.ConvertComicsTask;
import org.comixedproject.task.MoveComicsTask;
import org.comixedproject.task.Task;
import org.comixedproject.task.runner.TaskManager;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class LibraryControllerTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_PHYSICAL_FILES = RANDOM.nextBoolean();
  private static final String TEST_RENAMING_RULE = "PUBLISHER/SERIES/VOLUME/SERIES vVOLUME #ISSUE";
  private static final String TEST_DESTINATION_DIRECTORY = "/home/comixedreader/Documents/comics";
  private static final Boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();
  private static final Boolean TEST_DELETE_ORIGINAL_COMIC = RANDOM.nextBoolean();
  private static final long TEST_LAST_COMIC_ID = 717L;

  @InjectMocks private LibraryController controller;
  @Mock private LibraryService libraryService;
  @Mock private ComicService comicService;
  @Mock private List<Comic> comicList;
  @Mock private List<Long> idList;
  @Mock private TaskManager taskManager;
  @Mock private ObjectFactory<ConvertComicsTask> convertComicsWorkerTaskObjectFactory;
  @Mock private ConvertComicsTask convertComicsWorkerTask;
  @Mock private ObjectFactory<MoveComicsTask> moveComicsWorkerTaskObjectFactory;
  @Mock private MoveComicsTask moveComicsWorkerTask;
  @Mock private Comic comic;
  @Mock private Comic lastComic;
  @Mock private JobLauncher jobLauncher;
  @Mock private JobExecution jobExecution;
  @Mock private Job updateMetadataJob;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Before
  public void testSetUp() {
    Mockito.when(lastComic.getId()).thenReturn(TEST_LAST_COMIC_ID);
  }

  @Test
  public void testConvertComics() {
    Mockito.when(convertComicsWorkerTaskObjectFactory.getObject())
        .thenReturn(convertComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(Task.class));

    controller.convertComics(
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
        controller.consolidateLibrary(new ConsolidateLibraryRequest(TEST_DELETE_PHYSICAL_FILES));

    assertNotNull(response);
    assertSame(comicList, response);

    Mockito.verify(libraryService, Mockito.times(1)).consolidateLibrary(TEST_DELETE_PHYSICAL_FILES);
  }

  @Test
  public void testClearImageCache() throws LibraryException {
    Mockito.doNothing().when(libraryService).clearImageCache();

    ClearImageCacheResponse result = controller.clearImageCache();

    assertNotNull(result);
    assertTrue(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
    ;
  }

  @Test
  public void testClearImageCacheWithError() throws LibraryException {
    Mockito.doThrow(LibraryException.class).when(libraryService).clearImageCache();

    ClearImageCacheResponse result = controller.clearImageCache();

    assertNotNull(result);
    assertFalse(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
  }

  @Test
  public void testMoveLibrary() {
    Mockito.when(moveComicsWorkerTaskObjectFactory.getObject()).thenReturn(moveComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(Task.class));

    controller.moveComics(
        new MoveComicsRequest(
            TEST_DELETE_PHYSICAL_FILES, TEST_DESTINATION_DIRECTORY, TEST_RENAMING_RULE));

    Mockito.verify(moveComicsWorkerTask, Mockito.times(1)).setDirectory(TEST_DESTINATION_DIRECTORY);
    Mockito.verify(moveComicsWorkerTask, Mockito.times(1)).setRenamingRule(TEST_RENAMING_RULE);
    Mockito.verify(taskManager, Mockito.times(1)).runTask(moveComicsWorkerTask);
  }

  @Test
  public void testLoadLibraryMoreComicsRemaining() throws ComiXedUserException {
    final List<Comic> comics = new ArrayList<>();
    for (int index = 0; index < MAXIMUM_RECORDS - 1; index++) comics.add(comic);
    comics.add(lastComic);
    comics.add(comic);

    Mockito.when(comicService.getComicsById(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comics);

    final LoadLibraryResponse result =
        controller.loadLibrary(new LoadLibraryRequest(TEST_LAST_COMIC_ID));

    assertNotNull(result);
    assertFalse(result.getComics().isEmpty());
    assertEquals(MAXIMUM_RECORDS, result.getComics().size());
    assertFalse(result.isLastPayload());

    Mockito.verify(comicService, Mockito.times(1))
        .getComicsById(TEST_LAST_COMIC_ID, MAXIMUM_RECORDS + 1);
  }

  @Test
  public void testLoadLibraryExactNumber() throws ComiXedUserException {
    final List<Comic> comics = new ArrayList<>();
    for (int index = 0; index < MAXIMUM_RECORDS - 1; index++) comics.add(comic);
    comics.add(lastComic);

    Mockito.when(comicService.getComicsById(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comics);

    final LoadLibraryResponse result =
        controller.loadLibrary(new LoadLibraryRequest(TEST_LAST_COMIC_ID));

    assertNotNull(result);
    assertFalse(result.getComics().isEmpty());
    assertEquals(MAXIMUM_RECORDS, result.getComics().size());
    assertTrue(result.isLastPayload());

    Mockito.verify(comicService, Mockito.times(1))
        .getComicsById(TEST_LAST_COMIC_ID, MAXIMUM_RECORDS + 1);
  }

  @Test
  public void testLoadLibrary() throws ComiXedUserException {
    final List<Comic> comics = new ArrayList<>();
    for (int index = 0; index < MAXIMUM_RECORDS - 2; index++) comics.add(comic);
    comics.add(lastComic);

    Mockito.when(comicService.getComicsById(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comics);

    final LoadLibraryResponse result =
        controller.loadLibrary(new LoadLibraryRequest(TEST_LAST_COMIC_ID));

    assertNotNull(result);
    assertFalse(result.getComics().isEmpty());
    assertEquals(MAXIMUM_RECORDS - 1, result.getComics().size());
    assertTrue(result.isLastPayload());

    Mockito.verify(comicService, Mockito.times(1))
        .getComicsById(TEST_LAST_COMIC_ID, MAXIMUM_RECORDS + 1);
  }

  @Test
  public void testRescanComics() {
    controller.rescanComics(new RescanComicsRequest(idList));

    Mockito.verify(comicService, Mockito.times(1)).rescanComics(idList);
  }

  @Test
  public void testUpdateMetadata()
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.updateMetadata(new UpdateMetadataRequest(idList));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);

    Mockito.verify(libraryService, Mockito.times(1)).updateMetadata(idList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(updateMetadataJob, jobParameters);
  }
}
