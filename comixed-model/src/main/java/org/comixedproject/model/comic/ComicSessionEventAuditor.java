/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.model.comic;

import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import javax.persistence.PostUpdate;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditing.AbstractSessionEventAuditor;
import org.comixedproject.model.session.SessionUpdateEventType;
import org.springframework.stereotype.Component;

/**
 * <code>ComicSessionEventAuditor</code> defines a component that relays notifications of
 * persistence events on instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicSessionEventAuditor extends AbstractSessionEventAuditor {
  @PostUpdate
  /**
   * Invoked when a comic is added or updated.
   *
   * @param comic the comic
   */
  @PostPersist
  public void updatedComic(Comic comic) {
    log.debug("Comic updated: id={}", comic.getId());
    this.fireNotifications(SessionUpdateEventType.COMIC_UPDATED, comic);
  }

  /**
   * Invoked when a comic has been deleted.
   *
   * @param comic the comic
   */
  @PostRemove
  public void deletedComic(Comic comic) {
    log.debug("Comic deleted: id={}", comic.getId());
    this.fireNotifications(SessionUpdateEventType.COMIC_DELETED, comic);
  }
}
