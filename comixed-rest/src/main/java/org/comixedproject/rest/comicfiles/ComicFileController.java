/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.rest.comicfiles;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.batch.comicbooks.AddComicsConfiguration;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.model.net.comicfiles.FilenameMetadataRequest;
import org.comixedproject.model.net.comicfiles.FilenameMetadataResponse;
import org.comixedproject.model.net.comicfiles.GetAllComicsUnderRequest;
import org.comixedproject.model.net.comicfiles.ImportComicFilesRequest;
import org.comixedproject.model.net.comicfiles.LoadComicFilesResponse;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.comixedproject.views.View;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ComicFileController</code> allows the remote agent to query directories and import files,
 * to download files and work with the file system.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComicFileController {
  @Autowired private ComicFileService comicFileService;
  @Autowired private FilenameScrapingRuleService filenameScrapingRuleService;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Autowired
  @Qualifier("addComicsToLibraryJob")
  private Job addComicsToLibraryJob;

  /**
   * Retrieves all comic files under the specified directory.
   *
   * @param request the request body
   * @return the list of comic files
   * @throws IOException if an error occurs
   * @throws IOException if an error occurs
   */
  @PostMapping(
      value = "/api/files/contents",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ComicFileList.class)
  public LoadComicFilesResponse loadComicFiles(
      @RequestBody() final GetAllComicsUnderRequest request) throws IOException {
    String directory = request.getDirectory();
    Integer maximum = request.getMaximum();

    log.info(
        "Getting all comic files: root={} maximum={}",
        directory,
        maximum > 0 ? maximum : "UNLIMITED");

    return new LoadComicFilesResponse(this.comicFileService.getAllComicsUnder(directory, maximum));
  }

  /**
   * Returns the content for the first image in the specified file.
   *
   * @param filename the file
   * @return the image content, or null
   */
  @GetMapping(value = "/api/files/import/cover")
  public byte[] getImportFileCover(@RequestParam("filename") String filename) {
    // for some reason, during development, this value ALWAYS had a trailing
    // space...
    filename = filename.trim();

    log.info("Getting cover image for archive: filename={}", filename);

    byte[] result = null;

    try {
      result = this.comicFileService.getImportFileCover(filename);
    } catch (AdaptorException error) {
      log.error("Failed to load cover from import file", error);
    }

    if (result == null) {
      try {
        result = IOUtils.toByteArray(this.getClass().getResourceAsStream("/images/missing.png"));
      } catch (IOException error) {
        log.error("Failed to load the missing page image", error);
      }
    }

    return result;
  }

  /**
   * Begins the process of enqueueing comic files for import.
   *
   * @param request the request body
   * @throws JobInstanceAlreadyCompleteException if an error occurs
   * @throws JobExecutionAlreadyRunningException if an error occurs
   * @throws JobParametersInvalidException if an error occurs
   * @throws JobRestartException if an error occurs
   */
  @PostMapping(
      value = "/api/files/import",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public void importComicFiles(@RequestBody() ImportComicFilesRequest request)
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> filenames = request.getFilenames();

    log.info("Importing comic files");
    this.comicFileService.importComicFiles(filenames);
    log.trace("Launching add comics process");
    this.jobLauncher.run(
        addComicsToLibraryJob,
        new JobParametersBuilder()
            .addLong(AddComicsConfiguration.PARAM_ADD_COMICS_STARTED, System.currentTimeMillis())
            .toJobParameters());
  }

  /**
   * Returns the metadata extracted from the given filename.
   *
   * @param request the request body
   * @return the response body
   */
  @PostMapping(
      value = "/api/files/metadata",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public FilenameMetadataResponse scrapeFilename(
      @RequestBody() final FilenameMetadataRequest request) {
    final String filename = FilenameUtils.getBaseName(request.getFilename());
    log.info("Scraping filename: {}", filename);
    final FilenameMetadata info = this.filenameScrapingRuleService.loadFilenameMetadata(filename);
    return new FilenameMetadataResponse(
        false, info.getSeries(), info.getVolume(), info.getIssueNumber());
  }
}
