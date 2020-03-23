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

package org.comixed.task.model;

import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.library.Comic;
import org.comixed.repositories.library.ComicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
@Log4j2
public class ExportComicWorkerTask extends AbstractWorkerTask {
  @Autowired private ComicRepository comicRepository;
  @Autowired private ComicFileHandler comicFileHandler;

  private Comic comic;
  private ArchiveAdaptor archiveAdaptor;
  private boolean renamePages = false;

  public void setArchiveAdaptor(ArchiveAdaptor archiveAdaptor) {
    this.archiveAdaptor = archiveAdaptor;
  }

  public void setComic(Comic comic) {
    this.comic = comic;
  }

  /**
   * If set to true then pages are renamed as the comic is exported.
   *
   * @param renamePages the flag
   */
  public void setRenamePages(boolean renamePages) {
    this.log.debug("Setting renamePages={}", renamePages);
    this.renamePages = renamePages;
  }

  @Override
  public void startTask() throws WorkerTaskException {
    this.log.debug("Loading comic to be converted: " + this.comic.getFilename());
    try {
      this.comicFileHandler.loadComic(this.comic);
    } catch (ComicFileHandlerException error) {
      throw new WorkerTaskException(
          "unable to load comic file: " + this.comic.getFilename(), error);
    }
    this.log.debug("Converting comic");

    try {
      Comic result = this.archiveAdaptor.saveComic(this.comic, this.renamePages);
      this.comicRepository.save(result);
    } catch (ArchiveAdaptorException | IOException error) {
      throw new WorkerTaskException("Unable to convert comic", error);
    }
  }

  @Override
  protected String createDescription() {
    final StringBuilder result = new StringBuilder();

    result
        .append("Exporting comic:")
        .append(" comic=")
        .append(this.comic.getFilename())
        .append(" rename pages=")
        .append(this.renamePages ? "Yes" : "No");

    return result.toString();
  }
}
