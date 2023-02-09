/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.Imprint;
import org.comixedproject.repositories.comicbooks.ImprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ImprintService</code> provides services for working with imprints.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ImprintService {
  @Autowired private ImprintRepository imprintRepository;
  /**
   * Updates the given comicBook's publisher and imprint if necessary.
   *
   * @param comicBook the comicBook
   */
  public void update(final ComicBook comicBook) {
    log.trace("Looking for imprint");
    final Imprint imprint =
        this.imprintRepository.findByName(comicBook.getComicDetail().getImprint());
    if (imprint == null) {
      log.trace("Publisher is not an imprint");
      comicBook.getComicDetail().setImprint("");
      return;
    }
    final String publisher = comicBook.getComicDetail().getPublisher();

    log.trace("Updating publisher and imprint: {} => {}", publisher, imprint);
    comicBook.getComicDetail().setPublisher(imprint.getPublisher());
    comicBook.getComicDetail().setImprint(imprint.getName());
  }

  /**
   * Returns all imprints.
   *
   * @return the imprint list
   */
  public List<Imprint> getAll() {
    log.trace("Fetching all imprints");
    return this.imprintRepository.findAll();
  }
}
