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
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFileDetails;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ProcessComicTask extends AbstractWorkerTask {
  private static final Object semaphore = new Object();

  @Autowired private ComicRepository comicRepository;
  @Autowired private Utils utils;

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

    logger.debug("Getting archive adaptor");
    final ArchiveAdaptor adaptor = comic.getArchiveAdaptor();
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
    comic.setFileDetails(fileDetails);

    logger.debug("Updating comic");
    comic.setDateLastUpdated(new Date());
    this.comicRepository.save(comic);
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
