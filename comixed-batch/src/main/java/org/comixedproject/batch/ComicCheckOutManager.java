/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.batch;

import static org.comixedproject.service.admin.ConfigurationService.CFG_EXCLUSIVE_COMIC_LOCK;

import java.util.Set;
import java.util.concurrent.ConcurrentSkipListSet;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.admin.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicCheckOutManager</code> provides a way to mark comic books as being in use by a batch
 * process.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicCheckOutManager {
  private static final Object MUTEX = new Object();

  @Autowired private ConfigurationService configurationService;

  Set<Long> catalog = new ConcurrentSkipListSet<>();

  public void checkOut(final Long comicBookId) {
    if (this.configurationService.isFeatureEnabled(CFG_EXCLUSIVE_COMIC_LOCK)) {
      synchronized (MUTEX) {
        boolean done = false;
        while (!done) {
          if (this.catalog.contains(comicBookId)) {
            log.info("Waiting for comic to be checked in: id={}", comicBookId);
            try {
              MUTEX.wait(1000L);
            } catch (InterruptedException error) {
              throw new RuntimeException("Interrupted waiting for comic checkin", error);
            }
          } else {
            log.info("Checking out comic book: id={}", comicBookId);
            this.catalog.add(comicBookId);
            done = true;
            MUTEX.notifyAll();
          }
        }
      }
    }
  }

  public void checkIn(final long comicBookId) {
    synchronized (MUTEX) {
      log.info("Checking in comic: id={}", comicBookId);
      this.catalog.remove(comicBookId);
      MUTEX.notifyAll();
    }
  }
}
