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

package org.comixed.service.file;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.comic.Comic;
import org.comixed.model.file.FileDetails;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.comic.ComicRepository;
import org.comixed.service.task.TaskService;
import org.comixed.task.model.QueueComicsWorkerTask;
import org.comixed.task.runner.Worker;
import org.comixed.utils.ComicFileUtils;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Log4j2
public class FileService {
  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private ComicRepository comicRepository;
  @Autowired private Worker worker;
  @Autowired private ObjectFactory<QueueComicsWorkerTask> taskFactory;
  @Autowired private TaskService taskService;

  private int requestId = 0;

  public byte[] getImportFileCover(final String comicArchive)
      throws ComicFileHandlerException, ArchiveAdaptorException {
    log.debug("Getting first image from archive: {}", comicArchive);

    byte[] result = null;
    final ArchiveAdaptor archiveAdaptor = this.comicFileHandler.getArchiveAdaptorFor(comicArchive);
    if (archiveAdaptor == null) {
      log.debug("No archive adaptor available");
      return null;
    }

    final String coverFile = archiveAdaptor.getFirstImageFileName(comicArchive);
    if (coverFile == null) {
      log.debug("Archive contains no images");
      return null;
    }

    log.debug("Fetching image content: entry={}", coverFile);
    result = archiveAdaptor.loadSingleFile(comicArchive, coverFile);

    log.debug("Returning {} bytes", result == null ? 0 : result.length);

    return result;
  }

  public List<FileDetails> getAllComicsUnder(final String rootDirectory) throws IOException {
    log.debug("Getting comics below root: {}", rootDirectory);

    final File rootFile = new File(rootDirectory);
    final List<FileDetails> result = new ArrayList<>();

    if (rootFile.exists()) {
      if (rootFile.isDirectory()) {
        this.loadFilesUnder(result, rootFile);
      } else {
        log.debug("Cannot process a file");
      }
    } else {
      log.debug("Directory not found");
    }

    return result;
  }

  private void loadFilesUnder(final List<FileDetails> files, final File directory)
      throws IOException {
    log.debug("Loading files in directory: {}", directory);
    if (directory.listFiles() != null) {
      for (File file : directory.listFiles()) {
        if (file.isDirectory()) {
          this.loadFilesUnder(files, file);
        } else {
          if (ComicFileUtils.isComicFile(file)) {
            final String filePath = file.getCanonicalPath();
            final long fileSize = file.length();

            final Comic comic = this.comicRepository.findByFilename(filePath);

            if (comic != null) {
              log.debug("File already in the library: id={}", comic.getId());
            } else {
              log.debug("Adding file: {} ({} bytes)", filePath, fileSize);

              files.add(new FileDetails(filePath, fileSize));
            }
          }
        }
      }
    }
  }

  public int getImportStatus() throws InterruptedException {
    return this.taskService.getTaskCount(TaskType.ADD_COMIC)
        + this.taskService.getTaskCount(TaskType.PROCESS_COMIC);
  }

  public int importComicFiles(
      final String[] filenames, final boolean deleteBlockedPages, final boolean ignoreMetadata)
      throws UnsupportedEncodingException {
    log.debug(
        "Preparing to import {} comic files: delete blocked pages={} ignore metadata={}",
        filenames.length,
        deleteBlockedPages ? "Yes" : "No",
        ignoreMetadata ? "Yes" : "No");

    QueueComicsWorkerTask task = this.taskFactory.getObject();

    task.setFilenames(Arrays.asList(filenames));
    task.setDeleteBlockedPages(deleteBlockedPages);
    task.setIgnoreMetadata(ignoreMetadata);

    log.debug("Adding import task to queue");
    this.worker.addTasksToQueue(task);

    return filenames.length;
  }
}
