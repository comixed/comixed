/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.listeners;

import static org.comixedproject.model.messaging.batch.AddComicBooksStatus.*;

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishAddComicBooksStatusAction;
import org.comixedproject.model.messaging.batch.AddComicBooksStatus;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>AbstractAddComicBooksExecutionListener</code> provides a foundation for building listeners
 * to report the status while adding comics to the library.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class AbstractAddComicBooksExecutionListener {
  @Autowired ComicFileService comicFileService;
  @Autowired private PublishAddComicBooksStatusAction publishAddComicBooksStatusAction;

  protected void doPublishStatus(final ExecutionContext context) {
    final AddComicBooksStatus status = new AddComicBooksStatus();
    status.setActive(
        context.containsKey(ADD_COMIC_BOOKS_JOB_STARTED)
            && !context.containsKey(ADD_COMIC_BOOKS_JOB_FINISHED));
    status.setStarted(new Date(context.getLong(ADD_COMIC_BOOKS_JOB_STARTED)));
    status.setTotal(context.getLong(ADD_COMIC_BOOKS_TOTAL_COMICS));
    status.setProcessed(context.getLong(ADD_COMIC_BOOKS_PROCESSED_COMICS));
    try {
      this.publishAddComicBooksStatusAction.publish(status);
    } catch (PublishingException error) {
      log.error("Failed to publish add comic books status", error);
    }
  }
}
