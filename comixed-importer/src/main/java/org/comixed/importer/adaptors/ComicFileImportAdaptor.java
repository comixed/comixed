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
import java.util.List;
import java.util.Map;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.importer.PathReplacement;
import org.comixed.model.library.Comic;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicFileImportAdaptor</code> handles taking a list of comic files and importing them into
 * the database.
 *
 * @author Darryl L. Pierce
 */
@Component
public class ComicFileImportAdaptor {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ComicRepository comicRepository;

  @Autowired private ComicFileHandler comicFileHandler;

  @Autowired private ComiXedUserRepository userRepository;

  public void importComics(
      List<Comic> comics,
      List<PathReplacement> replacements,
      Map<String, String> currentPages,
      ComiXedUser importUser)
      throws ImportAdaptorException {
    for (int index = 0; index < comics.size(); index++) {
      try {
        this.logger.info("Importing comic: {}", comics.get(index).getFilename());
        this.importComic(comics.get(index), replacements, currentPages, importUser);
      } catch (FileNotFoundException error) {
        this.logger.info("Comic not found: skipping");
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
      this.logger.debug("Found in the library");
      return;
    }

    File file = new File(comic.getFilename());
    if (!file.exists()) {
      this.logger.info("No such file: {}", comic.getFilename());
      throw new FileNotFoundException("no such file: " + comic.getFilename());
    }

    this.logger.debug("Loading comic details");
    this.comicFileHandler.loadComic(comic);

    this.logger.debug("Saving comic to database");
    this.comicRepository.save(comic);

    String currentPage = currentPages.get(comic.getFilename());
    if (currentPage != null && importUser != null) {
      Comic currentComic = this.comicRepository.findByFilename(comic.getFilename());
      importUser.setBookmark(currentComic.getId(), currentPage);
      this.userRepository.save(importUser);
    } else {
      this.logger.debug("No import user defined, no bookmark saved");
    }
  }

  public void verifyPath(Comic comic, List<PathReplacement> pathReplacements) {
    this.logger.debug("Verifying path: {} replacement options", pathReplacements.size());
    for (PathReplacement replacement : pathReplacements) {
      if (replacement.isMatch(comic.getFilename())) {
        String oldname = comic.getFilename();
        String newname = replacement.getReplacement(oldname);

        this.logger.debug("Replacing filename: {}={}", oldname, newname);
        comic.setFilename(newname);
        return;
      }
    }
  }
}
