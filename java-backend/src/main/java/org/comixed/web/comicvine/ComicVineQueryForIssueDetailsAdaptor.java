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
import org.comixed.library.model.comicvine.ComicVineIssue;
import org.comixed.repositories.ComicVineIssueRepository;
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

    @Autowired
    private ComicVineIssueRepository comicVineIssueRepository;

    public String execute(String apiKey,
                          long comicId,
                          String issueId,
                          Comic comic,
                          boolean skipCache) throws ComicVineAdaptorException
    {
        String result = null;
        String content = null;
        ComicVineIssue issue = null;

        this.logger.debug("Fetching issue details: issueId={}", issueId);

        if (skipCache)
        {
            this.logger.debug("Bypassing the cache...");
        }
        else
        {
            issue = this.comicVineIssueRepository.findByIssueId(issueId);
        }

        if (issue == null)
        {
            this.logger.debug("Fetching issue details from ComicVine...");

            ComicVineIssueDetailsWebRequest request = this.webRequestFactory.getObject();

            request.setApiKey(apiKey);
            request.setIssueNumber(issueId);

            try
            {
                content = this.webRequestProcessor.execute(request);
                this.logger.debug("Saving retrieved issue data...");
                if (issue == null)
                {
                    issue = new ComicVineIssue();
                }
                issue.setIssueId(issueId);
                issue.setContent(content);
                this.comicVineIssueRepository.save(issue);
            }
            catch (WebRequestException error)
            {
                throw new ComicVineAdaptorException("Failed to scrape comic details", error);
            }
        }
        else
        {
            this.logger.debug("Issue found in database.");
            content = issue.getContent();
        }

        result = this.responseProcessor.process(content.getBytes(), comic);

        return result;
    }
}
