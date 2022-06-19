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

package org.comixedproject.opds.rest;

import java.security.Principal;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.comixedproject.opds.service.OPDSNavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>OPDSSeriesController</code> provides OPDS endpoints for navigating through comics for a
 * series.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSSeriesController {
  @Autowired private OPDSNavigationService opdsNavigationService;
  @Autowired private OPDSAcquisitionService opdsAcquisitionService;
  @Autowired private OPDSUtils opdsUtils;

  /**
   * Returns the series root navigation feed.
   *
   * @param unread the unread flag
   * @return the navigation feed
   */
  @GetMapping(value = "/opds/library/series", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed getRootFeedForSeries(
      @RequestParam(name = "unread") final boolean unread) {
    log.info("Getting publisher root feed");
    return this.opdsNavigationService.getRootFeedForSeries(unread);
  }

  /**
   * Returns the volumes navigation feed for a series.
   *
   * @param name the series name
   * @param unread the unread flag
   * @return the navigation feed
   */
  @GetMapping(value = "/opds/library/series/{name}", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed getVolumesFeedForSeries(
      @PathVariable("name") @NonNull final String name,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    final String seriesName = this.opdsUtils.urlDecodeString(name);
    log.info("Getting volumes feed for series: {}", seriesName);
    return this.opdsNavigationService.getVolumesFeedForSeries(seriesName, unread);
  }

  /**
   * Returns the acquisition feed of comics for a given series and volume.
   *
   * @param principal the user principal
   * @param series the series name
   * @param volume the volume
   * @param unread the unread flag
   * @return the acquisition feed
   */
  @GetMapping(
      value = "/opds/library/series/{name}/volumes/{volume}",
      produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSAcquisitionFeed getComicFeedForSeriesAndVolumes(
      final Principal principal,
      @PathVariable("name") @NonNull final String series,
      @PathVariable("volume") @NonNull final String volume,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    final String email = principal.getName();
    final String seriesName = this.opdsUtils.urlDecodeString(series);
    final String volumeName = this.opdsUtils.urlDecodeString(volume);
    log.info("Getting acquisition feed for series and volume: {} v{}", seriesName, volumeName);
    return this.opdsAcquisitionService.getComicFeedForSeriesAndVolumes(
        seriesName, volumeName, email, unread);
  }
}
