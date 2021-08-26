/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.lists;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.SmartListMatcher;
import org.comixedproject.model.library.SmartReadingList;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.ReadingListRepository;
import org.comixedproject.repositories.library.SmartReadingListRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ReadingListService</code> handles the business logic for working with {@link ReadingList}
 * instances.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ReadingListService {
  @Autowired ReadingListRepository readingListRepository;
  @Autowired SmartReadingListRepository smartReadingListRepository;
  @Autowired UserService userService;
  @Autowired ComicService comicService;

  /**
   * Returns all reading lists for the user with the given email.
   *
   * @param email the user's email
   * @return the reading lists
   * @throws ReadingListException if the email is invalid
   */
  public List<ReadingList> getReadingListsForUser(final String email) throws ReadingListException {
    log.debug("Getting user: {}", email);
    final ComiXedUser owner = this.doLoadUser(email);
    log.trace("Getting reading lists for user");
    return this.readingListRepository.getAllReadingListsForOwner(owner);
  }

  /**
   * Creates a new reading list.
   *
   * @param email the owner's email
   * @param name the reading list name
   * @param summary the reading list summary
   * @return the reading list
   * @throws ReadingListException if the name is already used
   */
  @Transactional
  public ReadingList createReadingList(final String email, final String name, final String summary)
      throws ReadingListException {
    log.debug("Creating reading list: email={} name={}", email, name);
    log.trace("Getting owner");
    final ComiXedUser owner = this.doLoadUser(email);
    log.trace("Looking for existing reading list");
    if (this.readingListRepository.findReadingListForUser(owner, name) != null) {
      throw new ReadingListException("Name already used: " + name);
    }
    final ReadingList readingList = new ReadingList();
    readingList.setOwner(owner);
    readingList.setName(name);
    readingList.setSummary(summary);
    readingList.setLastModifiedOn(new Date());

    log.trace("Saving reading list");
    return this.readingListRepository.save(readingList);
  }

  /**
   * Updates an existing reading list.
   *
   * @param email the owner's email
   * @param id the reading list record id
   * @param name the reading list name
   * @param summary the reading list summary
   * @return the updated reading list
   * @throws ReadingListException if the record id is invalid
   */
  @Transactional
  public ReadingList updateReadingList(
      final String email, final long id, final String name, final String summary)
      throws ReadingListException {
    log.debug("Updating reading list: owner={} id={} name={}", email, id, name);
    log.trace("Loading user: email={}", email);
    final ComiXedUser owner = this.doLoadUser(email);
    log.trace("Loading reading list");
    final ReadingList readingList =
        this.readingListRepository.getReadingListForUserAndId(owner, id);
    if (readingList == null) {
      throw new ReadingListException("No such reading list");
    }

    log.trace("Updating reading list details");
    readingList.setName(name);
    readingList.setSummary(summary);
    readingList.setLastModifiedOn(new Date());

    log.trace("Updating reading list");
    return this.readingListRepository.save(readingList);
  }

  private ComiXedUser doLoadUser(final String email) throws ReadingListException {
    try {
      return this.userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      throw new ReadingListException("No such user:" + email, error);
    }
  }

  /**
   * Returns a single reading list for the given user
   *
   * @param email the user's email
   * @param id the reading list record i
   * @return the reading list
   * @throws ReadingListException if the reading list is invalid
   */
  public ReadingList getReadingListForUser(final String email, final long id)
      throws ReadingListException {
    log.debug("Getting reading list for user: email={} id={}", email, id);
    final ComiXedUser user = this.doLoadUser(email);
    log.trace("Loading reading list for email={} and id={}", email, id);
    final ReadingList readingList = this.readingListRepository.getReadingListForUserAndId(user, id);
    if (readingList == null) {
      throw new ReadingListException("No such reading list");
    }

    log.trace("Ensuring user is the owner");
    if (!readingList.getOwner().equals(user)) {
      throw new ReadingListException(
          "Non-owner cannot access reading list: "
              + user.getEmail()
              + " != "
              + readingList.getOwner().getEmail());
    }

    log.trace("Returning reading list");
    return readingList;
  }

  @Transactional
  public SmartReadingList createSmartReadingList(
      final String email,
      final String name,
      final String summary,
      final boolean not,
      final String mode,
      final List<SmartListMatcher> smartListMatchers)
      throws ReadingListException {
    log.debug("Creating smart reading list: email={} name={}", email, name);

    log.debug("Getting owner");
    final ComiXedUser owner = this.doLoadUser(email);
    SmartReadingList smartReadingList =
        this.smartReadingListRepository.findSmartReadingListForUser(owner, name);

    if (smartReadingList != null) {
      throw new ReadingListException("Name already used: " + name);
    }
    log.debug("Creating reading list object");
    smartReadingList = new SmartReadingList();
    smartReadingList.setOwner(owner);
    smartReadingList.setName(name);
    smartReadingList.setSummary(summary);
    smartReadingList.setNot(not);
    smartReadingList.setMatcherMode(mode);
    for (SmartListMatcher smartListMatcher : smartListMatchers) {
      smartListMatcher.setSmartList(smartReadingList);
      smartReadingList.getSmartListMatchers().add(smartListMatcher);
    }

    log.debug("Saving smart reading list");
    return this.smartReadingListRepository.save(smartReadingList);
  }

  public SmartListMatcher createMatcher(
      final String type,
      final boolean not,
      final String mode,
      final List<SmartListMatcher> smartListMatchers) {
    log.debug("Creating Group matcher: type={} not={} mode={}", type, not, mode);

    SmartListMatcher smartListMatcher = new SmartListMatcher();
    smartListMatcher.setType(type);
    smartListMatcher.setNot(not);
    smartListMatcher.setMode(mode);
    for (SmartListMatcher matcherSmartListMatcher : smartListMatchers) {
      matcherSmartListMatcher.setNextMatcher(smartListMatcher);
      smartListMatcher.getSmartListMatchers().add(matcherSmartListMatcher);
    }

    return smartListMatcher;
  }

  public SmartListMatcher createMatcher(
      final String type, final boolean not, final String operator, final String value) {
    log.debug(
        "Creating Item matcher: type={} not={} operator={} value={}", type, not, operator, value);

    SmartListMatcher smartListMatcher = new SmartListMatcher();
    smartListMatcher.setType(type);
    smartListMatcher.setNot(not);
    smartListMatcher.setOperator(operator);
    smartListMatcher.setValue(value);

    return smartListMatcher;
  }

  public void getReadingListsForComics(String email, List<Comic> comics) {
    log.debug("Loading reading lists for user: email={}", email);
    for (Comic comic : comics) {
      List<ReadingList> readingLists = this.readingListRepository.findByOwnerAndComic(email, comic);

      log.debug(
          "Found {} reading list{} for comic: id={}",
          readingLists.size(),
          readingLists.size() == 1 ? "" : "s",
          comic.getId());
      for (int index = 0; index < readingLists.size(); index++) {
        comic.getReadingLists().add(readingLists.get(index));
      }
    }
  }

  @Transactional
  public int addComicsToList(String email, long id, List<Long> comicIds)
      throws ReadingListException {
    log.debug(
        "Adding {} comic{} to reading list: reading list id={} email={}",
        comicIds.size(),
        comicIds.size() == 1 ? "" : "s",
        id,
        email);

    int result = 0;

    Optional<ReadingList> readingListRecord = this.readingListRepository.findById(id);

    if (!readingListRecord.isPresent()) {
      throw new ReadingListException("no such reading list: id=" + id);
    }

    ReadingList readingList = readingListRecord.get();

    if (!readingList.getOwner().getEmail().equals(email)) {
      throw new ReadingListException(
          "user is not owner: " + email + " != " + readingList.getOwner().getEmail());
    }
    for (int index = 0; index < comicIds.size(); index++) {
      Long comicId = comicIds.get(index);
      Comic comic = null;
      try {
        log.debug("Loading comic: id={}", comicId);
        comic = this.comicService.getComic(comicId);
      } catch (ComicException error) {
        throw new ReadingListException("could not add comic to reading list", error);
      }
      log.debug("Adding comic to reading list");
      readingList.getComics().add(comic);
      result++;
    }

    log.debug("Saving updated reading list");
    readingList.setLastModifiedOn(new Date());
    this.readingListRepository.save(readingList);

    log.debug("Added {} comic{} to reading list", result, result == 1 ? "" : "s");
    return result;
  }

  @Transactional
  public int removeComicsFromList(String email, long id, List<Long> comicIds)
      throws ReadingListException {
    log.debug(
        "Removing {} comic{} to reading list: reading list id={} email={}",
        comicIds.size(),
        comicIds.size() == 1 ? "" : "s",
        id,
        email);

    Optional<ReadingList> readingListRecord = this.readingListRepository.findById(id);

    if (!readingListRecord.isPresent()) {
      throw new ReadingListException("no such reading list: id=" + id);
    }

    ReadingList readingList = readingListRecord.get();

    if (!readingList.getOwner().getEmail().equals(email)) {
      throw new ReadingListException(
          "user is not owner: " + email + " != " + readingList.getOwner().getEmail());
    }

    int result = 0;

    for (int index = 0; index < comicIds.size(); index++) {
      Long comicId = comicIds.get(index);
      Comic comic = null;
      try {
        log.debug("Loading comic: id={}", comicId);
        comic = this.comicService.getComic(comicId);
      } catch (ComicException error) {
        throw new ReadingListException("could not remove comic from reading list", error);
      }
      readingList.getComics().remove(comic);
      result++;
    }

    log.debug("Saving updated reading list");
    readingList.setLastModifiedOn(new Date());
    this.readingListRepository.save(readingList);

    log.debug("Removed {} comic{} to reading list", result, result == 1 ? "" : "s");
    return result;
  }

  /**
   * Saves a reading list.
   *
   * @param readingList the reading list
   * @return the updated reading list
   */
  @Transactional
  public ReadingList save(final ReadingList readingList) {
    log.debug("Saving reading list: {}", readingList.getName());
    readingList.setLastModifiedOn(new Date());
    return this.readingListRepository.save(readingList);
  }
}
