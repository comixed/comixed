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
import org.comixed.service.library.ComicException;
import org.comixed.service.library.ComicService;
import org.comixed.views.View;
import org.comixed.web.WebRequestException;
import org.comixed.web.comicvine.*;
import org.comixed.web.model.ComicIssue;
import org.comixed.web.model.ComicVolume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/scraper")
public class ComicVineScraperController {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicVineQueryForVolumesAdaptor queryForVolumesAdaptor;
    @Autowired private ComicVineQueryForIssueAdaptor queryForIssuesAdaptor;
    @Autowired private ComicVineQueryForIssueDetailsAdaptor queryForIssueDetailsAdaptor;
    @Autowired private ComicVineQueryForVolumeDetailsAdaptor queryForVolumeDetailsAdaptor;
    @Autowired private ComicVineQueryForPublisherDetailsAdaptor queryForPublisherDetailsAdaptor;
    @Autowired private ComicService comicService;

    @RequestMapping(value = "/query/issue",
                    method = RequestMethod.POST)
    public ComicIssue queryForIssue(
            @RequestParam("api_key")
                    String apiKey,
            @RequestParam("volume")
                    String volume,
            @RequestParam("issue_number")
                    String issueNumber)
            throws
            ComicVineAdaptorException {
        this.logger.debug("Preparing to retrieve issue={} for volume={}",
                          issueNumber,
                          volume);

        return this.queryForIssuesAdaptor.execute(apiKey,
                                                  volume,
                                                  issueNumber);
    }

    @RequestMapping(value = "/query/volumes",
                    method = RequestMethod.POST)
    public List<ComicVolume> queryForVolumes(
            @RequestParam("api_key")
                    String apiKey,
            @RequestParam("series_name")
                    String seriesName,
            @RequestParam("volume")
                    String volume,
            @RequestParam("issue_number")
                    String issueNumber,
            @RequestParam("skip_cache")
                    boolean skipCache)
            throws
            WebRequestException,
            ComicVineAdaptorException {
        this.logger.debug("Preparing to retrieve issues for the given series: {} skipCache={}",
                          seriesName,
                          skipCache
                          ? "yes"
                          : "no");

        List<ComicVolume> result = this.queryForVolumesAdaptor.execute(apiKey,
                                                                       seriesName,
                                                                       skipCache);

        this.logger.debug("Returning {} volumes",
                          result.size());

        return result;
    }

    @PostMapping(value = "/save",
                 produces = "application/json",
                 consumes = "application/json")
    @JsonView(View.ComicDetails.class)
    public Comic scrapeAndSaveComicDetails(
            @RequestBody()
            final ComicScrapeRequest request)
            throws
            ComicVineAdaptorException,
            ComicException {
        this.logger.info("Scraping code: id={} issue id={}",
                         request.getComicId(),
                         request.getIssueId());

        this.logger.debug("Loading comic");
        Comic comic = this.comicService.getComic(request.getComicId());

        this.logger.debug("Fetching details for comic");
        String volumeId = this.queryForIssueDetailsAdaptor.execute(request.getApiKey(),
                                                                   request.getComicId(),
                                                                   request.getIssueId(),
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
