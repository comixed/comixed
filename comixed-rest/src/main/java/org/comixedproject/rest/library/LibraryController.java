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

import static org.comixedproject.batch.comicbooks.EditComicBookMetadataConfiguration.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
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
import org.comixedproject.views.View;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>LibraryReaderController</code> provides REST APIs for working with groups of {@link
 * ComicBook} objects.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class LibraryController {
  @Autowired private LibraryService libraryService;
  @Autowired private RemoteLibraryStateService remoteLibraryStateService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ConfigurationService configurationService;
  @Autowired private ComicSelectionService comicSelectionService;

  @Autowired
  @Qualifier("batchJobOperator")
  private JobLauncher jobLauncher;

  @Autowired
  @Qualifier(EDIT_COMIC_METADATA_JOB)
  private Job editComicMetadataJob;

  /**
   * Retrieves the current state of the library.
   *
   * @return the library state
   */
  @GetMapping(value = "/api/library/state", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.library.get-state")
  @JsonView(View.RemoteLibraryState.class)
  public RemoteLibraryState getLibraryState() {
    log.info("Loading the current library state");
    return this.remoteLibraryStateService.getLibraryState();
  }

  /**
   * Prepares comics to have their underlying file recreated.
   *
   * @param request the request body
   * @param comicBookId the comic book id
   * @throws LibraryException if an error occurs
   */
  @PutMapping(
      value = "/api/library/conversion/{comicBookId}",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.library.convert-single-comic-book")
  @PreAuthorize("hasRole('ADMIN')")
  public void convertSingleComicBooks(
      @RequestBody() final ConvertComicsRequest request,
      @PathVariable("comicBookId") final long comicBookId)
      throws LibraryException {
    if (this.configurationService.isFeatureEnabled(
        ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS)) {
      throw new LibraryException("Recreating comic files is currently disabled");
    }

    final ArchiveType archiveType = request.getArchiveType();
    final boolean renamePages = request.isRenamePages();
    final boolean deletePages = request.isDeletePages();

    log.info(
        "Converting single comic book: target={} delete pages={} rename pages={}",
        comicBookId,
        archiveType,
        renamePages,
        deletePages);

    log.trace("Preparing to recreate comic book file");
    this.libraryService.prepareToRecreate(
        new ArrayList<>(Arrays.asList(comicBookId)), archiveType, renamePages, deletePages);
  }

  /**
   * Prepares comics to have their underlying file recreated.
   *
   * @param session the session
   * @param principal the user principal
   * @param request the request body
   * @throws LibraryException if an error occurs
   */
  @PutMapping(
      value = "/api/library/conversion/selected",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.library.convert-selected-comic-books")
  @PreAuthorize("hasRole('ADMIN')")
  public void convertSelectedComicBooks(
      final HttpSession session,
      final Principal principal,
      @RequestBody() final ConvertComicsRequest request)
      throws LibraryException {
    if (this.configurationService.isFeatureEnabled(
        ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS)) {
      throw new LibraryException("Recreating comic files is currently disabled");
    }

    final String email = principal.getName();

    log.trace("Loading comic book selections");
    try {
      final List<Long> idList =
          this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
      final ArchiveType archiveType = request.getArchiveType();
      final boolean renamePages = request.isRenamePages();
      final boolean deletePages = request.isDeletePages();

      log.info(
          "Converting comic(s): email={} target={} delete pages={} rename pages={}",
          email,
          archiveType,
          renamePages,
          deletePages);

      log.trace("Preparing to recreate comic files");
      this.libraryService.prepareToRecreate(idList, archiveType, renamePages, deletePages);
      log.trace("Clearing comic book selections");
      this.comicSelectionService.clearSelectedComicBooks(email, idList);
      log.trace("Saving comic book selections");
      session.setAttribute(LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(idList));
    } catch (ComicBookSelectionException error) {
      throw new LibraryException("Failed to start converting selected comic books", error);
    }
  }

  /**
   * Initiates the library organization process.
   *
   * @param session the session
   * @param principal the user principal
   * @throws Exception if an error occurs
   */
  @PostMapping(
      value = "/api/library/organize",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.library.organize")
  public void organizeLibrary(final HttpSession session, final Principal principal)
      throws Exception {
    final String email = principal.getName();
    final List<Long> selectedIds =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Organizing library: email={} count={}", email, selectedIds.size());
    this.libraryService.prepareForOrganization(selectedIds);
    log.debug("Clearing comic book selections");
    this.comicSelectionService.clearSelectedComicBooks(email, selectedIds);
    log.debug("Deleting selections from session");
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selectedIds));
  }

  /** Initiates the library organization process for all comics. */
  @PostMapping(
      value = "/api/library/organize/all",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.library.organize")
  public void organizeEntireLibrary() {
    log.info("Preparing to organize entire library");
    this.libraryService.prepareAllForOrganization();
  }

  /**
   * Clears the library image cache.
   *
   * @return the response
   */
  @DeleteMapping(value = "/api/library/cache/images")
  @Timed(value = "comixed.library.image-cache.clear")
  public ClearImageCacheResponse clearImageCache() {
    log.info("Clearing the image cache");

    try {
      this.libraryService.clearImageCache();
    } catch (LibraryException error) {
      log.error("failed to clear image cache", error);
      return new ClearImageCacheResponse(false);
    }

    return new ClearImageCacheResponse(true);
  }

  /**
   * Initiates the rescan process for a single comic book.
   *
   * @param comicBookId the comic book id
   * @throws Exception if an error occurs
   */
  @PutMapping(
      value = "/api/library/rescan/{comicBookId}",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.library.batch.rescan-single")
  public void rescanSingleComicBook(@PathVariable("comicBookId") final long comicBookId)
      throws Exception {
    log.info("Rescanning single comic book: id={}", comicBookId);
    this.comicBookService.prepareForRescan(Arrays.asList(comicBookId));
  }

  /**
   * Initiates the rescan process for the selected comic books.
   *
   * @param session the session
   * @param principal the user principal
   * @throws Exception if an error occurs
   */
  @PutMapping(value = "/api/library/rescan/selected", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.library.batch.rescan-selected")
  public void rescanSelectedComicBooks(final HttpSession session, final Principal principal)
      throws Exception {
    final String email = principal.getName();
    final List<Long> selectedIdList =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Rescanning selected comic books: email={}", email);
    this.comicBookService.prepareForRescan(selectedIdList);
    this.comicSelectionService.clearSelectedComicBooks(email, selectedIdList);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selectedIdList));
  }

  /**
   * Starts the metadata update process for a single comic book.
   *
   * @param comicBookId the comic book id
   * @throws Exception if an error occurs
   */
  @PutMapping(value = "/api/library/metadata/update/{comicBookId}")
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.library.batch.metadata-update-selected-comic-books")
  public void updateSingleComicBookMetadata(@PathVariable("comicBookId") final long comicBookId)
      throws Exception {
    log.info("Updating the metadata a single comic book: id={}", comicBookId);
    this.comicBookService.prepareForMetadataUpdate(new ArrayList<>(Arrays.asList(comicBookId)));
  }

  /**
   * Starts the metadata update process for the selected comic books.
   *
   * @param session the session
   * @param principal the user principal
   * @throws Exception if an error occurs
   */
  @PutMapping(value = "/api/library/metadata/update/selected")
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.library.batch.metadata-update-selected-comic-books")
  public void updateSelectedComicBooksMetadata(final HttpSession session, final Principal principal)
      throws Exception {
    final String email = principal.getName();
    final List<Long> selectedComicBookIds =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Updating the metadata for {} comic(s): email={}", selectedComicBookIds.size(), email);
    this.libraryService.updateMetadata(new ArrayList<>(selectedComicBookIds));
    this.comicSelectionService.clearSelectedComicBooks(email, selectedComicBookIds);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selectedComicBookIds));
  }

  /**
   * Purges deleted comics from the library.
   *
   * @param request the request body
   * @throws Exception if an error occurs
   */
  @PostMapping(value = "/api/library/purge", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.library.batch.purge")
  public void purgeLibrary(@RequestBody() final PurgeLibraryRequest request) throws Exception {
    log.info("Purging comics marked for deletion");
    this.libraryService.prepareForPurging();
  }

  /**
   * Updates a set of comics with the provided details.
   *
   * @param request the request body
   * @throws ComicBookException if an error occurs
   */
  @PostMapping(value = "/api/library/comics/edit", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.library.edit-comics")
  public void editMultipleComics(@RequestBody() final EditMultipleComicsRequest request)
      throws Exception {
    final List<Long> ids = request.getIds();
    log.info("Preparing to update details for {} comic{}", ids.size(), ids.size() == 1 ? "" : "s");
    this.comicBookService.updateMultipleComics(ids);
    log.trace("Launching update comics batch process");
    this.jobLauncher.run(
        this.editComicMetadataJob,
        new JobParametersBuilder()
            .addLong(EDIT_COMIC_METADATA_JOB_TIME_STARTED, System.currentTimeMillis())
            .addString(EDIT_COMIC_METADATA_JOB_PUBLISHER, request.getPublisher())
            .addString(EDIT_COMIC_METADATA_JOB_SERIES, request.getSeries())
            .addString(EDIT_COMIC_METADATA_JOB_VOLUME, request.getVolume())
            .addString(EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER, request.getIssueNumber())
            .addString(EDIT_COMIC_METADATA_JOB_IMPRINT, request.getImprint())
            .addString(
                EDIT_COMIC_METADATA_JOB_COMIC_TYPE,
                request.getComicType() != null ? request.getComicType().name() : "")
            .toJobParameters());
  }
}
