/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.OrganizingComic;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.comixedproject.repositories.library.OrganizingComicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>OrganizingComicService</code> provides methods for working with instances of {@link
 * OrganizingComic}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class OrganizingComicService {
  @Autowired private OrganizingComicRepository organizingComicRepository;
  @Autowired private ComicBookRepository comicBookRepository;
  @Autowired private ComicDetailRepository comicDetailRepository;

  /**
   * Loads a set of records from the database.
   *
   * @param max the max records to load
   * @return the loaded records
   */
  @Transactional
  public List<OrganizingComic> loadComics(final int max) {
    log.trace("Loading a batch of {} organizing comic(s)", max);
    return this.organizingComicRepository.loadComics(PageRequest.of(0, max));
  }

  /**
   * Clears the organizing flag and updates the filename for a comic book.
   *
   * @param comic the comic book
   */
  @Transactional
  public void saveComic(final OrganizingComic comic) {
    if (StringUtils.hasLength(comic.getUpdatedFilename())) {
      log.trace(
          "Updating filename: id={} filename={}", comic.getComicBookId(), comic.getFilename());
      this.comicDetailRepository.updateFilename(
          comic.getComicDetailId(), comic.getUpdatedFilename());
    }
    log.trace("Clearing organizing flag: id={}", comic.getComicBookId());
    this.comicBookRepository.clearOrganizingFlag(comic.getComicBookId());
  }

  /**
   * Returns the number of comics marked for organization.
   *
   * @return the count
   */
  @Transactional
  public long loadComicCount() {
    return this.organizingComicRepository.count();
  }
}
