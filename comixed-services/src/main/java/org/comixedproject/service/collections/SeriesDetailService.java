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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
  public List<SeriesDetail> getSeriesList() {
    log.debug("Loading series list");
    return this.seriesDetailsRepository.findAll();
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
}
