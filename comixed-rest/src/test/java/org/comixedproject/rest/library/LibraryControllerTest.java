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

import static org.comixedproject.batch.comicbooks.EditComicBookMetadataConfiguration.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.net.admin.ClearImageCacheResponse;
import org.comixedproject.model.net.comicbooks.ConvertComicsRequest;
import org.comixedproject.model.net.comicbooks.EditMultipleComicsRequest;
import org.comixedproject.model.net.library.PurgeLibraryRequest;
import org.comixedproject.model.net.library.RemoteLibraryState;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicSelectionService;
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
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameter;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.beans.factory.annotation.Qualifier;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LibraryControllerTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final long TEST_COMIC_BOOK_ID = 718L;
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "1234";
  private static final String TEST_ISSUE_NUMBER = "17b";
  private static final String TEST_IMPRINT = "The Imprint";
  private static final String TEST_ENCODED_IDS = "The encoded selected ids";
  private static final String TEST_REENCODED_IDS = "The re-encoded selected ids";
  private static final String TEST_EMAIL = "user@comixedproject.org";

  @InjectMocks private LibraryController controller;
  @Mock private LibraryService libraryService;
  @Mock private RemoteLibraryStateService remoteLibraryStateService;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private ConfigurationService configurationService;
  @Mock private List<Long> idList;
  @Mock private JobOperator jobOperator;
  @Mock private JobExecution jobExecution;
  @Mock private EditMultipleComicsRequest editMultipleComicsRequest;
  @Mock private RemoteLibraryState remoteLibraryState;
  @Mock private HttpSession httpSession;
  @Mock private Principal principal;

  @Mock
  @Qualifier(EDIT_COMIC_METADATA_JOB)
  private Job editComicMetadataJob;

  private List<Long> selectedIds = new ArrayList<>();

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @BeforeEach
  void setUp() throws ComicBookSelectionException {
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_IDS);
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(comicSelectionService.decodeSelections(TEST_ENCODED_IDS)).thenReturn(selectedIds);
    when(comicSelectionService.encodeSelections(Mockito.anyList())).thenReturn(TEST_REENCODED_IDS);
    selectedIds.add(TEST_COMIC_BOOK_ID);
  }

  @Test
  void getLibraryState() {
    when(remoteLibraryStateService.getLibraryState()).thenReturn(remoteLibraryState);

    final RemoteLibraryState result = controller.getLibraryState();

    assertNotNull(result);
    assertSame(remoteLibraryState, result);

    verify(remoteLibraryStateService).getLibraryState();
  }

  @Test
  void convertSingleComicBookNoRecreateAllowed() {
    when(configurationService.isFeatureEnabled(ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(true);

    assertThrows(
        LibraryException.class,
        () ->
            controller.convertSingleComicBooks(
                new ConvertComicsRequest(TEST_ARCHIVE_TYPE), TEST_COMIC_BOOK_ID));
  }

  @Test
  void convertSingleComicBook() throws Exception {
    when(configurationService.isFeatureEnabled(ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(false);

    controller.convertSingleComicBooks(
        new ConvertComicsRequest(TEST_ARCHIVE_TYPE), TEST_COMIC_BOOK_ID);

    verify(libraryService)
        .prepareToRecreate(new ArrayList<>(Arrays.asList(TEST_COMIC_BOOK_ID)), TEST_ARCHIVE_TYPE);
  }

  @Test
  void convertSelectedComicBooksNoRecreateAllowed() {
    when(configurationService.isFeatureEnabled(ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(true);

    assertThrows(
        LibraryException.class,
        () ->
            controller.convertSelectedComicBooks(
                httpSession, principal, new ConvertComicsRequest(TEST_ARCHIVE_TYPE)));
  }

  @Test
  void convertSelectedComicBooks() throws Exception {
    when(configurationService.isFeatureEnabled(ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS))
        .thenReturn(false);

    controller.convertSelectedComicBooks(
        httpSession, principal, new ConvertComicsRequest(TEST_ARCHIVE_TYPE));

    verify(libraryService).prepareToRecreate(selectedIds, TEST_ARCHIVE_TYPE);
  }

  @Test
  void organizeLibrary() throws Exception {
    controller.organizeLibrary(httpSession, principal);

    verify(libraryService).prepareForOrganization(selectedIds);
    verify(httpSession).getAttribute(LIBRARY_SELECTIONS);
    verify(comicSelectionService).decodeSelections(TEST_ENCODED_IDS);
    verify(comicSelectionService).clearSelectedComicBooks(TEST_EMAIL, selectedIds);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_IDS);
  }

  @Test
  void organizeEntireLibrary() {
    controller.organizeEntireLibrary();

    verify(libraryService).prepareAllForOrganization();
  }

  @Test
  void clearImageCache() throws LibraryException {
    Mockito.doNothing().when(libraryService).clearImageCache();

    ClearImageCacheResponse result = controller.clearImageCache();

    assertNotNull(result);
    assertTrue(result.isSuccess());

    verify(libraryService).clearImageCache();
  }

  @Test
  void clearImageCacheWithError() throws LibraryException {
    doThrow(LibraryException.class).when(libraryService).clearImageCache();

    ClearImageCacheResponse result = controller.clearImageCache();

    assertNotNull(result);
    assertFalse(result.isSuccess());

    verify(libraryService).clearImageCache();
  }

  @Test
  void rescanComicBooks() throws Exception {
    controller.rescanSelectedComicBooks(httpSession, principal);

    verify(comicBookService).prepareForRescan(selectedIds);
  }

  @Test
  void updateSingleComicBookMetadata() throws Exception {
    controller.updateSingleComicBookMetadata(TEST_COMIC_BOOK_ID);

    verify(comicBookService)
        .prepareForMetadataUpdate(new ArrayList<>(Arrays.asList(TEST_COMIC_BOOK_ID)));
  }

  @Test
  void updateSelectedComicBooksMetadata() throws Exception {
    controller.updateSelectedComicBooksMetadata(httpSession, principal);

    verify(libraryService).updateMetadata(selectedIds);
  }

  @Test
  void purge() throws Exception {
    controller.purgeLibrary(new PurgeLibraryRequest());

    verify(libraryService).prepareForPurging();
  }

  @Test
  void editMultipleComicsServiceThrowsException() throws Exception {
    when(editMultipleComicsRequest.getIds()).thenReturn(idList);

    doThrow(ComicBookException.class)
        .when(comicBookService)
        .updateMultipleComics(Mockito.anyList());

    assertThrows(
        ComicBookException.class, () -> controller.editMultipleComics(editMultipleComicsRequest));
  }

  @Test
  void editMultipleComics() throws Exception {
    when(editMultipleComicsRequest.getIds()).thenReturn(idList);
    when(editMultipleComicsRequest.getPublisher()).thenReturn(TEST_PUBLISHER);
    when(editMultipleComicsRequest.getSeries()).thenReturn(TEST_SERIES);
    when(editMultipleComicsRequest.getVolume()).thenReturn(TEST_VOLUME);
    when(editMultipleComicsRequest.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    when(editMultipleComicsRequest.getImprint()).thenReturn(TEST_IMPRINT);
    when(jobOperator.start(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.editMultipleComics(editMultipleComicsRequest);

    verify(comicBookService).updateMultipleComics(idList);

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertTrue(
        jobParameters.parameters().stream()
            .map(JobParameter::name)
            .toList()
            .containsAll(
                List.of(
                    EDIT_COMIC_METADATA_JOB_PUBLISHER,
                    EDIT_COMIC_METADATA_JOB_SERIES,
                    EDIT_COMIC_METADATA_JOB_VOLUME,
                    EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER,
                    EDIT_COMIC_METADATA_JOB_IMPRINT)));

    verify(comicBookService).updateMultipleComics(idList);
    verify(jobOperator).start(editComicMetadataJob, jobParameters);
  }
}
