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

import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.*;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.*;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.batch.comicbooks.ProcessComicsConfiguration;
import org.comixedproject.batch.comicbooks.UpdateMetadataConfiguration;
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
import org.comixedproject.views.View;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>LibraryController</code> provides REST APIs for working with groups of {@link Comic}
 * objects.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class LibraryController {
  static final int MAXIMUM_RECORDS = 100;

  @Autowired private LibraryService libraryService;
  @Autowired private ComicService comicService;
  @Autowired private ConfigurationService configurationService;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Autowired
  @Qualifier("processComicsJob")
  private Job processComicsJob;

  @Autowired
  @Qualifier("updateMetadataJob")
  private Job updateMetadataJob;

  @Autowired
  @Qualifier("consolidateLibraryJob")
  private Job consolidateLibraryJob;

  @Autowired
  @Qualifier("recreateComicFilesJob")
  private Job recreateComicFilesJob;

  /**
   * Prepares comics to have their underlying file recreated.
   *
   * @param request the request body
   * @throws Exception if an error occurs
   */
  @PostMapping(value = "/api/library/convert", consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public void convertComics(@RequestBody() ConvertComicsRequest request) throws Exception {
    List<Long> idList = request.getIds();
    ArchiveType archiveType = request.getArchiveType();
    boolean renamePages = request.isRenamePages();
    boolean deletePages = request.isDeletePages();

    log.info(
        "Converting comic{}: target={} delete pages={} rename pages={}",
        idList.size() == 1 ? "" : "s",
        archiveType,
        renamePages,
        deletePages);

    log.trace("Preparing to recreate comic files");
    this.libraryService.prepareToRecreateComics(idList);
    log.trace("Starting batch process");
    this.jobLauncher.run(
        recreateComicFilesJob,
        new JobParametersBuilder()
            .addLong(JOB_RECREATE_COMICS_STARTED, System.currentTimeMillis())
            .addString(JOB_TARGET_ARCHIVE, archiveType.getName())
            .addString(JOB_DELETE_MARKED_PAGES, String.valueOf(deletePages))
            .addString(JOB_RENAME_PAGES, String.valueOf(renamePages))
            .toJobParameters());
  }

  /**
   * Initiates the library consolidation process.
   *
   * @param request the request body
   * @throws Exception if an error occurs
   */
  @PostMapping(
      value = "/api/library/consolidate",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DeletedComicList.class)
  @AuditableEndpoint
  public void consolidateLibrary(@RequestBody() ConsolidateLibraryRequest request)
      throws Exception {
    final boolean deleteRemovedComicFiles = request.getDeletePhysicalFiles();
    log.info("Consolidating library: delete physic files={}", deleteRemovedComicFiles);
    log.trace("Loading target directory");
    final String targetDirectory =
        this.configurationService.getOptionValue(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY);
    log.trace("Loading renaming rule");
    final String renamingRule =
        this.configurationService.getOptionValue(ConfigurationService.CFG_LIBRARY_RENAMING_RULE);
    this.libraryService.prepareForConsolidation(
        targetDirectory, renamingRule, deleteRemovedComicFiles);
    log.trace("Launch consolidation batch process");
    this.jobLauncher.run(
        this.consolidateLibraryJob,
        new JobParametersBuilder()
            .addLong(PARAM_CONSOLIDATION_JOB_STARTED, System.currentTimeMillis())
            .addString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(deleteRemovedComicFiles))
            .addString(PARAM_TARGET_DIRECTORY, targetDirectory)
            .addString(PARAM_RENAMING_RULE, renamingRule)
            .toJobParameters());
  }

  @DeleteMapping(value = "/api/library/cache/images")
  @AuditableEndpoint
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
   * Loads a batch of comics during the initial startup process.
   *
   * @param request the request
   * @return the response
   */
  @PostMapping(
      value = "/api/library",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @AuditableEndpoint
  @JsonView(View.ComicListView.class)
  public LoadLibraryResponse loadLibrary(@RequestBody() final LoadLibraryRequest request) {
    final Long lastId = request.getLastId();
    log.info("Loading library for {}: last id was {}", lastId);

    List<Comic> comics = this.comicService.getComicsById(lastId, MAXIMUM_RECORDS + 1);
    boolean lastPayload = true;
    if (comics.size() > MAXIMUM_RECORDS) {
      comics = comics.subList(0, MAXIMUM_RECORDS);
      lastPayload = false;
    }

    return new LoadLibraryResponse(
        comics, comics.isEmpty() ? 0 : comics.get(comics.size() - 1).getId(), lastPayload);
  }

  /**
   * Initiates the rescan process for a set of comics.
   *
   * @param request the request body
   * @throws Exception if an error occurs
   */
  @PostMapping(value = "/api/library/rescan", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint
  public void rescanComics(@RequestBody() final RescanComicsRequest request) throws Exception {
    final List<Long> ids = request.getIds();
    log.info("Initiating library rescan for {} comic{}", ids.size(), ids.size() == 1 ? "" : "s");
    this.comicService.rescanComics(ids);
    log.trace("Initiating a rescan batch process");
    this.jobLauncher.run(
        processComicsJob,
        new JobParametersBuilder()
            .addLong(ProcessComicsConfiguration.JOB_RESCAN_COMICS_START, System.currentTimeMillis())
            .toJobParameters());
  }

  /**
   * Starts the metadata update process for a set of comics.
   *
   * @param request the request body
   * @throws Exception if an error occurs
   */
  @PostMapping(value = "/api/library/metadata", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint
  public void updateMetadata(@RequestBody() final UpdateMetadataRequest request) throws Exception {
    final List<Long> ids = request.getIds();
    log.info("Updating the metadata for {} comic{}", ids.size(), ids.size() == 1 ? "" : "s");
    this.libraryService.updateMetadata(ids);
    log.trace("Launching batch process");
    this.jobLauncher.run(
        this.updateMetadataJob,
        new JobParametersBuilder()
            .addLong(
                UpdateMetadataConfiguration.JOB_UPDATE_METADATA_STARTED, System.currentTimeMillis())
            .toJobParameters());
  }
}
