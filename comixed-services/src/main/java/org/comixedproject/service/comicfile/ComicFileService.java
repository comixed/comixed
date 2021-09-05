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

package org.comixedproject.service.comicfile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comicfile.ComicFile;
import org.comixedproject.model.comicfile.ComicFileDescriptor;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.comicfile.ComicFileDescriptorRepository;
import org.comixedproject.utils.ComicFileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicFileService</code> provides business rules when working with comic file-related
 * objects.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicFileService {
  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private ComicRepository comicRepository;
  @Autowired private ComicFileDescriptorRepository comicFileDescriptorRepository;
  @Autowired private ComicFileUtils comicFileUtils;

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

  public List<ComicFile> getAllComicsUnder(final String rootDirectory, final Integer maximum)
      throws IOException {
    log.debug("Getting comics below root: {}", rootDirectory);

    final File rootFile = new File(rootDirectory);
    final List<ComicFile> result = new ArrayList<>();

    if (rootFile.exists()) {
      if (rootFile.isDirectory()) {
        this.loadFilesUnder(result, rootFile, maximum);
      } else {
        log.debug("Cannot process a file");
      }
    } else {
      log.debug("Directory not found");
    }

    return result;
  }

  private void loadFilesUnder(
      final List<ComicFile> files, final File directory, final Integer maximum) throws IOException {
    log.debug("Loading files in directory: {}", directory);
    if (directory.listFiles() != null) {
      for (File file : directory.listFiles()) {
        if (maximum > 0 && files.size() == maximum) {
          log.debug("Loading maximum comics: {}", maximum);
          return;
        }
        if (file.isDirectory()) {
          this.loadFilesUnder(files, file, maximum);
        } else {
          if (canBeImported(file)) {
            final String filePath = file.getCanonicalPath();
            final long fileSize = file.length();

            log.debug("Adding file: {} ({} bytes)", file.getAbsolutePath(), file.length());

            files.add(new ComicFile(filePath, fileSize));
          }
        }
      }
    }
  }

  private boolean canBeImported(final File file) throws IOException {
    boolean isComic = this.comicFileUtils.isComicFile(file);

    final String filePath = file.getCanonicalPath();
    final Comic comic = this.comicRepository.findByFilename(filePath);

    return isComic && (comic == null);
  }

  /**
   * Creates records to initiate import comic files.
   *
   * @param filenames the comic filenames
   */
  @Transactional
  public void importComicFiles(final List<String> filenames) {
    for (int index = 0; index < filenames.size(); index++) {
      final String filename = filenames.get(index);
      log.trace("Saving file descriptor: {}", filename);
      this.comicFileDescriptorRepository.save(new ComicFileDescriptor(filename));
    }
  }

  /**
   * Returns all comic file descriptor records.
   *
   * @return the descriptors
   */
  public List<ComicFileDescriptor> findComicFileDescriptors() {
    log.trace("Loading all comic file descriptors");
    return this.comicFileDescriptorRepository.findAll();
  }

  /**
   * Deletes the descriptor for the specified filename.
   *
   * @param descriptor the descriptor
   */
  public void deleteComicFileDescriptor(final ComicFileDescriptor descriptor) {
    log.trace("Deleting comic file descriptor: {}", descriptor);
    this.comicFileDescriptorRepository.delete(descriptor);
  }
}
