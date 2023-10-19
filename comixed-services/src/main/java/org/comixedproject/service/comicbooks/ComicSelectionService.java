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

package org.comixedproject.service.comicbooks;

import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicSelection;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComicSelectionRepository;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicSelectionService</code> provides business functions for managing a user's selection of
 * comics.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicSelectionService {
  @Autowired private ComicDetailService comicDetailService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private UserService userService;
  @Autowired private ComicSelectionRepository comicSelectionRepository;
  @Autowired private ObjectFactory<ComicDetailExampleBuilder> exampleBuilderObjectFactory;
  @Autowired private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;

  /**
   * Updates the list of selected comics based on the incoming request. If the request is adding,
   * then the set is updated. Otherwise, any matches found are removed. The updated set of ids is
   * returned.
   *
   * @param email the user's email address
   * @param comicBookId the incoming comic book id
   * @throws ComicSelectionException if an error occurs
   */
  @Transactional
  public void addComicSelectionForUser(final String email, final Long comicBookId)
      throws ComicSelectionException {
    try {
      final ComiXedUser user = this.userService.findByEmail(email);
      final ComicBook comicBook = this.comicBookService.getComic(comicBookId);
      final ComicSelection selection =
          this.comicSelectionRepository.getForUserAndComic(user, comicBook);
      if (selection == null) {
        log.debug("Creating new comic selection: user={} comic book id={}", email, comicBookId);
        this.comicSelectionRepository.save(new ComicSelection(user, comicBook));
        this.comicSelectionRepository.flush();
        this.doPublishSelectionUpdateForUser(user);
      }
    } catch (ComiXedUserException | ComicBookException error) {
      throw new ComicSelectionException("Failed to add comic selection", error);
    }
  }

  /**
   * Removes a comic selection from the specified user if it exists.
   *
   * @param email the user's email address
   * @param comicBookId the incoming comic book id
   * @throws ComicSelectionException if an eror occurs
   */
  @Transactional
  public void removeComicSelectionFromUser(final String email, final Long comicBookId)
      throws ComicSelectionException {
    try {
      final ComiXedUser user = this.userService.findByEmail(email);
      final ComicBook comicBook = this.comicBookService.getComic(comicBookId);
      final ComicSelection selection =
          this.comicSelectionRepository.getForUserAndComic(user, comicBook);
      if (selection != null) {
        log.debug("Removing comic selection: user={} comic book id={}", email, comicBookId);
        this.comicSelectionRepository.delete(selection);
        this.comicSelectionRepository.flush();
        this.doPublishSelectionUpdateForUser(user);
      }
    } catch (ComiXedUserException | ComicBookException error) {
      throw new ComicSelectionException("failed to add comic selection", error);
    }
  }

  /**
   * Marks comics as selected based on filters.
   *
   * @param email the user's email
   * @param coverYear the optional cover year
   * @param coverMonth the optional cover month
   * @param archiveType the optional archive type
   * @param comicType the optional cover type
   * @param comicState the optional comic state
   * @param unreadState the optional unread state
   * @param unscrapedState the optional unscraped state
   * @param searchText the optional search text
   * @param adding adding or removing flag
   */
  @Transactional
  public void selectMultipleComicBooks(
      final String email,
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unreadState,
      final Boolean unscrapedState,
      final String searchText,
      final boolean adding) {
    final ComicDetailExampleBuilder builder = this.exampleBuilderObjectFactory.getObject();
    builder.setCoverYear(coverYear);
    builder.setCoverMonth(coverMonth);
    builder.setArchiveType(archiveType);
    builder.setComicType(comicType);
    builder.setComicState(comicState);
    builder.setUnreadState(unreadState);
    builder.setUnscrapedState(unscrapedState);
    builder.setSearchText(searchText);

    final Example<ComicDetail> example = builder.build();
    this.comicDetailService.findAllByExample(example).stream()
        .map(ComicDetail::getComicId)
        .forEach(
            comicBookId -> {
              try {
                if (adding) {
                  this.addComicSelectionForUser(email, comicBookId);
                } else {
                  this.removeComicSelectionFromUser(email, comicBookId);
                }
              } catch (ComicSelectionException error) {
                log.error("failed to add comic selection", error);
              }
            });
  }

  /** Returns a cleared out collection of ids. It also publishes an update to the client. */
  public void clearSelectedComicBooks(final String email) {
    try {
      log.debug("Loading user: {}", email);
      final ComiXedUser user = this.userService.findByEmail(email);
      log.debug("Publishing cleared out selection update");
      this.comicSelectionRepository.deleteAllForUser(user);
      this.comicSelectionRepository.flush();
      this.doPublishSelectionUpdateForUser(user);
    } catch (ComiXedUserException error) {
      log.error("failed to published selected comic book update", error);
    }
  }

  public Set<Long> getAllForEmail(final String email) throws ComicSelectionException {
    final ComiXedUser user;
    try {
      user = this.userService.findByEmail(email);
      return this.comicSelectionRepository.getAllForUser(user);
    } catch (ComiXedUserException error) {
      throw new ComicSelectionException("failed to load selections for user", error);
    }
  }

  private void doPublishSelectionUpdateForUser(final ComiXedUser user) {
    try {
      this.publishComicBookSelectionStateAction.publish(
          this.comicSelectionRepository.getAllForUser(user));
    } catch (PublishingException error) {
      log.error("failed to publish selection update", error);
    }
  }
}
