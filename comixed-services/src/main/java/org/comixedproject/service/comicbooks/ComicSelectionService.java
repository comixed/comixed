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
import lombok.NonNull;
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
    final ComiXedUser user = this.doLoadUser(email);
    final ComicBook comicBook = this.doLoadComicBook(comicBookId);
    if (!this.comicSelectionRepository.existsForUserAndComicBook(user, comicBook)) {
      this.doCreateSelectionRecord(user, comicBook);
      this.doPublishSelectionUpdateForUser(user);
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
    final ComiXedUser user = this.doLoadUser(email);
    final ComicBook comicBook = this.doLoadComicBook(comicBookId);
    if (this.comicSelectionRepository.existsForUserAndComicBook(user, comicBook)) {
      this.doRemoveComicSelectionRecord(user, comicBook);
      this.doPublishSelectionUpdateForUser(user);
    }
  }

  private void doRemoveComicSelectionRecord(final ComiXedUser user, final ComicBook comicBook) {
    log.debug(
        "Removing comic selection: user={} comic book id={}", user.getEmail(), comicBook.getId());
    this.comicSelectionRepository.deleteById(
        this.comicSelectionRepository.getIdForUserAndComic(user, comicBook));
    this.comicSelectionRepository.flush();
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
      final boolean adding)
      throws ComicSelectionException {
    final ComiXedUser user = this.doLoadUser(email);

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
        .forEach(
            comicDetail -> {
              @NonNull final ComicBook comicBook = comicDetail.getComicBook();
              if (adding) {
                if (!this.comicSelectionRepository.existsForUserAndComicBook(user, comicBook)) {
                  this.doCreateSelectionRecord(user, comicBook);
                }
              } else {
                if (this.comicSelectionRepository.existsForUserAndComicBook(user, comicBook)) {
                  this.doRemoveComicSelectionRecord(user, comicBook);
                }
              }
            });
    this.doPublishSelectionUpdateForUser(user);
  }

  /**
   * Returns a cleared out collection of ids. It also publishes an update to the client.
   *
   * @throws ComicSelectionException if an error occurs
   */
  public void clearSelectedComicBooks(final String email) throws ComicSelectionException {
    log.debug("Loading user: {}", email);
    final ComiXedUser user = this.doLoadUser(email);
    log.debug("Publishing cleared out selection update");
    this.comicSelectionRepository.deleteAllById(this.getAllForEmail(email));
    this.comicSelectionRepository.flush();
    this.doPublishSelectionUpdateForUser(user);
  }

  public Set<Long> getAllForEmail(final String email) throws ComicSelectionException {
    final ComiXedUser user = this.doLoadUser(email);
    return this.comicSelectionRepository.getAllForUser(user);
  }

  private ComiXedUser doLoadUser(final String email) throws ComicSelectionException {
    try {
      return this.userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      throw new ComicSelectionException("failed to load user", error);
    }
  }

  private ComicBook doLoadComicBook(final long comicBookId) throws ComicSelectionException {
    try {
      return this.comicBookService.getComic(comicBookId);
    } catch (ComicBookException error) {
      throw new ComicSelectionException("failed to load comic book", error);
    }
  }

  private void doCreateSelectionRecord(final ComiXedUser user, final ComicBook comicBook) {
    log.debug(
        "Creating new comic selection: user={} comic book id={}",
        user.getEmail(),
        comicBook.getId());
    this.comicSelectionRepository.save(new ComicSelection(user, comicBook));
    this.comicSelectionRepository.flush();
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
