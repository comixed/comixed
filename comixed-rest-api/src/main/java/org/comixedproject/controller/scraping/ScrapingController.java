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

package org.comixedproject.controller.scraping;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.model.net.ComicScrapeRequest;
import org.comixedproject.model.net.GetScrapingIssueRequest;
import org.comixedproject.model.net.GetVolumesRequest;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.scraping.ScrapingService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ScrapingController</code> processes REST APIs relating to scraping comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/api/scraping")
@Log4j2
public class ScrapingController {
  @Autowired private ScrapingService scrapingService;

  /**
   * Retrieves the minimal {@link ScrapingIssue} for the specified issue of the given volume.
   *
   * @param volume the volume id
   * @param request the request body
   * @return the issue
   */
  @PostMapping(
      value = "/volumes/{volume}/issues",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public ApiResponse<ScrapingIssue> queryForIssue(
      @PathVariable("volume") final Integer volume,
      @RequestBody() final GetScrapingIssueRequest request) {
    final ApiResponse<ScrapingIssue> result = new ApiResponse<>();
    String issue = request.getIssueNumber();
    boolean skipCache = request.isSkipCache();
    String apiKey = request.getApiKey();

    log.info(
        "Preparing to retrieve issue={} for volume={} (skipCache={})", issue, volume, skipCache);

    try {
      final ScrapingIssue scrapingIssue =
          this.scrapingService.getIssue(apiKey, volume, issue, skipCache);
      result.setResult(scrapingIssue);
      result.setSuccess(true);
    } catch (ScrapingException error) {
      result.setSuccess(false);
      result.setError(error.getMessage());
      result.setThrowable(error);
    }

    return result;
  }

  /**
   * Retrieves the list of potential volumes for the given series name.
   *
   * @param request the reqwuest body
   * @return the list of volumes
   */
  @PostMapping(
      value = "/volumes",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public ApiResponse<List<ScrapingVolume>> queryForVolumes(
      @RequestBody() final GetVolumesRequest request) {
    final ApiResponse<List<ScrapingVolume>> response = new ApiResponse<>();
    String apiKey = request.getApiKey();
    boolean skipCache = request.getSkipCache();
    String series = request.getSeries();
    final Integer maxRecords = request.getMaxRecords();

    log.info(
        "Getting volumes: series={} (max records={}) {}",
        series,
        maxRecords,
        skipCache ? "(Skipping cache)" : "");

    try {
      final List<ScrapingVolume> result =
          this.scrapingService.getVolumes(apiKey, series, maxRecords, skipCache);

      log.debug("Returning {} volume{}", result.size(), result.size() == 1 ? "" : "s");

      response.setSuccess(true);
      response.setResult(result);
    } catch (ScrapingException error) {
      response.setSuccess(false);
      response.setThrowable(error);
      response.setError(error.getMessage());
    }

    return response;
  }

  /**
   * Scrapes a single {@link Comic} using the specified source issue.
   *
   * @param comicId the comic id
   * @param issueId the issue id
   * @param request the request body
   * @return the scraped and updated {@link Comic}
   */
  @PostMapping(
      value = "/comics/{comicId}/issue/{issueId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicDetails.class)
  public ApiResponse<Comic> scrapeAndSaveComicDetails(
      @PathVariable("comicId") final Long comicId,
      @PathVariable("issueId") final Integer issueId,
      @RequestBody() final ComicScrapeRequest request) {
    final ApiResponse<Comic> response = new ApiResponse<>();
    boolean skipCache = request.getSkipCache();
    String apiKey = request.getApiKey();

    log.info("Scraping code: id={} issue id={} (skip cache={})", comicId, issueId, apiKey);

    try {
      log.debug("Scraping comic details");
      final Comic result = this.scrapingService.scrapeComic(apiKey, comicId, issueId, skipCache);
      response.setSuccess(true);
      response.setResult(result);
    } catch (ScrapingException error) {
      response.setSuccess(false);
      response.setError(error.getMessage());
      response.setThrowable(error);
    }

    return response;
  }
}
