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

package org.comixedproject.service.library;

import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishLastReadRemovedAction;
import org.comixedproject.messaging.library.PublishLastReadUpdateAction;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.LastReadRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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
  @Autowired private UserService userService;
  @Autowired private ComicService comicService;
  @Autowired private LastReadRepository lastReadRepository;
  @Autowired private PublishLastReadUpdateAction publishLastReadUpdateAction;
  @Autowired private PublishLastReadRemovedAction publishLastReadRemovedAction;

  /**
   * Gets a batch of last read dates for the given user. The records returned will come after the
   * specified threshold id, and will contain no more than the maximum specified entries.
   *
   * @param email the user's email address
   * @param threshold the id threshold
   * @param maximum the maximum records to return
   * @return the entries
   * @throws LastReadException if an error occurs
   */
  public List<LastRead> getLastReadEntries(
      final String email, final long threshold, final int maximum) throws LastReadException {
    log.debug("Loading user: {}", email);
    ComiXedUser user = this.doFindUser(email);
    log.debug("Loading {} last read entries for {} with id > {}", maximum, email, threshold);
    return this.lastReadRepository.getEntriesForUser(user, threshold, PageRequest.of(0, maximum));
  }

  private ComiXedUser doFindUser(final String email) throws LastReadException {
    try {
      return this.userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      throw new LastReadException("Failed to load last read entries for user", error);
    }
  }

  /**
   * Sets the last read state of a comic for a given user. If the comic is marked as read then an
   * entry is created, otherwise if marked as unread any existing entry is deleted.
   *
   * @param email the user's email
   * @param comicId the comic is
   * @param markRead the read state
   * @return the last read entry
   * @throws LastReadException if an error occurs
   */
  @Transactional
  public LastRead setLastReadState(final String email, final long comicId, final boolean markRead)
      throws LastReadException {
    log.debug("Marking comic as {} for {}: id={}", markRead ? "read" : "unread", email, comicId);
    final ComiXedUser user = this.doFindUser(email);
    final var comic = this.doGetComic(comicId);

    log.trace("Looking for existing last read entry");
    LastRead entry = this.lastReadRepository.findEntryForUserAndComic(user, comic);

    LastRead result;
    if (markRead) {
      if (entry == null) {
        log.trace("No such entry; creating new last read entry");
        entry = new LastRead(comic, user);
      }
      log.trace("Setting last read entry");
      entry.setLastRead(new Date());
      entry.setLastModifiedOn(new Date());
      result = this.lastReadRepository.save(entry);
    } else {
      if (entry == null) throw new LastReadException("No last read entry found");
      log.trace("Deleting entry: id={}", entry.getId());
      this.lastReadRepository.delete(entry);
      result = entry;
    }
    this.doPublishLastReadAction(result, markRead);
    return result;
  }

  private void doPublishLastReadAction(final LastRead lastRead, final boolean markRead) {
    try {
      if (markRead) {
        this.publishLastReadUpdateAction.publish(lastRead);
      } else {
        this.publishLastReadRemovedAction.publish(lastRead);
      }
    } catch (PublishingException error) {
      log.error("Failed to publish last read update", error);
    }
  }

  private Comic doGetComic(final long comicId) throws LastReadException {
    try {
      return this.comicService.getComic(comicId);
    } catch (ComicException error) {
      throw new LastReadException("Failed to load comic", error);
    }
  }
}
