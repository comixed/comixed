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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.controller.scraping;

import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.model.library.Comic;
import org.comixed.net.ComicScrapeRequest;
import org.comixed.net.GetScrapingIssueRequest;
import org.comixed.net.GetVolumesRequest;
import org.comixed.service.library.ComicException;
import org.comixed.service.library.ComicService;
import org.comixed.views.View;
import org.comixed.web.WebRequestException;
import org.comixed.web.comicvine.*;
import org.comixed.web.model.ScrapingIssue;
import org.comixed.web.model.ScrapingVolume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scraping")
public class ComicVineScraperController {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicVineQueryForVolumesAdaptor queryForVolumesAdaptor;
    @Autowired private ComicVineQueryForIssueAdaptor queryForIssuesAdaptor;
    @Autowired private ComicVineQueryForIssueDetailsAdaptor queryForIssueDetailsAdaptor;
    @Autowired private ComicVineQueryForVolumeDetailsAdaptor queryForVolumeDetailsAdaptor;
    @Autowired private ComicVineQueryForPublisherDetailsAdaptor queryForPublisherDetailsAdaptor;
    @Autowired private ComicService comicService;

    @PostMapping(value = "/volumes/{volume}/issues/{issue}",
                 produces = "application/json",
                 consumes = "application/json")
    public ScrapingIssue queryForIssue(
            @PathVariable("volume")
            final Integer volume,
            @PathVariable("issue")
            final String issue,
            @RequestBody()
            final GetScrapingIssueRequest request)
            throws
            ComicVineAdaptorException {
        this.logger.info("Preparing to retrieve issue={} for volume={} (skipCache={})",
                         issue,
                         volume,
                         request.isSkipCache());

        return this.queryForIssuesAdaptor.execute(request.getApiKey(),
                                                  volume,
                                                  issue);
    }

    @PostMapping(value = "/series/{seriesName}",
                 produces = "application/json",
                 consumes = "application/json")
    public List<ScrapingVolume> queryForVolumes(
            @PathVariable("seriesName")
            final String seriesName,
            @RequestBody()
            final GetVolumesRequest request)
            throws
            WebRequestException,
            ComicVineAdaptorException {
        this.logger.info("Getting volumes: series={}{}",
                         seriesName,
                         request.getSkipCache()
                         ? " (Skipping cache)"
                         : "");

        return this.queryForVolumesAdaptor.execute(request.getApiKey(),
                                                   seriesName,
                                                   request.getSkipCache());
    }

    @PostMapping(value = "/comics/{comicId}/issue/{issueId}",
                 produces = "application/json",
                 consumes = "application/json")
    @JsonView(View.ComicDetails.class)
    public Comic scrapeAndSaveComicDetails(
            @PathVariable("comicId")
            final Long comicId,
            @PathVariable("issueId")
            final String issueId,
            @RequestBody()
            final ComicScrapeRequest request)
            throws
            ComicVineAdaptorException,
            ComicException {
        this.logger.info("Scraping code: id={} issue id={} (skip cache={})",
                         comicId,
                         issueId,
                         request.getSkipCache());

        this.logger.debug("Loading comic");
        Comic comic = this.comicService.getComic(comicId);

        this.logger.debug("Fetching details for comic");
        String volumeId = this.queryForIssueDetailsAdaptor.execute(request.getApiKey(),
                                                                   comicId,
                                                                   issueId,
                                                                   comic,
                                                                   request.getSkipCache());
        this.logger.debug("Fetching details for volume");
        String publisherId = this.queryForVolumeDetailsAdaptor.execute(request.getApiKey(),
                                                                       volumeId,
                                                                       comic,
                                                                       request.getSkipCache());
        this.logger.debug("Fetching publisher details");
        this.queryForPublisherDetailsAdaptor.execute(request.getApiKey(),
                                                     publisherId,
                                                     comic,
                                                     request.getSkipCache());

        this.logger.debug("Updating details for comic in database");
        return this.comicService.save(comic);
    }
}
