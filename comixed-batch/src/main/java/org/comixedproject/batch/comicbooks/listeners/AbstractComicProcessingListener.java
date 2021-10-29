/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import static org.comixedproject.model.messaging.batch.ProcessComicStatus.*;

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishProcessComicsStatusAction;
import org.comixedproject.model.messaging.batch.ProcessComicStatus;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>AbstractComicProcessingListener</code> provides a foundation for building listeners that
 * listen to the batch processes that add comics to, or process comics for, the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public abstract class AbstractComicProcessingListener {
  @Autowired private PublishProcessComicsStatusAction publishProcessComicsStatusAction;

  protected void doPublishState(final ExecutionContext context) {
    log.trace("Building add comics to library state");
    final ProcessComicStatus state = new ProcessComicStatus();
    state.setActive(context.containsKey(JOB_STARTED) && !context.containsKey(JOB_FINISHED));
    state.setStarted(new Date(context.getLong(JOB_STARTED)));
    state.setStepName(context.getString(STEP_NAME));
    state.setTotal(context.getLong(TOTAL_COMICS));
    state.setProcessed(context.getLong(PROCESSED_COMICS));
    log.trace("Publishing add comics to library state");
    try {
      this.publishProcessComicsStatusAction.publish(state);
    } catch (PublishingException error) {
      log.error("Failed to publish add comics to library state", error);
    }
  }
}
