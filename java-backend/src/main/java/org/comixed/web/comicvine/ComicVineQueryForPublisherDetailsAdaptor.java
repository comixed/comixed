/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import org.comixed.library.model.Comic;
import org.comixed.web.ComicVinePublisherDetailsWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ComicVineQueryForPublisherDetailsAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ObjectFactory<ComicVinePublisherDetailsWebRequest> webRequestFactory;

    @Autowired
    private WebRequestProcessor webRequestProcessor;

    @Autowired
    private ComicVinePublisherDetailsResponseProcessor contentProcessor;

    public void execute(String apiKey, String publisherId, Comic comic) throws ComicVineAdaptorException
    {
        this.logger.debug("Fetching publisher details: publisherId={}", publisherId);

        ComicVinePublisherDetailsWebRequest request = this.webRequestFactory.getObject();

        request.setApiKey(apiKey);
        request.setPublisherId(publisherId);

        try
        {
            byte[] content = this.webRequestProcessor.execute(request);
            this.logger.debug("Retrieved {} bytes of data", content.length);
            this.contentProcessor.process(content, comic);
        }
        catch (WebRequestException error)
        {
            throw new ComicVineAdaptorException("Failed to retrieve publisher details", error);
        }
    }
}
