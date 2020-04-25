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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.web.comicvine;

import lombok.extern.log4j.Log4j2;
import org.comixed.model.comic.Comic;
import org.comixed.model.scraping.ComicVineIssue;
import org.comixed.repositories.ComicVineIssueRepository;
import org.comixed.web.ComicVineIssueDetailsWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ComicVineQueryForIssueDetailsAdaptor {
  @Autowired private ObjectFactory<ComicVineIssueDetailsWebRequest> webRequestFactory;
  @Autowired private WebRequestProcessor webRequestProcessor;
  @Autowired private ComicVineIssueDetailsResponseProcessor responseProcessor;
  @Autowired private ComicVineIssueRepository comicVineIssueRepository;

  public String execute(String apiKey, long comicId, String issueId, Comic comic, boolean skipCache)
      throws ComicVineAdaptorException {
    String result = null;
    String content = null;
    ComicVineIssue issue = null;

    this.log.debug("Fetching issue details: issueId={}", issueId);

    issue = this.comicVineIssueRepository.findByIssueId(issueId);

    if (skipCache || (issue == null)) {
      this.log.debug("Fetching issue details from ComicVine...");

      ComicVineIssueDetailsWebRequest request = this.webRequestFactory.getObject();

      request.setApiKey(apiKey);
      request.setIssueNumber(issueId);

      try {
        content = this.webRequestProcessor.execute(request);

        if (issue != null) {
          this.comicVineIssueRepository.delete(issue);
        }
        this.log.debug("Saving retrieved issue data...");
        issue = new ComicVineIssue();
        issue.setIssueId(issueId);
        issue.setContent(content);
        this.comicVineIssueRepository.save(issue);
      } catch (WebRequestException error) {
        throw new ComicVineAdaptorException("Failed to scrape comic details", error);
      }
    } else {
      this.log.debug("Issue found in database.");
      content = issue.getContent();
    }

    result = this.responseProcessor.process(content.getBytes(), comic);

    return result;
  }
}
