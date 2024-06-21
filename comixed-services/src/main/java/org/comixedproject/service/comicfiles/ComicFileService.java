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
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicfiles.ComicFile;
import org.comixedproject.model.comicfiles.ComicFileGroup;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
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
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ComicFileAdaptor comicFileAdaptor;
  @Autowired private FilenameScrapingRuleService filenameScrapingRuleService;

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
    log.debug("Loading files in directory: {}", directory);
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
              log.debug("Creating new grouping");
              group = new ComicFileGroup(parentPath);
              entries.add(group);
            }
            log.debug("Adding comic file");
            group.getFiles().add(new ComicFile(filePath, fileSize));
          }
        }
      }
    }
  }

  private boolean canBeImported(final File file) throws IOException {
    if (!this.comicFileAdaptor.isComicFile(file)) {
      log.debug("Not a comic file: }", file.getAbsolutePath());
      return false;
    }

    final String filename = file.getCanonicalPath().replace("\\", "/");
    log.debug("Checking if comicBook file is already in the database");
    return this.comicBookService.filenameFound(filename) == false;
  }

  /**
   * Creates records to initiate import comic files.
   *
   * @param filenames the comic filenames
   */
  @Async
  @Transactional
  public void importComicFiles(final List<String> filenames) {
    for (int index = 0; index < filenames.size(); index++) {
      final String filename = filenames.get(index);
      if (this.comicBookService.filenameFound(filename) == false) {
        try {
          log.debug("Creating comicBook: filename={}", filename);
          final ComicBook comicBook = this.comicBookAdaptor.createComic(filename);
          log.trace("Scraping comicBook filename");
          final FilenameMetadata metadata =
              this.filenameScrapingRuleService.loadFilenameMetadata(
                  comicBook.getComicDetail().getBaseFilename());
          if (metadata.isFound()) {
            log.trace("Scraping rule applied");
            comicBook.getComicDetail().setSeries(metadata.getSeries());
            comicBook.getComicDetail().setVolume(metadata.getVolume());
            comicBook.getComicDetail().setIssueNumber(metadata.getIssueNumber());
            comicBook.getComicDetail().setCoverDate(metadata.getCoverDate());
          }
          log.debug("Firing new comic book event: {}", filename);
          this.comicStateHandler.fireEvent(comicBook, ComicEvent.readygForProcessing);
        } catch (AdaptorException error) {
          log.error("Failed to create comic for file: " + filename, error);
        }
      }
    }
  }
}
