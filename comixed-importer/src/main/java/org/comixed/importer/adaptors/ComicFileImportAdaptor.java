/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.importer.adaptors;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.importer.PathReplacement;
import org.comixed.importer.model.ComicBookGroupMatcher;
import org.comixed.importer.model.ComicBookItemMatcher;
import org.comixed.importer.model.ComicBookMatcher;
import org.comixed.importer.model.ComicSmartListItem;
import org.comixed.model.comic.Comic;
import org.comixed.model.library.Matcher;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.comic.ComicRepository;
import org.comixed.service.comic.ComicException;
import org.comixed.service.library.ReadingListNameException;
import org.comixed.service.library.ReadingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicFileImportAdaptor</code> handles taking a list of comic files and importing them into
 * the database.
 *
 * @author João França
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicFileImportAdaptor {
  @Autowired private ComicRepository comicRepository;
  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private ReadingListService readingListService;

  public void importComics(
      List<Comic> comics,
      List<PathReplacement> replacements,
      Map<String, String> currentPages,
      ComiXedUser importUser)
      throws ImportAdaptorException {
    for (int index = 0; index < comics.size(); index++) {
      try {
        this.log.debug("Importing comic: {}", comics.get(index).getFilename());
        this.importComic(comics.get(index), replacements, currentPages, importUser);
      } catch (FileNotFoundException error) {
        this.log.debug("Comic not found: skipping");
      } catch (ComicFileHandlerException error) {
        throw new ImportAdaptorException("unable to load comic file", error);
      }
    }
  }

  protected void importComic(
      Comic comic,
      List<PathReplacement> replacements,
      Map<String, String> currentPages,
      ComiXedUser importUser)
      throws FileNotFoundException, ComicFileHandlerException {
    this.verifyPath(comic, replacements);

    if (this.comicRepository.findByFilename(comic.getFilename()) != null) {
      this.log.debug("Found in the library");
      return;
    }

    File file = new File(comic.getFilename());
    if (!file.exists()) {
      this.log.debug("No such file: {}", comic.getFilename());
      throw new FileNotFoundException("no such file: " + comic.getFilename());
    }

    this.log.debug("Loading comic details");
    this.comicFileHandler.loadComic(comic);

    this.log.debug("Saving comic to database");
    this.comicRepository.save(comic);

    String currentPage = currentPages.get(comic.getFilename());
    if (currentPage != null && importUser != null) {
      Comic currentComic = this.comicRepository.findByFilename(comic.getFilename());
      importUser.setBookmark(currentComic, currentPage);
      this.userRepository.save(importUser);
    } else {
      this.log.debug("No import user defined, no bookmark saved");
    }
  }

  public void verifyPath(Comic comic, List<PathReplacement> pathReplacements) {
    this.log.debug("Verifying path: {} replacement options", pathReplacements.size());
    for (PathReplacement replacement : pathReplacements) {
      if (replacement.isMatch(comic.getFilename())) {
        String oldname = comic.getFilename();
        String newname = replacement.getReplacement(oldname);

        this.log.debug("Replacing filename: {}={}", oldname, newname);
        comic.setFilename(newname);
        return;
      }
    }
  }

  public void importLists(Map<String, Object> lists, ComiXedUser importUser)
      throws ReadingListNameException, ComicException, ImportAdaptorException {

    for (Map.Entry list : lists.entrySet()) {

      String listName = (String) list.getKey();

      if (list.getValue() instanceof List) {
        this.log.debug("Importing list: {}", listName);
        importList(listName, (List) list.getValue(), importUser);
      } else if (list.getValue() instanceof ComicSmartListItem) {
        this.log.debug("Importing smart list: {}", listName);
        importSmartList(listName, (ComicSmartListItem) list.getValue(), importUser);
      } else {
        this.log.error("List {} of unknown type!", listName);
      }
    }
  }

  public void importList(String listName, List<String> list, ComiXedUser importUser)
      throws ComicException {

    String email = importUser.getEmail();
    List<Long> entries = new ArrayList<>();

    for (String filename : list) {
      Comic comic = this.comicRepository.findByFilename(filename);
      if (comic != null) {
        entries.add(comic.getId());
      }
    }

    try {
      this.readingListService.createReadingList(email, listName, "Imported from ComicRack");
    } catch (ReadingListNameException e) {
      this.log.error("Reading list {} already exists!", listName);
    }
  }

  public void importSmartList(String listName, ComicSmartListItem list, ComiXedUser importUser)
      throws ReadingListNameException, ImportAdaptorException {

    String email = importUser.getEmail();

    List<Matcher> matchers = importMatchers(list.getMatchers());

    this.readingListService.createSmartReadingList(
        email, listName, "Imported from ComicRack", list.isNot(), list.getMatcherMode(), matchers);
  }

  public List<Matcher> importMatchers(final List<ComicBookMatcher> matchers)
      throws ImportAdaptorException {

    List<Matcher> matchersList = new ArrayList<>();

    for (ComicBookMatcher matcher : matchers) {
      matchersList.add(importMatcher(matcher));
    }

    return matchersList;
  }

  public Matcher importMatcher(final ComicBookMatcher matcher) throws ImportAdaptorException {

    if (matcher instanceof ComicBookGroupMatcher) {

      ComicBookGroupMatcher groupMatcher = (ComicBookGroupMatcher) matcher;
      List<Matcher> matchersList = new ArrayList<>();
      for (ComicBookMatcher matcherMatcher : groupMatcher.getMatchers()) {
        matchersList.add(importMatcher(matcherMatcher));
      }
      return this.readingListService.createMatcher(
          groupMatcher.getType(),
          groupMatcher.isNot(),
          groupMatcher.getMatcherMode(),
          matchersList);

    } else if (matcher instanceof ComicBookItemMatcher) {

      ComicBookItemMatcher itemMatcher = (ComicBookItemMatcher) matcher;
      return this.readingListService.createMatcher(
          itemMatcher.getType(),
          itemMatcher.isNot(),
          itemMatcher.getMatchOperator(),
          itemMatcher.getValue());

    } else {
      this.log.error("Matcher {} of unknown type!", matcher.getType());
      throw new ImportAdaptorException("Failed to import matcher");
    }
  }
}
