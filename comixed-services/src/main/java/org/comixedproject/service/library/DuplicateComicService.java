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
import org.comixedproject.model.library.DuplicateComic;
import org.comixedproject.repositories.library.DuplicateComicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>DuplicateComicService</code> provides methods for working with instances of {@link
 * DuplicateComic}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class DuplicateComicService {
  @Autowired private DuplicateComicRepository duplicateComicRepository;

  /**
   * Loads duplicate comics to display.
   *
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comics
   */
  @Transactional
  public List<DuplicateComic> loadDuplicateComicsList(
      final int pageSize, final int pageIndex, final String sortBy, final String sortDirection) {
    log.debug(
        "Loading a page of duplicate comics: index={} size={} sort by={} direction={}",
        pageIndex,
        pageSize,
        sortBy,
        sortDirection);
    return this.duplicateComicRepository
        .findAll(PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)))
        .stream()
        .toList();
  }

  /**
   * Returns the list of comic book ids for duplicate comics.
   *
   * @return the comic book ids
   */
  public List<Long> getDuplicateComicIds() {
    return this.duplicateComicRepository.getDuplicateComicIds();
  }

  /**
   * Returns the number of duplicate comic book entries.
   *
   * @return the count
   */
  @Transactional
  public long getDuplicateComicBookCount() {
    log.debug("Load the duplicate comic detail count");
    return this.duplicateComicRepository.count();
  }

  Sort doCreateSort(final String sortField, final String sortDirection) {
    if (!StringUtils.hasLength(sortField) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortField) {
      case "publisher" -> fieldName = "id.publisher";
      case "volume" -> fieldName = "id.volume";
      case "issue-number" -> fieldName = "id.issueNumber";
      case "cover-date" -> fieldName = "id.coverDate";
      case "comic-count" -> fieldName = "count";
      default -> fieldName = "id.series";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }
}
