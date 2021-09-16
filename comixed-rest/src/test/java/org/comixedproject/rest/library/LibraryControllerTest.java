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

package org.comixedproject.rest.library;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.*;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.*;
import static org.comixedproject.rest.library.LibraryController.MAXIMUM_RECORDS;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_RENAMING_RULE;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.net.ClearImageCacheResponse;
import org.comixedproject.model.net.ConsolidateLibraryRequest;
import org.comixedproject.model.net.ConvertComicsRequest;
import org.comixedproject.model.net.library.LoadLibraryRequest;
import org.comixedproject.model.net.library.LoadLibraryResponse;
import org.comixedproject.model.net.library.RescanComicsRequest;
import org.comixedproject.model.net.library.UpdateMetadataRequest;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.library.LibraryService;
import org.comixedproject.service.user.ComiXedUserException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;

@RunWith(MockitoJUnitRunner.class)
public class LibraryControllerTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_REMOVED_COMIC_FILES = RANDOM.nextBoolean();
  private static final String TEST_RENAMING_RULE = "PUBLISHER/SERIES/VOLUME/SERIES vVOLUME #ISSUE";
  private static final String TEST_DESTINATION_DIRECTORY = "/home/comixedreader/Documents/comics";
  private static final Boolean TEST_DELETE_MARKED_PAGES = RANDOM.nextBoolean();
  private static final long TEST_LAST_COMIC_ID = 717L;

  @InjectMocks private LibraryController controller;
  @Mock private LibraryService libraryService;
  @Mock private ComicService comicService;
  @Mock private ConfigurationService configurationService;
  @Mock private List<Long> idList;
  @Mock private Comic comic;
  @Mock private Comic lastComic;
  @Mock private JobLauncher jobLauncher;
  @Mock private JobExecution jobExecution;

  @Mock
  @Qualifier("updateMetadataJob")
  private Job updateMetadataJob;

  @Mock
  @Qualifier("processComicsJob")
  private Job processComicsJob;

  @Mock
  @Qualifier("consolidateLibraryJob")
  private Job consolidateLibraryJob;

  @Mock
  @Qualifier("recreateComicFilesJob")
  private Job recreateComicFilesJob;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Before
  public void testSetUp() {
    Mockito.when(lastComic.getId()).thenReturn(TEST_LAST_COMIC_ID);
  }

  @Test
  public void testConvertComics() throws Exception {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.convertComics(
        new ConvertComicsRequest(
            idList, TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertEquals(TEST_ARCHIVE_TYPE.getName(), jobParameters.getString(JOB_TARGET_ARCHIVE));
    assertEquals(
        String.valueOf(TEST_DELETE_MARKED_PAGES), jobParameters.getString(JOB_DELETE_MARKED_PAGES));
    assertEquals(String.valueOf(TEST_RENAME_PAGES), jobParameters.getString(JOB_RENAME_PAGES));

    Mockito.verify(libraryService, Mockito.times(1)).prepareToRecreateComics(idList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(recreateComicFilesJob, jobParameters);
  }

  @Test(expected = LibraryException.class)
  public void testConsolidateServiceThrowsException() throws Exception {
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY))
        .thenReturn(TEST_DESTINATION_DIRECTORY);
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_RENAMING_RULE))
        .thenReturn(TEST_RENAMING_RULE);
    Mockito.doThrow(LibraryException.class)
        .when(libraryService)
        .prepareForConsolidation(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean());

    try {
      controller.consolidateLibrary(new ConsolidateLibraryRequest(TEST_DELETE_REMOVED_COMIC_FILES));
    } finally {
      Mockito.verify(configurationService, Mockito.times(1))
          .getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY);
    }
  }

  @Test
  public void testConsolidate() throws Exception {
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY))
        .thenReturn(TEST_DESTINATION_DIRECTORY);
    Mockito.when(configurationService.getOptionValue(CFG_LIBRARY_RENAMING_RULE))
        .thenReturn(TEST_RENAMING_RULE);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.consolidateLibrary(new ConsolidateLibraryRequest(TEST_DELETE_REMOVED_COMIC_FILES));

    final JobParameters parameters = jobParametersArgumentCaptor.getValue();
    assertNotNull(parameters);
    assertTrue(parameters.getParameters().containsKey(PARAM_CONSOLIDATION_JOB_STARTED));
    assertEquals(
        String.valueOf(TEST_DELETE_REMOVED_COMIC_FILES),
        parameters.getString(PARAM_DELETE_REMOVED_COMIC_FILES));
    assertEquals(TEST_DESTINATION_DIRECTORY, parameters.getString(PARAM_TARGET_DIRECTORY));
    assertEquals(TEST_RENAMING_RULE, parameters.getString(PARAM_RENAMING_RULE));

    Mockito.verify(libraryService, Mockito.times(1))
        .prepareForConsolidation(
            TEST_DESTINATION_DIRECTORY, TEST_RENAMING_RULE, TEST_DELETE_REMOVED_COMIC_FILES);
    Mockito.verify(jobLauncher, Mockito.times(1))
        .run(consolidateLibraryJob, jobParametersArgumentCaptor.getValue());
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
  public void testRescanComics() throws Exception {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.rescanComics(new RescanComicsRequest(idList));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);

    Mockito.verify(comicService, Mockito.times(1)).rescanComics(idList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(processComicsJob, jobParameters);
  }

  @Test
  public void testUpdateMetadata() throws Exception {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.updateMetadata(new UpdateMetadataRequest(idList));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);

    Mockito.verify(libraryService, Mockito.times(1)).updateMetadata(idList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(updateMetadataJob, jobParameters);
  }
}
