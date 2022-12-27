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

package org.comixedproject.rest.collections;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.net.collections.LoadSeriesListResponse;
import org.comixedproject.service.collections.SeriesService;
import org.comixedproject.service.library.CollectionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>SeriesController</code> provides web endpoints for working with series collections.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class SeriesController {
  @Autowired private SeriesService seriesService;

  /**
   * Returns the list of series, sorted by the given sort field.
   *
   * @return the response
   */
  @PostMapping(
      value = "/api/collections/series",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  public LoadSeriesListResponse loadSeriesList() {
    log.info("Loading series");
    return new LoadSeriesListResponse(this.seriesService.getSeriesList());
  }

  /**
   * Returns the list of issues for the specified series.
   *
   * @param publisher the publisher
   * @param name the series name
   * @param volume the volume
   * @return the issues
   * @throws CollectionException if an error occurs
   */
  @PostMapping(
      value = "/api/collections/publishers/{publisher}/series/{name}/volumes/{volume}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  public List<Issue> loadSeriesDetail(
      @PathVariable("publisher") final String publisher,
      @PathVariable("name") final String name,
      @PathVariable("volume") final String volume)
      throws CollectionException {
    log.info("Loading series detail: publisher={} name={} volume={}", publisher, name, volume);
    return this.seriesService.loadSeriesDetail(publisher, name, volume);
  }
}
