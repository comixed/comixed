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

package org.comixedproject.batch.initiators;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.service.batch.ComicBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteCompletedComicBatchesInitiator</code> periodically monitors for and deletes completed
 * instances of {@link ComicBatch}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class DeleteCompletedComicBatchesInitiator {
  @Autowired private ComicBatchService comicBatchService;

  @Scheduled(fixedDelay = 10L * 60L * 1000L)
  public void execute() {
    log.debug("Checking for completed comic batches");
    final List<ComicBatch> batchList = this.comicBatchService.loadCompletedBatches();
    if (batchList.isEmpty()) {
      log.debug("No completed comic batches found");
      return;
    }
    log.debug("Deleting completed batches");
    batchList.forEach(
        batch -> {
          log.trace("Deleting comic batch: {}", batch.getName());
          this.comicBatchService.deleteBatch(batch);
        });
  }
}
