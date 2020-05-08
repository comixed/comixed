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

package org.comixed.controller.scraping;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixed.model.comic.Comic;
import org.comixed.net.ComicScrapeRequest;
import org.comixed.net.GetScrapingIssueRequest;
import org.comixed.net.GetVolumesRequest;
import org.comixed.service.comic.ComicException;
import org.comixed.service.comic.ComicService;
import org.comixed.views.View;
import org.comixed.web.WebRequestException;
import org.comixed.web.comicvine.*;
import org.comixed.web.model.ScrapingIssue;
import org.comixed.web.model.ScrapingVolume;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scraping")
@Log4j2
public class ComicVineScraperController {
  @Autowired private ComicVineQueryForVolumesAdaptor queryForVolumesAdaptor;
  @Autowired private ComicVineQueryForIssueAdaptor queryForIssuesAdaptor;
  @Autowired private ComicVineQueryForIssueDetailsAdaptor queryForIssueDetailsAdaptor;
  @Autowired private ComicVineQueryForVolumeDetailsAdaptor queryForVolumeDetailsAdaptor;
  @Autowired private ComicVineQueryForPublisherDetailsAdaptor queryForPublisherDetailsAdaptor;
  @Autowired private ComicService comicService;

  @PostMapping(
      value = "/volumes/{volume}/issues",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public ScrapingIssue queryForIssue(
      @PathVariable("volume") final Integer volume,
      @RequestBody() final GetScrapingIssueRequest request)
      throws ComicVineAdaptorException {
    String issue = request.getIssueNumber();
    boolean skipCache = request.isSkipCache();
    this.log.info(
        "Preparing to retrieve issue={} for volume={} (skipCache={})", issue, volume, skipCache);

    return this.queryForIssuesAdaptor.execute(request.getApiKey(), volume, issue);
  }

  @PostMapping(
      value = "/volumes",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public List<ScrapingVolume> queryForVolumes(@RequestBody() final GetVolumesRequest request)
      throws WebRequestException, ComicVineAdaptorException {
    String series = request.getSeries();
    this.log.info(
        "Getting volumes: series={}{}", series, request.getSkipCache() ? " (Skipping cache)" : "");

    return this.queryForVolumesAdaptor.execute(request.getApiKey(), series, request.getSkipCache());
  }

  @PostMapping(
      value = "/comics/{comicId}/issue/{issueId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicDetails.class)
  public Comic scrapeAndSaveComicDetails(
      @PathVariable("comicId") final Long comicId,
      @PathVariable("issueId") final String issueId,
      @RequestBody() final ComicScrapeRequest request)
      throws ComicVineAdaptorException, ComicException {
    this.log.info(
        "Scraping code: id={} issue id={} (skip cache={})",
        comicId,
        issueId,
        request.getSkipCache());

    this.log.debug("Loading comic");
    Comic comic = this.comicService.getComic(comicId);

    this.log.debug("Fetching details for comic");
    String volumeId =
        this.queryForIssueDetailsAdaptor.execute(
            request.getApiKey(), comicId, issueId, comic, request.getSkipCache());
    this.log.debug("Fetching details for volume");
    String publisherId =
        this.queryForVolumeDetailsAdaptor.execute(
            request.getApiKey(), volumeId, comic, request.getSkipCache());
    this.log.debug("Fetching publisher details");
    this.queryForPublisherDetailsAdaptor.execute(
        request.getApiKey(), publisherId, comic, request.getSkipCache());

    this.log.debug("Updating details for comic in database");
    return this.comicService.save(comic);
  }
}
