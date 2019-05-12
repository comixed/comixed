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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.controllers;

import org.comixed.library.lists.ReadingList;
import org.comixed.library.lists.ReadingListEntry;
import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Comic;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.ReadingListRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ReadingListController {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired ReadingListRepository readingListRepository;
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private ComicRepository comicRepository;

  @RequestMapping(value = "/lists", method = RequestMethod.POST)
  public ReadingList createReadingList(
      Principal principal,
      @RequestParam("name") String name,
      @RequestParam("summary") String summary,
      @RequestParam("entries") List<Long> entries)
      throws NoSuchReadingListException, ReadingListNameException {
    this.logger.debug("Preparing to create reading list: user={}", principal.getName());
    this.logger.debug("                                : name={}", name);
    this.logger.debug("                                : summary={}", summary);

    ComiXedUser user = getComiXedUser(principal);
    ReadingList result = this.readingListRepository.findReadingListForUser(user, name);

    if (result != null) {
      this.logger.error("Reading list already exists for user: {}", name);
      throw new ReadingListNameException();
    }

    result = new ReadingList();
    result.setOwner(user);
    result.setName(name);
    result.setSummary(summary);
    this.loadComics(result, entries);

    this.logger.info("Creating reading list: {}", name);
    this.readingListRepository.save(result);

    return result;
  }

  private void loadComics(ReadingList result, List<Long> entries) {
    this.logger.debug("Loading {} entries", entries.size());
    result.getEntries().clear();

    for (Long entry : entries) {
      Optional<Comic> comic = this.comicRepository.findById(entry);

      if (comic.isPresent()) {
        result.getEntries().add(new ReadingListEntry(comic.get(), result));
      } else {
        this.logger.warn("No such comic: id={}", entry);
      }
    }
  }

  @RequestMapping(value = "/lists/{id}", method = RequestMethod.PUT)
  public ReadingList updateReadingList(
      Principal principal,
      @PathVariable("id") long id,
      @RequestParam("name") String name,
      @RequestParam("summary") String summary,
      @RequestParam("entries") List<Long> entries)
      throws NoSuchReadingListException {
    ComiXedUser user = this.getComiXedUser(principal);

    this.logger.info("Updating reading list: id={} name={} summary={}", id, name, summary);

    Optional<ReadingList> result = this.readingListRepository.findById(id);
    if (!result.isPresent()) {
      this.logger.info("No such reading list");
      throw new NoSuchReadingListException();
    }
    ReadingList list = result.get();

    list.setName(name);
    list.setSummary(summary);
    this.loadComics(list, entries);
    this.logger.debug("Saving updated reading list");
    this.readingListRepository.save(list);

    return list;
  }

  private ComiXedUser getComiXedUser(Principal principal) {
    return this.userRepository.findByEmail(principal.getName());
  }

  @RequestMapping(value = "/lists", method = RequestMethod.GET)
  public List<ReadingList> getReadingListsForUser(Principal principal) {
    if (principal == null) {
      return null;
    }
    this.logger.info("Getting reading lists: user={}", principal.getName());

    ComiXedUser user = this.getComiXedUser(principal);
    List<ReadingList> result = this.readingListRepository.findAllReadingListsForUser(user);

    this.logger.debug("Returning {} lists(s)", result.size());
    return result;
  }
}
