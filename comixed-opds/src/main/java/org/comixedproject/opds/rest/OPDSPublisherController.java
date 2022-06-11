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
 * <code>OPDSPublisherController</code> provides OPDS endpoints for navigating through comics for a
 * publisher.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSPublisherController {
  @Autowired private OPDSNavigationService opdsNavigationService;
  @Autowired private OPDSAcquisitionService opdsAcquisitionService;
  @Autowired private OPDSUtils opdsUtils;

  /**
   * Retrieves a navigation feed containing all series for the specified publisher.
   *
   * @param publisher the publisher name
   * @param unread the unread flag
   * @return the feed
   */
  @GetMapping(
      value = "/opds/collections/publishers/{publisher}",
      produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  OPDSNavigationFeed getSeriesFeedForPublisher(
      @PathVariable("publisher") @NonNull final String publisher,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    final String publisherName = this.opdsUtils.urlDecodeString(publisher);
    log.info("Getting all series for publisher: {}", publisherName);
    return this.opdsNavigationService.getSeriesFeedForPublisher(publisherName, unread);
  }

  /**
   * Retrieves a navigation feed containing all volumes for the specified publisher and series.
   *
   * @param publisher the publisher name
   * @param series the series name
   * @param unread the unread flag
   * @return the feed
   */
  @GetMapping(
      value = "/opds/collections/publishers/{publisher}/series/{series}",
      produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  OPDSNavigationFeed getVolumeFeedForPublisherAndSeries(
      @PathVariable("publisher") @NonNull final String publisher,
      @PathVariable("series") @NonNull final String series,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    final String publisherName = this.opdsUtils.urlDecodeString(publisher);
    final String seriesName = this.opdsUtils.urlDecodeString(series);
    log.info("Getting all volumes for series: {} {}", publisherName, seriesName);
    return this.opdsNavigationService.getVolumeFeedForPublisherAndSeries(
        publisherName, seriesName, unread);
  }

  /**
   * Retrieves an acquisition feed for the given publisher, series and volume.
   *
   * @param principal the user principal
   * @param unread the unread flag
   * @param publisher the publisher name
   * @param series the series name
   * @param volume the volume
   * @return the feed
   */
  @GetMapping(
      value = "/opds/collections/publishers/{publisher}/series/{series}/volumes/{volume}",
      produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  OPDSAcquisitionFeed getComicFeedsForPublisherAndSeriesAndVolume(
      final Principal principal,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread,
      @PathVariable("publisher") @NonNull final String publisher,
      @PathVariable("series") @NonNull final String series,
      @PathVariable("volume") @NonNull final String volume) {
    final String email = principal.getName();
    final String publisherName = this.opdsUtils.urlDecodeString(publisher);
    final String seriesName = this.opdsUtils.urlDecodeString(series);
    final String volumeName = this.opdsUtils.urlDecodeString(volume);
    log.info(
        "Getting all comics for volume: {} {} {} v{}",
        email,
        publisherName,
        seriesName,
        volumeName);
    return this.opdsAcquisitionService.getComicFeedsForPublisherAndSeriesAndVolume(
        publisherName, seriesName, volumeName, email, unread);
  }
}
