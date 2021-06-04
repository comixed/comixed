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

package org.comixedproject.task;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comic.PublishComicUpdateAction;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFileDetails;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.blockedpage.BlockedPageService;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.state.comic.ComicEvent;
import org.comixedproject.state.comic.ComicStateHandler;
import org.comixedproject.utils.Utils;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>ProcessComicTask</code> handles loading the details of a comic into the library during
 * import.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ProcessComicTask extends AbstractTask {
  @Autowired private ComicService comicService;
  @Autowired private Utils utils;
  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private BlockedPageService blockedPageService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private PublishComicUpdateAction publishComicUpdateAction;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private Comic comic;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private boolean deleteBlockedPages;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private boolean ignoreMetadata;

  public ProcessComicTask() {
    super(PersistedTaskType.PROCESS_COMIC);
  }

  @Override
  protected String createDescription() {
    return "Process entry task: filename=" + this.comic.getFilename();
  }

  @Override
  public void startTask() throws TaskException {
    log.debug("Processing comic: id={}", comic.getId());
    log.debug("Getting archive adaptor");
    final ArchiveAdaptor adaptor =
        this.comicFileHandler.getArchiveAdaptorFor(this.comic.getArchiveType());
    if (adaptor == null) throw new TaskException("No archive adaptor found");
    log.debug("Loading comic");
    try {
      if (this.ignoreMetadata) {
        log.debug("Filling comic from disk");
        adaptor.fillComic(comic);
      } else {
        log.debug("Loading comic from disk");
        adaptor.loadComic(comic);
      }
    } catch (ArchiveAdaptorException error) {
      throw new TaskException("failed to load comic: " + comic.getFilename(), error);
    }

    if (this.deleteBlockedPages) {
      log.debug("Loading blocked page hashes");
      final List<String> blockedHashes = this.blockedPageService.getHashes();

      log.debug("Checking for blocked pages");
      for (Page page : comic.getPages()) {
        if (blockedHashes.contains(page.getHash())) {
          log.debug("Marking page as blocked: [{}:{}]", page.getFilename(), page.getHash());
          page.setDeleted(true);
        }
      }
    }

    log.debug("Sorting pages");
    comic.sortPages();
    log.debug("Setting comic file details");
    ComicFileDetails fileDetails = comic.getFileDetails();
    if (fileDetails == null) {
      log.debug("Creating new file details entry for comic");
      fileDetails = new ComicFileDetails();
    }

    try {
      fileDetails.setHash(this.utils.createHash(new FileInputStream(comic.getFilename())));
    } catch (IOException error) {
      throw new TaskException("failed to get hash for file: " + comic.getFilename(), error);
    }

    fileDetails.setComic(comic);
    comic.setFileDetails(fileDetails);

    log.debug("Updating comic");
    this.comicStateHandler.fireEvent(comic, ComicEvent.contentsProcessed);
    try {
      log.trace("Reloading updated comic");
      comic = this.comicService.getComic(comic.getId());
    } catch (ComicException error) {
      throw new TaskException("Failed to reload comic", error);
    }

    log.debug("Publishing comic update");
    try {
      this.publishComicUpdateAction.publish(comic);
    } catch (PublishingException error) {
      throw new TaskException("Failed to publish update", error);
    }
  }
}
