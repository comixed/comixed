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
import org.comixedproject.controller.ComiXedControllerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.net.ComicScrapeRequest;
import org.comixedproject.net.GetScrapingIssueRequest;
import org.comixedproject.net.GetVolumesRequest;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.adaptors.ComicVineScrapingAdaptor;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ComicVineScraperController</code> processes REST APIs relating to scraping comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/api/scraping")
@Log4j2
public class ComicVineScraperController {
  @Autowired private ComicVineScrapingAdaptor scrapingAdaptor;
  @Autowired private ComicService comicService;

  /**
   * Retrieves the minimal {@link ScrapingIssue} for the specified issue of the given volume.
   *
   * @param volume the volume id
   * @param request the request body
   * @return the issue
   * @throws ComiXedControllerException if an error occurs
   */
  @PostMapping(
      value = "/volumes/{volume}/issues",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public ScrapingIssue queryForIssue(
      @PathVariable("volume") final Integer volume,
      @RequestBody() final GetScrapingIssueRequest request)
      throws ComiXedControllerException {
    String issue = request.getIssueNumber();
    boolean skipCache = request.isSkipCache();
    String apiKey = request.getApiKey();

    log.info(
        "Preparing to retrieve issue={} for volume={} (skipCache={})", issue, volume, skipCache);

    try {
      return this.scrapingAdaptor.getIssue(apiKey, volume, issue, skipCache);
    } catch (ScrapingException error) {
      throw new ComiXedControllerException("Failed to get single scraping issue", error);
    }
  }

  /**
   * Retrieves the list of potential volumes for the given series name.
   *
   * @param request the reqwuest body
   * @return the list of volumes
   * @throws ComiXedControllerException if an error occurs
   */
  @PostMapping(
      value = "/volumes",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public List<ScrapingVolume> queryForVolumes(@RequestBody() final GetVolumesRequest request)
      throws ComiXedControllerException {
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
          this.scrapingAdaptor.getVolumes(apiKey, series, maxRecords, skipCache);

      log.debug("Returning {} volume{}", result.size(), result.size() == 1 ? "" : "s");

      return result;
    } catch (ScrapingException error) {
      throw new ComiXedControllerException("Failed to get list of volumes", error);
    }
  }

  /**
   * Scrapes a single {@link Comic} using the specified source issue.
   *
   * @param comicId the comic id
   * @param issueId the issue id
   * @param request the request body
   * @return the scraped and updaed {@link Comic}
   * @throws ComiXedControllerException if an error occurs
   */
  @PostMapping(
      value = "/comics/{comicId}/issue/{issueId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicDetails.class)
  public Comic scrapeAndSaveComicDetails(
      @PathVariable("comicId") final Long comicId,
      @PathVariable("issueId") final String issueId,
      @RequestBody() final ComicScrapeRequest request)
      throws ComiXedControllerException {
    boolean skipCache = request.getSkipCache();
    String apiKey = request.getApiKey();

    log.info("Scraping code: id={} issue id={} (skip cache={})", comicId, issueId, apiKey);

    log.debug("Loading comic");
    Comic comic = null;
    try {
      comic = this.comicService.getComic(comicId);
    } catch (ComicException error) {
      throw new ComiXedControllerException("Failed to load comic", error);
    }

    try {
      log.debug("Scraping comic details");
      this.scrapingAdaptor.scrapeComic(apiKey, issueId, skipCache, comic);

      log.debug("Saving updated comic");
      this.comicService.save(comic);

      return comic;
    } catch (ScrapingException error) {
      throw new ComiXedControllerException("Failed to scrape comic", error);
    }
  }
}
