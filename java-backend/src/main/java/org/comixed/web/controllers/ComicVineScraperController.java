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

package org.comixed.web.controllers;

import java.util.List;

import org.comixed.library.model.Comic;
import org.comixed.library.model.View.ComicDetails;
import org.comixed.repositories.ComicRepository;
import org.comixed.web.WebRequestException;
import org.comixed.web.comicvine.ComicVineAdaptorException;
import org.comixed.web.comicvine.ComicVineQueryForIssueAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForIssueDetailsAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForPublisherDetailsAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForVolumeDetailsAdaptor;
import org.comixed.web.comicvine.ComicVineQueryForVolumesAdaptor;
import org.comixed.web.model.ComicIssue;
import org.comixed.web.model.ComicVolume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonView;

@RestController
@RequestMapping("/api/scraper")
public class ComicVineScraperController
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicVineQueryForVolumesAdaptor queryForVolumesAdaptor;

    @Autowired
    private ComicVineQueryForIssueAdaptor queryForIssuesAdaptor;

    @Autowired
    private ComicVineQueryForIssueDetailsAdaptor queryForIssueDetailsAdaptor;

    @Autowired
    private ComicVineQueryForVolumeDetailsAdaptor queryForVolumeDetailsAdaptor;

    @Autowired
    private ComicVineQueryForPublisherDetailsAdaptor queryForPublisherDetailsAdaptor;

    @Autowired
    private ComicRepository comicRepository;

    @RequestMapping(value = "/query/issue",
                    method = RequestMethod.POST)
    public ComicIssue queryForIssue(@RequestParam("api_key") String apiKey,
                                    @RequestParam("volume") String volume,
                                    @RequestParam("issue_number") String issueNumber) throws ComicVineAdaptorException
    {
        this.logger.debug("Preparing to retrieve issue={} for volume={}", issueNumber, volume);

        return this.queryForIssuesAdaptor.execute(apiKey, volume, issueNumber);
    }

    @RequestMapping(value = "/query/volumes",
                    method = RequestMethod.POST)
    public List<ComicVolume> queryForVolumes(@RequestParam("api_key") String apiKey,
                                             @RequestParam("series_name") String seriesName,
                                             @RequestParam("volume") String volume,
                                             @RequestParam("issue_number") String issueNumber,
                                             @RequestParam("skip_cache") boolean skipCache) throws WebRequestException,
                                                                                            ComicVineAdaptorException
    {
        this.logger.debug("Preparing to retrieve issues for the given series: {} skipCache={}", seriesName,
                          skipCache ? "yes" : "no");

        List<ComicVolume> result = this.queryForVolumesAdaptor.execute(apiKey, seriesName, skipCache);

        this.logger.debug("Returning {} volumes", result.size());

        return result;
    }

    @RequestMapping(value = "/save")
    @JsonView(ComicDetails.class)
    public Comic scrapeAndSaveComicDetails(@RequestParam("api_key") String apiKey,
                                           @RequestParam("comic_id") long comicId,
                                           @RequestParam("issue_id") String issueId,
                                           @RequestParam("skip_cache") boolean skipCache) throws ComicVineAdaptorException
    {
        this.logger.debug("Preparing to retrieve details for comic: id={} issue={}", comicId, issueId);

        Comic result = this.comicRepository.findOne(comicId);

        if (result != null)
        {
            this.logger.debug("Fetching details for comic");
            String volumeId = this.queryForIssueDetailsAdaptor.execute(apiKey, comicId, issueId, result, skipCache);
            this.logger.debug("Fetching details for volume");
            String publisherId = this.queryForVolumeDetailsAdaptor.execute(apiKey, volumeId, result, skipCache);
            this.logger.debug("Fetching publisher details");
            this.queryForPublisherDetailsAdaptor.execute(apiKey, publisherId, result, skipCache);
            this.logger.debug("Updating details for comic in database");
            result = this.comicRepository.save(result);
        }
        else
        {
            this.logger.debug("No such comic found");
        }

        return result;
    }
}
