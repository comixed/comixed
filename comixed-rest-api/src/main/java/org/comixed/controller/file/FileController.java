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

package org.comixed.controller.file;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;
import org.apache.commons.io.IOUtils;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.controller.library.ComicController;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.file.FileDetails;
import org.comixed.net.GetAllComicsUnderRequest;
import org.comixed.net.ImportComicFilesResponse;
import org.comixed.net.ImportRequestBody;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.service.file.FileService;
import org.comixed.utils.ComicFileUtils;
import org.json.JSONException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

/**
 * <code>FileController</code> allows the remote agent to query directories and import files, to
 * download files and work with the file system.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/api/files")
public class FileController {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ComicRepository comicRepository;
  @Autowired private FileService fileService;

  private int requestId = 0;

  @PostMapping(
      value = "/contents",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Secured("ROLE_ADMIN")
  public List<FileDetails> getAllComicsUnder(@RequestBody() final GetAllComicsUnderRequest request)
      throws IOException, JSONException {
    this.logger.info("Getting all comic files: root={}", request.getDirectory());

    final List<FileDetails> result = this.fileService.getAllComicsUnder(request.getDirectory());

    this.logger.info("Returning {} file{}", result.size(), result.size() != 1 ? "s" : "");

    return result;
  }

  private void getAllFilesUnder(File root, List<FileDetails> result) throws IOException {
    for (File file : root.listFiles()) {
      if (file.isDirectory()) {
        this.logger.debug("Searching directory: " + file.getAbsolutePath());
        this.getAllFilesUnder(file, result);
      } else {

        if (ComicFileUtils.isComicFile(file)
            && (this.comicRepository.findByFilename(file.getCanonicalPath()) == null)) {
          this.logger.debug("Adding file: " + file.getCanonicalPath());
          result.add(new FileDetails(file.getCanonicalPath(), file.length()));
        }
      }
    }
  }

  @RequestMapping(value = "/import/cover", method = RequestMethod.GET)
  public byte[] getImportFileCover(@RequestParam("filename") String filename) {
    // for some reason, during development, this value ALWAYS had a trailing
    // space...
    filename = filename.trim();

    this.logger.info("Getting cover image for archive: filename={}", filename);

    byte[] result = null;

    try {
      result = this.fileService.getImportFileCover(filename);
    } catch (ComicFileHandlerException | ArchiveAdaptorException error) {
      this.logger.error("Failed to load cover from import file", error);
    }

    if (result == null) {
      try {
        result = IOUtils.toByteArray(this.getClass().getResourceAsStream("/images/missing.png"));
      } catch (IOException error) {
        this.logger.error("Failed to load the missing page image", error);
      }
    }

    return result;
  }

  @RequestMapping(value = "/import/status", method = RequestMethod.GET)
  public int getImportStatus() throws InterruptedException {
    this.logger.info("Getting import status");

    final int result = this.fileService.getImportStatus();

    this.logger.debug("Returning {}", result);

    return result;
  }

  @PostMapping(
      value = "/import",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Secured("ROLE_ADMIN")
  public ImportComicFilesResponse importComicFiles(@RequestBody() ImportRequestBody request)
      throws UnsupportedEncodingException {
    this.logger.info(
        "Importing {} comic files: delete blocked pages={} ignore metadata={}",
        request.getFilenames().length,
        request.isDeleteBlockedPages(),
        request.isIgnoreMetadata());

    this.fileService.importComicFiles(
        request.getFilenames(), request.isDeleteBlockedPages(), request.isIgnoreMetadata());

    this.logger.debug("Notifying waiting processes");
    ComicController.stopWaitingForStatus();

    final ImportComicFilesResponse response = new ImportComicFilesResponse();

    response.setImportComicCount(request.getFilenames().length);

    return response;
  }
}
