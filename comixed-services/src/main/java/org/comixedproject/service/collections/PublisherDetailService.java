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

package org.comixedproject.service.collections;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.collections.PublisherDetail;
import org.comixedproject.repositories.collections.PublisherDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Log4j2
public class PublisherDetailService {
  @Autowired private PublisherDetailRepository publisherDetailRepository;

  /**
   * Returns the list of all publishers.
   *
   * @param filterText optional filter text
   * @param pageIndex the page index
   * @param pageSize the page size
   * @param sortBy the optional sort field
   * @param sortDirection the optional sort direction
   * @return the publisher list
   */
  @Transactional(readOnly = true)
  public List<PublisherDetail> getAllPublishers(
      final String filterText,
      final int pageIndex,
      final int pageSize,
      final String sortBy,
      final String sortDirection) {
    var pageRequest = PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection));
    if (StringUtils.hasLength(filterText)) {
      return this.publisherDetailRepository
          .findAllFiltered(String.format("%%%s%%", filterText), pageRequest)
          .stream()
          .toList();
    } else {
      return this.publisherDetailRepository.findAll(pageRequest).stream().toList();
    }
  }

  /**
   * Returns the number of publishers.
   *
   * @return the publisher count
   */
  @Transactional(readOnly = true)
  public long getPublisherCount(final String filterText) {
    if (StringUtils.hasLength(filterText)) {
      return this.publisherDetailRepository.getPublisherCountWithFilter(
          String.format("%%%s%%", filterText));
    } else {
      return this.publisherDetailRepository.getPublisherCount();
    }
  }

  private Sort doCreateSort(final String sortBy, final String sortDirection) {
    if (!StringUtils.hasLength(sortBy) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortBy) {
      case "name" -> fieldName = "id";
      case "series-count" -> fieldName = "seriesCount";
      case "issue-count" -> fieldName = "issueCount";
      default -> fieldName = "id";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }
}
