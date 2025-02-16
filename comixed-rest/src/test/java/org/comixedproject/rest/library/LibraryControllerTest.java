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
import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.Assert.assertThrows;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LibraryControllerTest {
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
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private ConfigurationService configurationService;
  @Mock private List<Long> idList;
  @Mock private JobLauncher jobLauncher;
  @Mock private JobExecution jobExecution;
  @Mock private EditMultipleComicsRequest editMultipleComicsRequest;
  @Mock private RemoteLibraryState remoteLibraryState;
  @Mock private List selectedIds;
  @Mock private HttpSession httpSession;

  @Mock
  @Qualifier(UPDATE_COMIC_BOOKS_JOB)
  private Job updateComicBooksJob;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @BeforeEach
  void setUp() throws ComicBookSelectionException {
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_IDS);
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_IDS)).thenReturn(selectedIds);
    Mockito.when(comicSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_IDS);
  }

  @Test
  void getLibraryState() {
    Mockito.when(remoteLibraryStateService.getLibraryState()).thenReturn(remoteLibraryState);

    final RemoteLibraryState result = controller.getLibraryState();

    assertNotNull(result);
    assertSame(remoteLibraryState, result);

    Mockito.verify(remoteLibraryStateService, Mockito.times(1)).getLibraryState();
  }

  @Test
  void convertSingleComicBookNoRecreateAllowed() {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(true);

    assertThrows(
        LibraryException.class,
        () ->
            controller.convertSingleComicBooks(
                new ConvertComicsRequest(
                    TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES),
                TEST_COMIC_BOOK_ID));
  }

  @Test
  void convertSingleComicBook() throws Exception {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(false);

    controller.convertSingleComicBooks(
        new ConvertComicsRequest(TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES),
        TEST_COMIC_BOOK_ID);

    Mockito.verify(libraryService, Mockito.times(1))
        .prepareToRecreate(
            new ArrayList<>(Arrays.asList(TEST_COMIC_BOOK_ID)),
            TEST_ARCHIVE_TYPE,
            TEST_RENAME_PAGES,
            TEST_DELETE_MARKED_PAGES);
  }

  @Test
  void convertSelectedComicBooksNoRecreateAllowed() {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(true);

    assertThrows(
        LibraryException.class,
        () ->
            controller.convertSelectedComicBooks(
                httpSession,
                new ConvertComicsRequest(
                    TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES)));
  }

  @Test
  void convertSelectedComicBooks() throws Exception {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(false);

    controller.convertSelectedComicBooks(
        httpSession,
        new ConvertComicsRequest(TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES));

    Mockito.verify(libraryService, Mockito.times(1))
        .prepareToRecreate(
            selectedIds, TEST_ARCHIVE_TYPE, TEST_RENAME_PAGES, TEST_DELETE_MARKED_PAGES);
  }

  @Test
  void organizeLibrary() throws Exception {
    controller.organizeLibrary(httpSession);

    Mockito.verify(libraryService, Mockito.times(1)).prepareForOrganization(selectedIds);
    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicSelectionService, Mockito.times(1)).decodeSelections(TEST_ENCODED_IDS);
    Mockito.verify(comicSelectionService, Mockito.times(1)).clearSelectedComicBooks(selectedIds);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_IDS);
  }

  @Test
  void organizeEntireLibrary() {
    controller.organizeEntireLibrary();

    Mockito.verify(libraryService, Mockito.times(1)).prepareAllForOrganization();
  }

  @Test
  void clearImageCache() throws LibraryException {
    Mockito.doNothing().when(libraryService).clearImageCache();

    ClearImageCacheResponse result = controller.clearImageCache();

    assertNotNull(result);
    assertTrue(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
  }

  @Test
  void clearImageCacheWithError() throws LibraryException {
    Mockito.doThrow(LibraryException.class).when(libraryService).clearImageCache();

    ClearImageCacheResponse result = controller.clearImageCache();

    assertNotNull(result);
    assertFalse(result.isSuccess());

    Mockito.verify(libraryService, Mockito.times(1)).clearImageCache();
  }

  @Test
  void rescanComicBooks() throws Exception {
    controller.rescanSelectedComicBooks(httpSession);

    Mockito.verify(comicBookService, Mockito.times(1)).prepareForRescan(selectedIds);
  }

  @Test
  void updateSingleComicBookMetadata() throws Exception {
    controller.updateSingleComicBookMetadata(TEST_COMIC_BOOK_ID);

    Mockito.verify(comicBookService, Mockito.times(1))
        .prepareForMetadataUpdate(new ArrayList<>(Arrays.asList(TEST_COMIC_BOOK_ID)));
  }

  @Test
  void updateSelectedComicBooksMetadata() throws Exception {
    controller.updateSelectedComicBooksMetadata(httpSession);

    Mockito.verify(libraryService, Mockito.times(1)).updateMetadata(selectedIds);
  }

  @Test
  void purge() throws Exception {
    controller.purgeLibrary(new PurgeLibraryRequest());

    Mockito.verify(libraryService, Mockito.times(1)).prepareForPurging();
  }

  @Test
  void editMultipleComicsServiceThrowsException() throws Exception {
    Mockito.when(editMultipleComicsRequest.getIds()).thenReturn(idList);

    Mockito.doThrow(ComicBookException.class)
        .when(comicBookService)
        .updateMultipleComics(Mockito.anyList());

    assertThrows(
        ComicBookException.class, () -> controller.editMultipleComics(editMultipleComicsRequest));
  }

  @Test
  void editMultipleComics() throws Exception {
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
    assertTrue(jobParameters.getParameters().containsKey(UPDATE_COMIC_BOOKS_JOB_PUBLISHER));
    assertTrue(jobParameters.getParameters().containsKey(UPDATE_COMIC_BOOKS_JOB_SERIES));
    assertTrue(jobParameters.getParameters().containsKey(UPDATE_COMIC_BOOKS_JOB_VOLUME));
    assertTrue(jobParameters.getParameters().containsKey(UPDATE_COMIC_BOOKS_JOB_ISSUE_NUMBER));
    assertTrue(jobParameters.getParameters().containsKey(UPDATE_COMIC_BOOKS_JOB_IMPRINT));

    Mockito.verify(comicBookService, Mockito.times(1)).updateMultipleComics(idList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(updateComicBooksJob, jobParameters);
  }
}
