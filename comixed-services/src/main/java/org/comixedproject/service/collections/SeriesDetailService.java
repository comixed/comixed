/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.repositories.collections.SeriesDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>SeriesDetailService</code> provides methods for working with instances of {@link
 * SeriesDetail}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class SeriesDetailService {
  @Autowired private SeriesDetailsRepository seriesDetailsRepository;
  @Autowired private IssueService issueService;

  /**
   * Returns the list of all series and volumes.
   *
   * @return the list of series
   */
  @Transactional(readOnly = true)
  public List<SeriesDetail> getSeriesList(
      final int pageIndex, final int pageSize, final String sortBy, final String sortDirection) {
    log.debug("Loading series list");
    return this.seriesDetailsRepository
        .findAll(PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)))
        .stream()
        .toList();
  }

  /**
   * Returns the number of series in the database.
   *
   * @return the series count
   */
  @Transactional
  public int getSeriesCount() {
    return this.seriesDetailsRepository.getSeriesCount();
  }

  /**
   * Loads the details for a single series.
   *
   * @param publisher the publisher
   * @param name the series name
   * @param volume the volume
   * @return the detail
   */
  @Transactional
  public List<Issue> loadSeriesDetail(
      final String publisher, final String name, final String volume) {
    log.debug("Loading series detail: publisher={} name={} volume={}", publisher, name, volume);
    return this.issueService.getAll(publisher, name, volume);
  }

  private Sort doCreateSort(final String sortBy, final String sortDirection) {
    if (!StringUtils.hasLength(sortBy) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortBy) {
      case "publisher" -> fieldName = "id.publisher";
      case "name" -> fieldName = "id.series";
      case "volume" -> fieldName = "id.volume";
      case "in-library" -> fieldName = "inLibrary";
      case "total-comics" -> fieldName = "totalIssues";
      default -> fieldName = "id.publisher";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }
}
