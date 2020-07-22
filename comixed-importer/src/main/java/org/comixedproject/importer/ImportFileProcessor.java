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

package org.comixedproject.importer;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.importer.adaptors.ComicFileImportAdaptor;
import org.comixedproject.importer.adaptors.ComicRackBackupAdaptor;
import org.comixedproject.importer.adaptors.ImportAdaptorException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.library.ReadingListNameException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * <code>ImportFileProcessor</code> provides a means for processing an import file.
 *
 * @author Darryl L. Pierce
 */
@Component
@ConfigurationProperties(value = "processor.file.import")
@Log4j2
public class ImportFileProcessor {
  protected List<PathReplacement> replacements = new ArrayList<>();
  protected ComiXedUser importUser;
  protected Map<String, String> currentPages = new HashMap<>();
  protected Map<String, String> booksguids = new HashMap<>();

  @Autowired private ComicRackBackupAdaptor backupAdaptor;
  @Autowired private ComicFileImportAdaptor importAdaptor;
  @Autowired private ComiXedUserRepository userRepository;

  public void setReplacements(List<String> replacements) {
    log.debug("Processing {} replacement rules", replacements.size());
    for (String rule : replacements) {
      this.replacements.add(new PathReplacement(rule));
    }
  }

  public void setImportUser(String user) {
    log.debug("Setting import user {}", user);
    this.importUser = this.userRepository.findByEmail(user);
  }

  /**
   * Starts processing the file.
   *
   * @throws ProcessorException if a processing error occurs
   */
  public void process(String source) throws ProcessorException {
    log.debug("Beginning import: file={}", source);
    if (source == null) {
      throw new ProcessorException("missing source");
    }

    File file = new File(source);

    if (!file.exists()) {
      throw new ProcessorException("file not found:" + source);
    }
    if (!file.isFile()) {
      throw new ProcessorException("source is a directory:" + source);
    }

    try {
      log.debug("Loading comics from source file");
      List<Comic> comics = this.backupAdaptor.load(file, this.currentPages, this.booksguids);

      log.debug("Importing {} comic(s)", comics.size());
      this.importAdaptor.importComics(
          comics, this.replacements, this.currentPages, this.importUser);

      log.debug("Loading comic lists from source file");
      Map<String, Object> comicsLists = this.backupAdaptor.loadLists(file, this.booksguids);

      log.debug("Importing {} comic list(s)", comicsLists.size());
      this.importAdaptor.importLists(comicsLists, this.importUser);

    } catch (ImportAdaptorException error) {
      throw new ProcessorException("failed to load entries", error);
    } catch (ComicException error) {
      throw new ProcessorException("failed to import lists", error);
    } catch (ReadingListNameException error) {
      throw new ProcessorException("failed to import smart lists", error);
    }
  }
}
