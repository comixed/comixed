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

package org.comixed.web.comicvine;

import java.util.ArrayList;
import java.util.List;

import org.comixed.web.ComicVineQueryWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.comixed.web.model.ComicVolume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ComicVineQueryForVolumesAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private WebRequestProcessor webRequestProcessor;

    @Autowired
    private ObjectFactory<ComicVineQueryWebRequest> webRequestFactory;

    @Autowired
    private ComicVineVolumesReponseProcessor responseProcessor;

    public List<ComicVolume> execute(String apiKey, String name) throws ComicVineAdaptorException
    {
        this.logger.debug("Preparing to query volumes: name={} API key={}", name, apiKey);

        List<ComicVolume> result = new ArrayList<>();
        boolean done = false;
        int page = 0;

        while (!done)
        {
            ComicVineQueryWebRequest request = this.webRequestFactory.getObject();
            page++;
            // ComicVine bug: CVS said there's an issue when setting page to 1
            if (page > 1)
            {
                this.logger.debug("Setting page to {}", page);
                request.setPage(page);
            }

            try
            {
                byte[] response = this.webRequestProcessor.execute(request);
                done = this.responseProcessor.process(result, response);
                this.logger.debug("More pages to fetch? {}", (done ? "No" : "Yes"));

            }
            catch (WebRequestException error)
            {
                throw new ComicVineAdaptorException("unable to query for volumes", error);
            }
        }

        this.logger.debug("Returning {} volumes", result.size());

        return result;
    }
}
