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

package org.comixedproject.service.comic;

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.library.LastReadDatesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>LastReadService</code> provides rules for marking instances of {@link Comic} as read by
 * {@link ComiXedUser}s.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class LastReadService {
  @Autowired LastReadDatesRepository lastReadDatesRepository;

  /**
   * Returns the last read date for the given comic by the given user.
   *
   * @param comic the comic
   * @param user the user
   * @return the last read date
   */
  public Date getLastReadForComicAndUser(final Comic comic, final ComiXedUser user) {
    log.debug("Loading last read date: id={} user={}", comic.getId(), user.getEmail());
    final LastReadDate result = this.lastReadDatesRepository.getForComicAndUser(comic, user);
    if (result == null) {
      log.debug("Comic has not been read by this user");
      return null;
    }
    log.debug("Comic last read: {}", result.getLastRead());
    return result.getLastRead();
  }

  /**
   * Creates a record to mark a comic as read by the given user.
   *
   * @param comic the comic
   * @param user the user
   * @return the last read date
   */
  @Transactional
  public LastReadDate markComicAsRead(final Comic comic, final ComiXedUser user) {
    log.debug("Marking comic as read by user: id={} user={}", comic.getId(), user.getEmail());
    LastReadDate record = this.lastReadDatesRepository.getForComicAndUser(comic, user);
    if (record == null) {
      log.trace("No existing last read date; creating new last record");
      record = new LastReadDate(comic, user);
    }
    record.setLastRead(new Date());
    log.trace("Saving record");
    return this.lastReadDatesRepository.save(record);
  }

  /**
   * Deletes any existing record to mark a comic as unread by the given user.
   *
   * @param comic the comic
   * @param user the user
   */
  @Transactional
  public void markComicAsUnread(final Comic comic, final ComiXedUser user) {
    log.debug("Marking comic as unread by user: id={} user={}", comic.getId(), user.getEmail());
    final LastReadDate record = this.lastReadDatesRepository.getForComicAndUser(comic, user);
    if (record == null) {
      log.trace("No existing last read date");
      return;
    }
    log.trace("Deleting last read record");
    this.lastReadDatesRepository.delete(record);
  }
}
