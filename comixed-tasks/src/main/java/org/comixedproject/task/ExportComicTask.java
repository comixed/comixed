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

package org.comixedproject.task;

import java.io.IOException;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
@Log4j2
public class ExportComicTask extends AbstractTask {
  @Autowired private ComicService comicService;
  @Autowired private ComicFileHandler comicFileHandler;

  @Getter @Setter private Comic comic;
  @Getter @Setter private ArchiveAdaptor archiveAdaptor;
  @Getter @Setter private boolean renamePages = false;

  @Override
  public void startTask() throws TaskException {
    log.debug("Loading comic to be converted: " + this.comic.getFilename());
    try {
      this.comicFileHandler.loadComic(this.comic);
    } catch (ComicFileHandlerException error) {
      throw new TaskException("unable to load comic file: " + this.comic.getFilename(), error);
    }
    log.debug("Converting comic");

    try {
      Comic result = this.archiveAdaptor.saveComic(this.comic, this.renamePages);
      this.comicService.save(result);
    } catch (ArchiveAdaptorException | IOException error) {
      throw new TaskException("Unable to convert comic", error);
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
