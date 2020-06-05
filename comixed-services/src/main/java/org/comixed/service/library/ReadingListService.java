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

package org.comixed.service.library;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixed.model.comic.Comic;
import org.comixed.model.library.Matcher;
import org.comixed.model.library.ReadingList;
import org.comixed.model.library.SmartReadingList;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.library.ReadingListRepository;
import org.comixed.repositories.library.SmartReadingListRepository;
import org.comixed.service.comic.ComicException;
import org.comixed.service.comic.ComicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    this.log.debug("Creating reading list: email={} name={}", email, name);

    this.log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);
    ReadingList readingList = this.readingListRepository.findReadingListForUser(owner, name);

    if (readingList != null) {
      throw new ReadingListNameException("Name already used: " + name);
    }

    this.log.debug("Creating reading list object");
    readingList = new ReadingList();
    readingList.setOwner(owner);
    readingList.setName(name);
    readingList.setSummary(summary);
    readingList.setLastUpdated(new Date());

    this.log.debug("Saving reading list");
    return this.readingListRepository.save(readingList);
  }

  public List<ReadingList> getReadingListsForUser(final String email, final Date lastUpdated) {
    this.log.debug("Getting reading lists for user: email={} updated after={}", email, lastUpdated);

    this.log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);

    return this.readingListRepository.getAllReadingListsForOwnerUpdatedAfter(owner, lastUpdated);
  }

  @Transactional
  public ReadingList updateReadingList(
      final String email, final long id, final String name, final String summary)
      throws NoSuchReadingListException, ComicException {
    this.log.debug("Updating reading list: owner={} id={} name={}", email, id, name);

    this.log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);

    this.log.debug("Getting reading list");
    final Optional<ReadingList> readingList = this.readingListRepository.findById(id);

    if (!readingList.isPresent()) {
      throw new NoSuchReadingListException("No such reading list: id=" + id);
    }

    this.log.debug("Updating reading list details");
    readingList.get().setName(name);
    readingList.get().setSummary(summary);
    readingList.get().setLastUpdated(new Date());

    this.log.debug("Updating reading list");
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
    this.log.debug("Creating smart reading list: email={} name={}", email, name);

    this.log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);
    SmartReadingList smartReadingList =
        this.smartReadingListRepository.findSmartReadingListForUser(owner, name);

    if (smartReadingList != null) {
      throw new ReadingListNameException("Name already used: " + name);
    }
    this.log.debug("Creating reading list object");
    smartReadingList = new SmartReadingList();
    smartReadingList.setOwner(owner);
    smartReadingList.setName(name);
    smartReadingList.setSummary(summary);
    smartReadingList.setNot(not);
    smartReadingList.setMode(mode);
    for (Matcher matcher : matchers) {
      smartReadingList.addMatcher(matcher);
    }

    this.log.debug("Saving smart reading list");
    return this.smartReadingListRepository.save(smartReadingList);
  }

  public Matcher createMatcher(
      final String type, final boolean not, final String mode, final List<Matcher> matchers) {
    this.log.debug("Creating Group matcher: type={} not={} mode={}", type, not, mode);

    Matcher matcher = new Matcher();
    matcher.setType(type);
    matcher.setNot(not);
    matcher.setMode(mode);
    for (Matcher matcherMatcher : matchers) {
      matcher.addMatcher(matcherMatcher);
    }

    return matcher;
  }

  public Matcher createMatcher(
      final String type, final boolean not, final String operator, final String value) {
    this.log.debug(
        "Creating Item matcher: type={} not={} operator={} value={}", type, not, operator, value);

    Matcher matcher = new Matcher();
    matcher.setType(type);
    matcher.setNot(not);
    matcher.setOperator(operator);
    matcher.setValue(value);

    return matcher;
  }

  public void getReadingListsForComics(String email, List<Comic> comics) {
    this.log.debug("Loading reading lists for user: email={}", email);
    for (Comic comic : comics) {
      List<ReadingList> readingLists = this.readingListRepository.findByOwnerAndComic(email, comic);

      this.log.debug(
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
  public int addComicsToList(String email, long id, List<Long> ids) throws ReadingListException {
    this.log.debug(
        "Adding {} comic{} to reading list: reading list id={} email={}",
        ids.size(),
        ids.size() == 1 ? "" : "s",
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
    for (int index = 0; index < ids.size(); index++) {
      Long comicId = ids.get(index);
      this.log.debug("Loading comic: id={}", comicId);
      Comic comic = null;
      try {
        comic = this.comicService.getComic(comicId);
      } catch (ComicException error) {
        throw new ReadingListException("failed to add comic to reading list", error);
      }
      this.log.debug("Adding comic to reading list");
      readingList.getComics().add(comic);
      comic.setDateLastUpdated(new Date());
      result++;
    }

    this.log.debug("Saving updated reading list");
    readingList.setLastUpdated(new Date());
    this.readingListRepository.save(readingList);

    this.log.debug("Adding {} comic{} to reading list", result, result == 1 ? "" : "s");
    return result;
  }
}
