/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.rest.library;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.metadata.Issue;
import org.comixedproject.model.net.metadata.GetIssueCountResponse;
import org.comixedproject.service.library.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>IssueController</code> provides REST APIs for working with instances of {@link Issue}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class IssueController {
  @Autowired private IssueService issueService;

  /**
   * Returns the issue count for the given series and volume.
   *
   * @param series the series name
   * @param volume the volume
   * @return the issue count
   */
  @GetMapping(
      value = "/api/issues/count/{series}/{volume}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  public GetIssueCountResponse getIssueCount(
      @PathVariable("series") final String series, @PathVariable("volume") final String volume) {
    log.info("Getting issue count: series={} volume={}", series, volume);
    final long count = this.issueService.getCountForSeriesAndVolume(series, volume);
    return new GetIssueCountResponse(count);
  }
}
