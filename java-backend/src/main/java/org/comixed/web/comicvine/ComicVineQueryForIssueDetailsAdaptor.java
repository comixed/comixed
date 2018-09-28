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
import org.comixed.web.ComicVineIssueDetailsWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ComicVineQueryForIssueDetailsAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ObjectFactory<ComicVineIssueDetailsWebRequest> webRequestFactory;

    @Autowired
    private WebRequestProcessor webRequestProcessor;

    @Autowired
    private ComicVineIssueDetailsResponseProcessor responseProcessor;

    public String execute(String apiKey, long comicId, String issueId, Comic comic) throws ComicVineAdaptorException
    {
        String result = null;
        ComicVineIssueDetailsWebRequest request = this.webRequestFactory.getObject();

        request.setApiKey(apiKey);
        request.setIssueNumber(issueId);

        this.logger.debug("Fetching details for comic: issueId={}", issueId);

        try
        {
            byte[] content = this.webRequestProcessor.execute(request);
            this.logger.debug("Retrieved {} bytes", content != null ? content.length : 0);
            result = this.responseProcessor.process(content, comic);

        }
        catch (WebRequestException error)
        {
            throw new ComicVineAdaptorException("Failed to scrape comic details", error);
        }

        return result;
    }
}
