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

package org.comixedproject.reader.rest;

import static org.comixedproject.reader.rest.LibraryReaderController.API_ROOT;

import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.reader.ReaderUtil;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>PublisherReaderController</code> provides endpoints for loading directories relating to
 * series.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class SeriesReaderController {
  public static final String ALL_SERIES_URL = API_ROOT + "/collections/series";
  @Autowired private DirectoryReaderService directoryReaderService;

  /**
   * Returns all series If the unread parameter is present then only those publishers with unread
   * comics are returned.
   *
   * @param principal the user principal
   * @param unreadParam the unread flag
   * @return the publishers
   */
  @GetMapping(value = ALL_SERIES_URL, produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-series")
  public LoadDirectoryResponse getAllSeries(
      final Principal principal,
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam) {
    final String email = principal.getName();
    final boolean unread = Boolean.parseBoolean(unreadParam);
    log.info("Loading all series: email={} unread={}", email, unread);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result.getContents().addAll(directoryReaderService.getAllSeries(email, unread, ALL_SERIES_URL));
    return result;
  }

  /**
   * Returns all series for a given publisher. If the unread parameter is present then only those
   * series with unread comics are returned.
   *
   * @param principal the user principal
   * @param seriesParam the series
   * @param unreadParam the unread flag
   * @return the publishers
   */
  @GetMapping(
      value = API_ROOT + "/collections/series/{series}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-series-for-publisher")
  public LoadDirectoryResponse getPublishersForSeries(
      final Principal principal,
      @PathVariable("series") final String seriesParam,
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam) {
    final String email = principal.getName();
    final String series = ReaderUtil.urlDecode(seriesParam);
    final boolean unread = Boolean.parseBoolean(unreadParam);
    log.info("Loading publishers for series: email={} unread={} series={}", email, unread, series);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .addAll(
            directoryReaderService.getAllPublishersForSeries(
                email,
                unread,
                series,
                String.format(
                    "%s/%s/publishers", ALL_SERIES_URL, ReaderUtil.urlEncode(seriesParam))));
    return result;
  }

  /**
   * Returns all volumes for a given publisher and series. If the unread parameter is present then
   * only those publishers with unread comics are returned.
   *
   * @param principal the user principal
   * @param publisherParam the publisher's name
   * @param seriesParam the series' name
   * @param unreadParam the unread flag
   * @return the publishers
   */
  @GetMapping(
      value = API_ROOT + "/collections/publishers/{publisher}/series/{series}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-volumes-for-publisher-series")
  public LoadDirectoryResponse getVolumesForPublisherAndSeries(
      final Principal principal,
      @PathVariable("publisher") final String publisherParam,
      @PathVariable("series") final String seriesParam,
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam) {
    final String email = principal.getName();
    final String publisher = ReaderUtil.urlDecode(publisherParam);
    final String series = ReaderUtil.urlDecode(seriesParam);
    final boolean unread = Boolean.parseBoolean(unreadParam);
    log.info(
        "Loading volumes for publisher and series: email={} unread={} publisher={} series={}",
        email,
        unread,
        publisher,
        series);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .addAll(
            directoryReaderService.getAllVolumesForPublisherAndSeries(
                email,
                unread,
                publisher,
                series,
                String.format(
                    "%s/%s/series/%s/volumes",
                    API_ROOT + "/collections/publishers",
                    ReaderUtil.urlEncode(publisherParam),
                    ReaderUtil.urlEncode(seriesParam))));
    return result;
  }

  /**
   * Returns all volumes for a given publisher and series. If the unread parameter is present then
   * only those publishers with unread comics are returned.
   *
   * @param principal the user principal
   * @param publisherParam the publisher's name
   * @param seriesParam the series' name
   * @param unreadParam the unread flag
   * @return the publishers
   */
  @GetMapping(
      value = API_ROOT + "/collections/series/{series}/publishers/{publisher}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-volumes-for-publisher-series")
  public LoadDirectoryResponse getVolumesForSeriesAndPublisher(
      final Principal principal,
      @PathVariable("series") final String seriesParam,
      @PathVariable("publisher") final String publisherParam,
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam) {
    final String email = principal.getName();
    final String series = ReaderUtil.urlDecode(seriesParam);
    final String publisher = ReaderUtil.urlDecode(publisherParam);
    final boolean unread = Boolean.parseBoolean(unreadParam);
    log.info(
        "Loading volumes for series and publisher: email={} unread={} series={} publisher={}",
        email,
        unread,
        series,
        publisher);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .addAll(
            directoryReaderService.getAllVolumesForPublisherAndSeries(
                email,
                unread,
                publisher,
                series,
                String.format(
                    "%s/%s/series/%s/volumes",
                    API_ROOT + "/collections/publishers",
                    ReaderUtil.urlEncode(publisher),
                    ReaderUtil.urlEncode(series))));
    return result;
  }
}
