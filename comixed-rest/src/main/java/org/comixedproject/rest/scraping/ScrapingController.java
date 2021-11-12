/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixedproject.rest.scraping;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.net.library.LoadScrapingIssueRequest;
import org.comixedproject.model.net.library.LoadScrapingVolumesRequest;
import org.comixedproject.model.net.library.ScrapeComicRequest;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.scraping.ScrapingService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ScrapingController</code> processes REST APIs relating to scraping comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ScrapingController {
  @Autowired private ScrapingService scrapingService;

  /**
   * Retrieves a single {@link ScrapingIssue} for the specified issue of the given volume and issue
   * number.
   *
   * @param volume the volume id
   * @param issue the issue number
   * @param request the request body
   * @return the issue
   * @throws ScrapingException if an error occurs
   */
  @PostMapping(
      value = "/api/scraping/volumes/{volumeId}/issues/{issueId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint(logRequest = true, logResponse = true)
  public ScrapingIssue loadScrapingIssue(
      @PathVariable("volumeId") final Integer volume,
      @PathVariable("issueId") final String issue,
      @RequestBody() final LoadScrapingIssueRequest request)
      throws ScrapingException {
    boolean skipCache = request.isSkipCache();

    log.info("Getting scraping issue");

    return this.scrapingService.getIssue(volume, issue, skipCache);
  }

  /**
   * Retrieves the list of potential volumes for the given series name.
   *
   * @param request the reqwuest body
   * @return the list of volumes
   * @throws ScrapingException if an error occurs
   */
  @PostMapping(
      value = "/api/scraping/volumes",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint(logRequest = true, logResponse = true)
  public List<ScrapingVolume> loadScrapingVolumes(
      @RequestBody() final LoadScrapingVolumesRequest request) throws ScrapingException {
    String series = request.getSeries();
    final int maxRecords = request.getMaxRecords();
    boolean skipCache = request.getSkipCache();

    log.info("Getting scraping volumes");

    return this.scrapingService.getVolumes(series, maxRecords, skipCache);
  }

  /**
   * Scrapes a single {@link Comic} using the specified source issue.
   *
   * @param comicId the comic id
   * @param request the request body
   * @return the scraped and updated {@link Comic}
   * @throws ScrapingException if an error occurs
   */
  @PostMapping(
      value = "/api/scraping/comics/{comicId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint(
      logRequest = true,
      logResponse = true,
      responseView = View.ComicDetailsView.class)
  @JsonView(View.ComicDetailsView.class)
  public Comic scrapeComic(
      @PathVariable("comicId") final Long comicId, @RequestBody() final ScrapeComicRequest request)
      throws ScrapingException {
    boolean skipCache = request.getSkipCache();
    Integer issueId = request.getIssueId();

    log.info("Scraping comic");
    return this.scrapingService.scrapeComic(comicId, issueId, skipCache);
  }
}
