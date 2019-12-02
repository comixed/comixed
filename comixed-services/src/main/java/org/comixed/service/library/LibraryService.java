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

package org.comixed.service.library;

import java.util.Date;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.repositories.library.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LibraryService {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ComicRepository comicRepository;

  @Transactional
  public List<Comic> getComics(
      final int page, final int count, final String sortField, final boolean ascending) {
    this.logger.debug(
        "Getting comics for page: page={} count={} sortField={}", page, count, sortField);

    final List<Comic> result =
        this.comicRepository
            .findAll(
                PageRequest.of(
                    page, count, Sort.by(ascending ? Direction.ASC : Direction.DESC, sortField)))
            .getContent();

    this.logger.debug("Returning {} comic{}", result.size(), result.size() == 1 ? "" : "s");
    return result;
  }

  public Date getLatestUpdatedDate() {
    this.logger.debug("Getting the latest updated date in the library");

    final List<Comic> comics =
        this.comicRepository.findTopByOrderByDateLastUpdatedDesc(PageRequest.of(1, 1));

    final Date result = comics.isEmpty() ? null : comics.get(0).getDateLastUpdated();

    this.logger.debug("Latest updated date: {}", result);

    return result;
  }

  public long getComicCount() {
    this.logger.debug("Getting the library comic count");

    final long result = this.comicRepository.count();

    this.logger.debug("There are {} comic{} in the library", result, result == 1 ? "" : "s");

    return result;
  }
}
