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

package org.comixedproject.service.user;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ReadComicBooksService</code> provides methods for marking comics as read or unread.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ReadComicBooksService {
  @Autowired public UserService userService;

  @Transactional
  @Async
  public void markComicBookAsRead(final String email, final long comicId)
      throws ReadComicBooksException {
    try {
      log.debug("Loading user: {}", email);
      final ComiXedUser user = this.userService.findByEmail(email);
      log.debug("Adding comic book to read list: id={}", comicId);
      user.getReadComicBooks().add(comicId);
      log.debug("Saving user");
      this.userService.save(user);
    } catch (ComiXedUserException error) {
      throw new ReadComicBooksException("Failed to mark comic book as read", error);
    }
  }

  @Transactional
  @Async
  public void unmarkComicBookAsRead(final String email, final long comicId)
      throws ReadComicBooksException {
    try {
      log.debug("Loading user: {}", email);
      final ComiXedUser user = this.userService.findByEmail(email);
      log.debug("Removing comic book from read list: id={}", comicId);
      user.getReadComicBooks().remove(comicId);
      log.debug("Saving user");
      this.userService.save(user);
    } catch (ComiXedUserException error) {
      throw new ReadComicBooksException("Failed to mark comic book as read", error);
    }
  }

  @Transactional
  @Async
  public void markSelectionsAsRead(final String email, final List<Long> idList)
      throws ReadComicBooksException {
    try {
      log.debug("Loading user: {}", email);
      final ComiXedUser user = this.userService.findByEmail(email);
      log.debug("Adding {} comic book(s) to read list", idList.size());
      user.getReadComicBooks().addAll(idList);
      log.debug("Saving user");
      this.userService.save(user);
    } catch (ComiXedUserException error) {
      throw new ReadComicBooksException("Failed to mark comic book as read", error);
    }
  }

  @Transactional
  @Async
  public void unmarkSelectionsAsRead(final String email, final List<Long> idList)
      throws ReadComicBooksException {
    try {
      log.debug("Loading user: {}", email);
      final ComiXedUser user = this.userService.findByEmail(email);
      log.debug("Removing {} comic book(s) from read list", idList.size());
      user.getReadComicBooks().removeAll(idList);
      log.debug("Saving user");
      this.userService.save(user);
    } catch (ComiXedUserException error) {
      throw new ReadComicBooksException("Failed to mark comic book as read", error);
    }
  }
}
