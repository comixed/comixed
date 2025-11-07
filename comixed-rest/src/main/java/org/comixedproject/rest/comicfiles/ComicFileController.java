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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.model.comicfiles.ComicFileGroup;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.model.net.comicfiles.*;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.comixedproject.views.View;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
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
  static final String COMIC_FILES = "comic.files";

  @Autowired private ComicFileService comicFileService;
  @Autowired private FilenameScrapingRuleService filenameScrapingRuleService;
  @Autowired private ObjectMapper objectMapper;

  /**
   * Loads the cached list of comic files.
   *
   * @param session the user session
   * @return the comic files
   */
  @GetMapping(value = "/api/files/session", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-file.load-comic-files-session")
  @JsonView(View.ComicFileList.class)
  public LoadComicFilesResponse loadComicFilesFromSession(final HttpSession session)
      throws JsonProcessingException {
    log.info("Loading comic files from user session");
    if (session.getAttribute(COMIC_FILES) == null) {
      return null;
    }
    final List<ComicFileGroup> comicFiles = this.doLoadComicFileSelections(session);
    if (Objects.isNull(comicFiles)) {
      return null;
    }
    return new LoadComicFilesResponse(comicFiles);
  }

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
  @Timed(value = "comixed.comic-file.load-comic-files")
  @JsonView(View.ComicFileList.class)
  public LoadComicFilesResponse loadComicFiles(
      final HttpSession session, @RequestBody() final GetAllComicsUnderRequest request)
      throws IOException {
    String directory = request.getDirectory();
    Integer maximum = request.getMaximum();

    log.info(
        "Getting all comic files: root={} maximum={}",
        directory,
        maximum > 0 ? maximum : "UNLIMITED");

    final List<ComicFileGroup> files = this.comicFileService.getAllComicsUnder(directory, maximum);

    session.setAttribute(COMIC_FILES, this.objectMapper.writeValueAsString(files));

    return new LoadComicFilesResponse(files);
  }

  /**
   * Returns the content for the first image in the specified file.
   *
   * @param filename the file
   * @return the image content, or null
   */
  @GetMapping(value = "/api/files/import/cover")
  @Timed(value = "comixed.comic-file.get-cover")
  public byte[] getImportFileCover(@RequestParam("filename") String filename) {
    // for some reason, during development, this value ALWAYS had a trailing
    // space...
    filename = filename.trim();

    log.debug("Getting cover image for archive: filename={}", filename);

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
   * Toggles comic file selections.
   *
   * @param session the session
   * @param request the request
   * @return the comic file groups
   * @throws JsonProcessingException if an error occurs updating the session
   */
  @PostMapping(
      value = "/api/files/import/selections",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.comic-file.selection-toggle")
  @JsonView(View.ComicFileList.class)
  public LoadComicFilesResponse toggleComicFileSelections(
      final HttpSession session, @RequestBody final ToggleComicFileSelectionsRequest request)
      throws JsonProcessingException {
    final List<ComicFileGroup> comicFiles = this.doLoadComicFileSelections(session);
    if (Objects.nonNull(comicFiles)) {
      final String filename = request.getFilename();
      final boolean selected = request.isSelected();
      final boolean single = request.isSingle();

      log.info(
          "Toggling comic files selections: filename={}, selected={} single={}",
          filename,
          selected,
          single);
      this.comicFileService.toggleComicFileSelections(comicFiles, filename, selected, single);
      log.debug("Updating comic files in session");
      session.setAttribute(COMIC_FILES, this.objectMapper.writeValueAsString(comicFiles));
      return new LoadComicFilesResponse(comicFiles);
    } else {
      log.info("No comic files to toggle...");
      return null;
    }
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
  @Timed(value = "comixed.comic-file.batch.import-files")
  public void importComicFiles(
      final HttpSession session, @RequestBody() ImportComicFilesRequest request)
      throws JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException,
          JobParametersInvalidException,
          JobRestartException,
          JsonProcessingException {
    final List<String> filenames = new ArrayList<>();
    this.doLoadComicFileSelections(session)
        .forEach(
            comicFileGroup -> {
              filenames.addAll(
                  comicFileGroup.getFiles().stream()
                      .filter(entry -> entry.isSelected())
                      .map(entry -> entry.getFilename())
                      .toList());
            });

    log.info("Importing {} comic file(s)", filenames.size());
    this.comicFileService.importComicFiles(filenames);

    log.debug("Cleared comic files list");
    session.removeAttribute(COMIC_FILES);
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
  @Timed(value = "comixed.comic-file.scrape-filename")
  public FilenameMetadataResponse scrapeFilename(
      @RequestBody() final FilenameMetadataRequest request) {
    final String filename = FilenameUtils.getBaseName(request.getFilename());
    log.info("Scraping filename: {}", filename);
    final FilenameMetadata info = this.filenameScrapingRuleService.loadFilenameMetadata(filename);
    return new FilenameMetadataResponse(
        info.isFound(), info.getSeries(), info.getVolume(), info.getIssueNumber());
  }

  private List<ComicFileGroup> doLoadComicFileSelections(final HttpSession session)
      throws JsonProcessingException {
    final Object encodedComicFiles = session.getAttribute(COMIC_FILES);
    if (Objects.isNull(encodedComicFiles)) {
      log.debug("No comic files found in session");
      return null;
    }
    return this.objectMapper.readValue(
        encodedComicFiles.toString(), new TypeReference<List<ComicFileGroup>>() {});
  }
}
