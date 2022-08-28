/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.metadata.listeners;

import static org.comixedproject.batch.metadata.MetadataProcessConfiguration.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.metadata.PublishMetadataUpdateProcessStateUpdateAction;
import org.comixedproject.model.net.metadata.MetadataUpdateProcessUpdate;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>AbstractMetadataUpdateProcessingListener</code> provides a foundation for building
 * listeners that publish the process state.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractMetadataUpdateProcessingListener {
  @Autowired protected ComicBookService comicBookService;

  @Autowired
  protected PublishMetadataUpdateProcessStateUpdateAction
      publishMetadataUpdateProcessStateUpdateAction;

  protected void doPublishState(final ExecutionContext executionContext) {
    log.trace("Getting active state");
    final boolean active =
        executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)
            && !executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED);
    long totalComics = 0L;
    long completedComics = 0L;
    if (active) {
      log.trace("Getting total comics");
      totalComics = executionContext.getLong(PARAM_METADATA_UPDATE_TOTAL_COMICS);
      log.trace("Getting completed comics");
      completedComics = totalComics - this.comicBookService.findComicsForBatchMetadataUpdateCount();
    }
    try {
      log.trace("Publishing metadata update process event");
      this.publishMetadataUpdateProcessStateUpdateAction.publish(
          new MetadataUpdateProcessUpdate(active, totalComics, completedComics));
    } catch (PublishingException error) {
      log.error("Failed to publish metadata update process event", error);
    }
  }
}
