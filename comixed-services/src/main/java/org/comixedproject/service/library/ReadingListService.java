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

package org.comixedproject.service.library;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.Matcher;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.library.SmartReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.library.ReadingListRepository;
import org.comixedproject.repositories.library.SmartReadingListRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
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
  @Autowired ComiXedUserRepository userRepository;
  @Autowired ComicService comicService;

  @Transactional
  public ReadingList createReadingList(final String email, final String name, final String summary)
      throws ReadingListNameException, ComicException {
    log.debug("Creating reading list: email={} name={}", email, name);

    log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);
    ReadingList readingList = this.readingListRepository.findReadingListForUser(owner, name);

    if (readingList != null) {
      throw new ReadingListNameException("Name already used: " + name);
    }

    log.debug("Creating reading list object");
    readingList = new ReadingList();
    readingList.setOwner(owner);
    readingList.setName(name);
    readingList.setSummary(summary);
    readingList.setLastUpdated(new Date());

    log.debug("Saving reading list");
    return this.readingListRepository.save(readingList);
  }

  public List<ReadingList> getReadingListsForUser(final String email, final Date lastUpdated) {
    log.debug("Getting reading lists for user: email={} updated after={}", email, lastUpdated);

    log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);

    return this.readingListRepository.getAllReadingListsForOwnerUpdatedAfter(owner, lastUpdated);
  }

  @Transactional
  public ReadingList updateReadingList(
      final String email, final long id, final String name, final String summary)
      throws NoSuchReadingListException, ComicException {
    log.debug("Updating reading list: owner={} id={} name={}", email, id, name);

    log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);

    log.debug("Getting reading list");
    final Optional<ReadingList> readingList = this.readingListRepository.findById(id);

    if (!readingList.isPresent()) {
      throw new NoSuchReadingListException("No such reading list: id=" + id);
    }

    log.debug("Updating reading list details");
    readingList.get().setName(name);
    readingList.get().setSummary(summary);
    readingList.get().setLastUpdated(new Date());

    log.debug("Updating reading list");
    return this.readingListRepository.save(readingList.get());
  }

  public ReadingList getReadingListForUser(final String email, final long id)
      throws NoSuchReadingListException {
    final ComiXedUser user = this.userRepository.findByEmail(email);
    final Optional<ReadingList> readingList = this.readingListRepository.findById(id);

    if (readingList.isPresent()) {
      final ComiXedUser owner = readingList.get().getOwner();

      if (owner.getId().equals(user.getId())) {
        return readingList.get();
      }

      throw new NoSuchReadingListException(
          "User is not the owner: user id=" + user.getId() + " owner id=" + owner.getId());
    }

    throw new NoSuchReadingListException("Invalid reading list: id=" + id);
  }

  @Transactional
  public SmartReadingList createSmartReadingList(
      final String email,
      final String name,
      final String summary,
      final boolean not,
      final String mode,
      final List<Matcher> matchers)
      throws ReadingListNameException {
    log.debug("Creating smart reading list: email={} name={}", email, name);

    log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);
    SmartReadingList smartReadingList =
        this.smartReadingListRepository.findSmartReadingListForUser(owner, name);

    if (smartReadingList != null) {
      throw new ReadingListNameException("Name already used: " + name);
    }
    log.debug("Creating reading list object");
    smartReadingList = new SmartReadingList();
    smartReadingList.setOwner(owner);
    smartReadingList.setName(name);
    smartReadingList.setSummary(summary);
    smartReadingList.setNot(not);
    smartReadingList.setMode(mode);
    for (Matcher matcher : matchers) {
      matcher.setSmartList(smartReadingList);
      smartReadingList.getMatchers().add(matcher);
    }

    log.debug("Saving smart reading list");
    return this.smartReadingListRepository.save(smartReadingList);
  }

  public Matcher createMatcher(
      final String type, final boolean not, final String mode, final List<Matcher> matchers) {
    log.debug("Creating Group matcher: type={} not={} mode={}", type, not, mode);

    Matcher matcher = new Matcher();
    matcher.setType(type);
    matcher.setNot(not);
    matcher.setMode(mode);
    for (Matcher matcherMatcher : matchers) {
      matcherMatcher.setMatcher(matcher);
      matcher.getMatchers().add(matcherMatcher);
    }

    return matcher;
  }

  public Matcher createMatcher(
      final String type, final boolean not, final String operator, final String value) {
    log.debug(
        "Creating Item matcher: type={} not={} operator={} value={}", type, not, operator, value);

    Matcher matcher = new Matcher();
    matcher.setType(type);
    matcher.setNot(not);
    matcher.setOperator(operator);
    matcher.setValue(value);

    return matcher;
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

    Optional<ReadingList> record = this.readingListRepository.findById(id);

    if (!record.isPresent()) {
      throw new ReadingListException("no such reading list: id=" + id);
    }

    ReadingList readingList = record.get();

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
      comic.setDateLastUpdated(new Date());
      result++;
    }

    log.debug("Saving updated reading list");
    readingList.setLastUpdated(new Date());
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

    Optional<ReadingList> record = this.readingListRepository.findById(id);

    if (!record.isPresent()) {
      throw new ReadingListException("no such reading list: id=" + id);
    }

    ReadingList readingList = record.get();

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
      comic.setDateLastUpdated(new Date());
      result++;
    }

    log.debug("Saving updated reading list");
    readingList.setLastUpdated(new Date());
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
    readingList.setLastUpdated(new Date());
    return this.readingListRepository.save(readingList);
  }
}
