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

package org.comixedproject.rest.library;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicbooks.PurgeLibraryConfiguration.JOB_PURGE_LIBRARY_START;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.JOB_DELETE_MARKED_PAGES;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.JOB_TARGET_ARCHIVE;
import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.net.admin.ClearImageCacheResponse;
import org.comixedproject.model.net.comicbooks.ConvertComicsRequest;
import org.comixedproject.model.net.comicbooks.EditMultipleComicsRequest;
import org.comixedproject.model.net.library.*;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.*;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.library.LibraryService;
import org.comixedproject.service.library.RemoteLibraryStateService;
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
  private static final Boolean TEST_DELETE_MARKED_PAGES = RANDOM.nextBoolean();
  private static final long TEST_COMIC_BOOK_ID = 718L;
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "1234";
  private static final String TEST_ISSUE_NUMBER = "17b";
  private static final String TEST_IMPRINT = "The Imprint";
  private static final String TEST_ENCODED_IDS = "The encoded selected ids";
  private static final String TEST_REENCODED_IDS = "The re-encoded selected ids";

  @InjectMocks private LibraryController controller;
  @Mock private LibraryService libraryService;
  @Mock private RemoteLibraryStateService remoteLibraryStateService;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private ConfigurationService configurationService;
  @Mock private List<Long> idList;
  @Mock private JobLauncher jobLauncher;
  @Mock private JobExecution jobExecution;
  @Mock private EditMultipleComicsRequest editMultipleComicsRequest;
  @Mock private RemoteLibraryState remoteLibraryState;
  @Mock private List selectedIds;
  @Mock private HttpSession httpSession;

  @Mock
  @Qualifier("recreateComicFilesJob")
  private Job recreateComicFilesJob;

  @Mock
  @Qualifier("purgeLibraryJob")
  private Job purgeLibraryJob;

  @Mock
  @Qualifier("updateComicBooksJob")
  private Job updateComicBooksJob;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_IDS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_IDS))
        .thenReturn(selectedIds);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_IDS);
  }

  @Test
  public void testGetLibraryState() throws ComicBookSelectionException {
    Mockito.when(remoteLibraryStateService.getLibraryState()).thenReturn(remoteLibraryState);

    final RemoteLibraryState result = controller.getLibraryState();

    assertNotNull(result);
    assertSame(remoteLibraryState, result);

    Mockito.verify(remoteLibraryStateService, Mockito.times(1)).getLibraryState();
  }

  @Test(expected = LibraryException.class)
  public void testConvertSingleComicBookNoRecreateAllowed() throws Exception {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(true);

    try {
      controller.convertSingleComicBooks(
          new ConvertComicsRequest(TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES),
          TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(libraryService, Mockito.never()).prepareToRecreate(Mockito.anyList());
      Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
    }
  }

  @Test
  public void testConvertSingleComicBook() throws Exception {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(false);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.convertSingleComicBooks(
        new ConvertComicsRequest(TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES),
        TEST_COMIC_BOOK_ID);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertEquals(TEST_ARCHIVE_TYPE.getName(), jobParameters.getString(JOB_TARGET_ARCHIVE));
    assertEquals(
        String.valueOf(TEST_DELETE_MARKED_PAGES), jobParameters.getString(JOB_DELETE_MARKED_PAGES));

    Mockito.verify(libraryService, Mockito.times(1))
        .prepareToRecreate(new ArrayList<>(Arrays.asList(TEST_COMIC_BOOK_ID)));
    Mockito.verify(jobLauncher, Mockito.times(1)).run(recreateComicFilesJob, jobParameters);
  }

  @Test(expected = LibraryException.class)
  public void testConvertSelectedComicBooksNoRecreateAllowed() throws Exception {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(true);

    try {
      controller.convertSelectedComicBooks(
          httpSession,
          new ConvertComicsRequest(TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES));
    } finally {
      Mockito.verify(libraryService, Mockito.never()).prepareToRecreate(Mockito.anyList());
      Mockito.verify(jobLauncher, Mockito.never()).run(Mockito.any(), Mockito.any());
    }
  }

  @Test
  public void testConvertSelectedComicBooks() throws Exception {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(false);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.convertSelectedComicBooks(
        httpSession,
        new ConvertComicsRequest(TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertEquals(TEST_ARCHIVE_TYPE.getName(), jobParameters.getString(JOB_TARGET_ARCHIVE));
    assertEquals(
        String.valueOf(TEST_DELETE_MARKED_PAGES), jobParameters.getString(JOB_DELETE_MARKED_PAGES));

    Mockito.verify(libraryService, Mockito.times(1)).prepareToRecreate(selectedIds);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(recreateComicFilesJob, jobParameters);
  }

  @Test
  public void testOrganizeLibrary() throws Exception {
    controller.organizeLibrary(httpSession);

    Mockito.verify(libraryService, Mockito.times(1)).prepareForOrganization(selectedIds);
    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).decodeSelections(TEST_ENCODED_IDS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .clearSelectedComicBooks(selectedIds);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_IDS);
  }

  @Test
  public void testOrganizeEntireLibrary() throws Exception {
    controller.organizeEntireLibrary();

    Mockito.verify(libraryService, Mockito.times(1)).prepareForOrganization();
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
  public void testRescanComicBooks() throws Exception {
    controller.rescanSelectedComicBooks(httpSession);

    Mockito.verify(comicBookService, Mockito.times(1)).prepareForRescan(selectedIds);
  }

  @Test
  public void testUpdateSingleComicBookMetadata() throws Exception {
    controller.updateSingleComicBookMetadata(TEST_COMIC_BOOK_ID);

    Mockito.verify(comicBookService, Mockito.times(1))
        .prepareForMetadataUpdate(new ArrayList<>(Arrays.asList(TEST_COMIC_BOOK_ID)));
  }

  @Test
  public void testUpdateSelectedComicBooksMetadata() throws Exception {
    controller.updateSelectedComicBooksMetadata(httpSession);

    Mockito.verify(libraryService, Mockito.times(1)).updateMetadata(selectedIds);
  }

  @Test
  public void testPurge() throws Exception {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.purgeLibrary(new PurgeLibraryRequest());

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertTrue(jobParameters.getParameters().containsKey(JOB_PURGE_LIBRARY_START));

    Mockito.verify(libraryService, Mockito.times(1)).prepareForPurging();
    Mockito.verify(jobLauncher, Mockito.times(1)).run(purgeLibraryJob, jobParameters);
  }

  @Test(expected = Exception.class)
  public void testEditMultipleComicsServiceThrowsException() throws Exception {
    Mockito.when(editMultipleComicsRequest.getIds()).thenReturn(idList);

    Mockito.doThrow(ComicBookException.class)
        .when(comicBookService)
        .updateMultipleComics(Mockito.anyList());

    try {
      controller.editMultipleComics(editMultipleComicsRequest);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).updateMultipleComics(idList);
    }
  }

  @Test
  public void testEditMultipleComics() throws Exception {
    Mockito.when(editMultipleComicsRequest.getIds()).thenReturn(idList);
    Mockito.when(editMultipleComicsRequest.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(editMultipleComicsRequest.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(editMultipleComicsRequest.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(editMultipleComicsRequest.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(editMultipleComicsRequest.getImprint()).thenReturn(TEST_IMPRINT);
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.editMultipleComics(editMultipleComicsRequest);

    Mockito.verify(comicBookService, Mockito.times(1)).updateMultipleComics(idList);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertTrue(jobParameters.getParameters().containsKey(JOB_UPDATE_COMICBOOKS_PUBLISHER));
    assertTrue(jobParameters.getParameters().containsKey(JOB_UPDATE_COMICBOOKS_SERIES));
    assertTrue(jobParameters.getParameters().containsKey(JOB_UPDATE_COMICBOOKS_VOLUME));
    assertTrue(jobParameters.getParameters().containsKey(JOB_UPDATE_COMICBOOKS_ISSUENO));
    assertTrue(jobParameters.getParameters().containsKey(JOB_UPDATE_COMICBOOKS_IMPRINT));

    Mockito.verify(comicBookService, Mockito.times(1)).updateMultipleComics(idList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(updateComicBooksJob, jobParameters);
  }
}
