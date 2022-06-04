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

package org.comixedproject.service.comicfiles;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicfiles.ComicFile;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.model.comicfiles.ComicFileGroup;
import org.comixedproject.repositories.comicfiles.ComicFileDescriptorRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicFileDescriptorRepository comicFileDescriptorRepository;
  @Autowired private ComicFileAdaptor comicFileAdaptor;

  public byte[] getImportFileCover(final String comicArchive) throws AdaptorException {
    log.debug("Getting first image from archive: {}", comicArchive);
    return this.comicBookAdaptor.loadCover(comicArchive);
  }

  /**
   * Retrieves up to a maximum number of comic files below a given root directory, groups by
   * absolute directory. Returns only files that have a comic extension and which do not already
   * appear in the database.
   *
   * @param rootDirectory the root directory
   * @param maximum the maximum number of files
   * @return the comic files
   * @throws IOException if an error occurs
   */
  public List<ComicFileGroup> getAllComicsUnder(final String rootDirectory, final int maximum)
      throws IOException {
    log.debug("Getting {} comics below root: {}", maximum == 0 ? "all" : maximum, rootDirectory);

    final File rootFile = new File(rootDirectory);
    final List<ComicFileGroup> result = new ArrayList<>();

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
      final List<ComicFileGroup> entries, final File directory, final int maximum)
      throws IOException {
    log.trace("Loading files in directory: {}", directory);
    if (directory.listFiles() != null) {
      for (File file : directory.listFiles()) {
        if (!entries.isEmpty()) {
          final int total =
              entries.stream()
                  .map(comicFileGroup -> comicFileGroup.getFiles().size())
                  .reduce((runningTotal, entry) -> runningTotal += entry)
                  .get();
          if (maximum > 0 && total == maximum) {
            log.trace("Finished loading comics");
            return;
          }
        }
        if (file.isDirectory()) {
          this.loadFilesUnder(entries, file, maximum);
        } else {
          if (canBeImported(file)) {
            final String filePath = file.getCanonicalPath();
            final long fileSize = file.length();

            final String parentPath = FilenameUtils.getPath(filePath);
            final Optional<ComicFileGroup> entry =
                entries.stream()
                    .filter(comicFileGroup -> comicFileGroup.getDirectory().equals(parentPath))
                    .findFirst();
            ComicFileGroup group = null;
            if (entry.isPresent()) {
              group = entry.get();
            } else {
              log.trace("Creating new grouping");
              group = new ComicFileGroup(parentPath);
              entries.add(group);
            }
            log.trace("Adding comic file");
            group.getFiles().add(new ComicFile(filePath, fileSize));
          }
        }
      }
    }
  }

  private boolean canBeImported(final File file) throws IOException {
    boolean isComic = this.comicFileAdaptor.isComicFile(file);

    final String filePath = file.getCanonicalPath();
    log.trace("Checking if comicBook file is already in the database");
    final ComicBook comicBook = this.comicBookService.findByFilename(filePath);

    return isComic && (comicBook == null);
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
   * Returns the number of comic file descriptors.
   *
   * @return the count
   */
  public long getComicFileDescriptorCount() {
    log.trace("Getting comic file descriptor count");
    return this.comicFileDescriptorRepository.count();
  }

  /**
   * Returns all comic file descriptor records.
   *
   * @param pageSize the number of descriptors to return
   * @return the descriptors
   */
  public List<ComicFileDescriptor> findComicFileDescriptors(final int pageSize) {
    log.trace("Loading all comic file descriptors");
    return this.comicFileDescriptorRepository.findAll(PageRequest.of(0, pageSize)).stream()
        .collect(Collectors.toList());
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
