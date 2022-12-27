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
import org.comixedproject.model.collections.Series;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.library.CollectionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>SeriesService</code> provides methods for working with instances of {@link Series}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class SeriesService {
  @Autowired private ComicBookService comicBookService;
  @Autowired private IssueService issueService;

  /**
   * Returns the list of all series and volumes.
   *
   * @return the list of series
   */
  public List<Series> getSeriesList() {
    log.debug("Loading series list");
    final List<Series> result = this.comicBookService.getAllSeriesAndVolumes();
    result.forEach(
        series -> {
          log.trace(
              "Loading total issue count for series: {} {}", series.getName(), series.getVolume());
          series.setTotalIssues(
              this.issueService.getCountForSeriesAndVolume(series.getName(), series.getVolume()));
        });
    return result;
  }

  /**
   * Loads the details for a single series.
   *
   * @param publisher the publisher
   * @param name the series name
   * @param volume the volume
   * @return the detail
   * @throws CollectionException if the series is invalid
   */
  public List<Issue> loadSeriesDetail(
      final String publisher, final String name, final String volume) throws CollectionException {
    log.debug("Loading series detail: publisher={} name={} volume={}", publisher, name, volume);
    final List<Issue> detail = this.issueService.getAll(publisher, name, volume);
    if (detail.isEmpty()) throw new CollectionException("No such series");
    return detail;
  }
}
