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

import org.comixed.web.WebRequestException;
import org.comixed.web.comicvine.ComicVineAdaptorException;
import org.comixed.web.comicvine.ComicVineQueryForVolumesAdaptor;
import org.comixed.web.model.ComicVolume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scraper")
public class ComicScraperController
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicVineQueryForVolumesAdaptor comicVineQueryForVolumesAdaptor;

    @RequestMapping(value = "/query",
                    method = RequestMethod.POST)
    public List<ComicVolume> queryForIssues(@RequestParam("api_key") String apiKey,
                                            @RequestParam("series_name") String seriesName) throws WebRequestException,
                                                                                            ComicVineAdaptorException
    {
        this.logger.debug("Preparing to retrieve issues for the given series: {}", seriesName);

        return this.comicVineQueryForVolumesAdaptor.execute(apiKey, seriesName);
    }
}
