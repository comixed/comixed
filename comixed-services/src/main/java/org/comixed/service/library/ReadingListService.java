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

import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixed.model.library.*;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.library.ReadingListRepository;
import org.comixed.repositories.library.SmartReadingListRepository;
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
  public ReadingList createReadingList(
      final String email, final String name, final String summary, final List<Long> entries)
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

    loadComics(entries, readingList);

    this.log.debug("Saving reading list");
    return this.readingListRepository.save(readingList);
  }

  private void loadComics(final List<Long> entries, final ReadingList readingList)
      throws ComicException {
    this.log.debug("Adding comics to list");
    readingList.getEntries().clear();
    for (int index = 0; index < entries.size(); index++) {
      final Long id = entries.get(index);
      this.log.debug("Loading comic: id={}", id);
      final Comic comic = this.comicService.getComic(id);
      readingList.getEntries().add(new ReadingListEntry(comic, readingList));
    }
  }

  public List<ReadingList> getReadingListsForUser(final String email) {
    this.log.debug("Getting reading lists for user: email={}", email);

    this.log.debug("Getting owner");
    final ComiXedUser owner = this.userRepository.findByEmail(email);

    return this.readingListRepository.findAllReadingListsForUser(owner);
  }

  @Transactional
  public ReadingList updateReadingList(
      final String email,
      final long id,
      final String name,
      final String summary,
      final List<Long> entries)
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

    loadComics(entries, readingList.get());

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
}
