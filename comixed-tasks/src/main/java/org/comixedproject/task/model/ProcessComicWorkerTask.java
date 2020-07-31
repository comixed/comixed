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

package org.comixedproject.task.model;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Date;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFileDetails;
import org.comixedproject.model.comic.ComicFileEntry;
import org.comixedproject.model.comic.Page;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>ProcessComicWorkerTask</code> handles loading the details of a comic into the library
 * during import.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ProcessComicWorkerTask extends AbstractWorkerTask {
  private static final Object semaphore = new Object();

  @Autowired private ComicService comicService;
  @Autowired private Utils utils;
  @Autowired private ComicFileHandler comicFileHandler;

  private Comic comic;
  private Boolean deleteBlockedPages;
  private Boolean ignoreMetadata;

  @Override
  protected String createDescription() {
    return "Process entry task: filename=" + this.comic.getFilename();
  }

  @Override
  public void startTask() throws WorkerTaskException {
    logger.debug("Processing comic: id={}", comic.getId());

    logger.debug("Clearing out comic file entries");
    while (!comic.getFileEntries().isEmpty()) {
      final ComicFileEntry entry = comic.getFileEntries().get(0);
      entry.setComic(null);
      comic.getFileEntries().remove(0);
    }
    logger.debug("Clearing out comic pages");
    while (!comic.getPages().isEmpty()) {
      final Page page = comic.getPages().get(0);
      page.setComic(null);
      comic.getPages().remove(0);
    }

    logger.debug("Getting archive adaptor");
    final ArchiveAdaptor adaptor =
        this.comicFileHandler.getArchiveAdaptorFor(this.comic.getArchiveType());
    if (adaptor == null) throw new WorkerTaskException("No archive adaptor found");
    logger.debug("Loading comic");
    try {
      adaptor.loadComic(comic);
    } catch (ArchiveAdaptorException error) {
      throw new WorkerTaskException("failed to load comic: " + comic.getFilename(), error);
    }

    logger.debug("Sorting pages");
    comic.sortPages();
    logger.debug("Setting comic file details");
    ComicFileDetails fileDetails = comic.getFileDetails();
    if (fileDetails == null) {
      logger.debug("Creating new file details entry for comic");
      fileDetails = new ComicFileDetails();
    }

    try {
      fileDetails.setHash(this.utils.createHash(new FileInputStream(comic.getFilename())));
    } catch (IOException error) {
      throw new WorkerTaskException("failed to get hash for file: " + comic.getFilename(), error);
    }

    fileDetails.setComic(comic);
    comic.setFileDetails(fileDetails);

    logger.debug("Updating comic");
    comic.setDateLastUpdated(new Date());
    this.comicService.save(comic);
  }

  public void setComic(final Comic comic) {
    this.comic = comic;
  }

  public void setDeleteBlockedPages(final Boolean deleteBlockedPages) {
    this.deleteBlockedPages = deleteBlockedPages;
  }

  public void setIgnoreMetadata(final Boolean ignoreMetadata) {
    this.ignoreMetadata = ignoreMetadata;
  }
}
