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

package org.comixedproject.controller.file;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.IOUtils;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.controller.comic.ComicController;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.file.FileDetails;
import org.comixedproject.net.GetAllComicsUnderRequest;
import org.comixedproject.net.ImportComicFilesRequest;
import org.comixedproject.net.ImportComicFilesResponse;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.file.FileService;
import org.comixedproject.task.model.QueueComicsWorkerTask;
import org.comixedproject.task.runner.TaskManager;
import org.comixedproject.utils.ComicFileUtils;
import org.json.JSONException;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>FileController</code> allows the remote agent to query directories and import files, to
 * download files and work with the file system.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/api/files")
@Log4j2
public class FileController {
  @Autowired private ComicService comicService;
  @Autowired private FileService fileService;
  @Autowired private TaskManager taskManager;
  @Autowired private ObjectFactory<QueueComicsWorkerTask> queueComicsWorkerTaskObjectFactory;

  private int requestId = 0;

  @PostMapping(
      value = "/contents",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Secured("ROLE_ADMIN")
  public List<FileDetails> getAllComicsUnder(@RequestBody() final GetAllComicsUnderRequest request)
      throws IOException, JSONException {
    String directory = request.getDirectory();
    Integer maximum = request.getMaximum();

    log.info(
        "Getting all comic files: root={} maximum={}",
        directory,
        maximum > 0 ? maximum : "UNLIMITED");

    final List<FileDetails> result = this.fileService.getAllComicsUnder(directory, maximum);

    log.info("Returning {} file{}", result.size(), result.size() != 1 ? "s" : "");

    return result;
  }

  private void getAllFilesUnder(File root, List<FileDetails> result) throws IOException {
    for (File file : root.listFiles()) {
      if (file.isDirectory()) {
        log.debug("Searching directory: " + file.getAbsolutePath());
        this.getAllFilesUnder(file, result);
      } else {

        if (ComicFileUtils.isComicFile(file)
            && (this.comicService.findByFilename(file.getCanonicalPath()) == null)) {
          log.debug("Adding file: " + file.getCanonicalPath());
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

    log.info("Getting cover image for archive: filename={}", filename);

    byte[] result = null;

    try {
      result = this.fileService.getImportFileCover(filename);
    } catch (ComicFileHandlerException | ArchiveAdaptorException error) {
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

  @RequestMapping(value = "/import/status", method = RequestMethod.GET)
  public int getImportStatus() throws InterruptedException {
    log.info("Getting import status");

    final int result = this.fileService.getImportStatus();

    log.debug("Returning {}", result);

    return result;
  }

  /**
   * Begins the process of enqueueing comic files for import
   *
   * @param request the request body
   * @return the response body
   * @throws UnsupportedEncodingException if an error occurs
   */
  @PostMapping(
      value = "/import",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public ImportComicFilesResponse importComicFiles(@RequestBody() ImportComicFilesRequest request)
      throws UnsupportedEncodingException {
    final List<String> filenames = request.getFilenames();
    final boolean deleteBlockedPages = request.isDeleteBlockedPages();
    final boolean ignoreMetadata = request.isIgnoreMetadata();

    log.info(
        "Importing {} comic files: delete blocked pages={} ignore metadata={}",
        filenames.size(),
        deleteBlockedPages,
        ignoreMetadata);

    final QueueComicsWorkerTask task = this.queueComicsWorkerTaskObjectFactory.getObject();
    task.setFilenames(filenames);
    task.setDeleteBlockedPages(deleteBlockedPages);
    task.setIgnoreMetadata(ignoreMetadata);

    log.debug("Enqueueing task");
    this.taskManager.runTask(task);

    log.debug("Notifying waiting processes");
    ComicController.stopWaitingForStatus();

    return new ImportComicFilesResponse(filenames.size());
  }
}
