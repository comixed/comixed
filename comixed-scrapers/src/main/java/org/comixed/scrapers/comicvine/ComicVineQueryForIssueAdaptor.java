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

package org.comixed.scrapers.comicvine;

import lombok.extern.log4j.Log4j2;
import org.comixed.scrapers.ComicVineIssuesWebRequest;
import org.comixed.scrapers.WebRequestException;
import org.comixed.scrapers.WebRequestProcessor;
import org.comixed.scrapers.model.ScrapingIssue;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ComicVineQueryForIssueAdaptor {
  @Autowired private ObjectFactory<ComicVineIssuesWebRequest> webRequestFactory;
  @Autowired private WebRequestProcessor webRequestProcessor;
  @Autowired private ComicVineIssueResponseProcessor responseProcessor;

  public ScrapingIssue execute(String apiKey, Integer volume, String issueNumber)
      throws ComicVineAdaptorException {
    this.log.debug("Getting issue={} for volume={} ", issueNumber, volume);

    while (!issueNumber.isEmpty()
        && !issueNumber.equals("0")
        && "123456789%ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(issueNumber.toUpperCase().substring(0, 1))
            == -1) {
      issueNumber = issueNumber.substring(1);
    }

    ScrapingIssue result = null;
    ComicVineIssuesWebRequest request = this.webRequestFactory.getObject();

    request.setApiKey(apiKey);
    request.setVolume(volume);
    request.setIssueNumber(issueNumber);

    try {
      String content = this.webRequestProcessor.execute(request);
      result = this.responseProcessor.process(content.getBytes());
    } catch (WebRequestException error) {
      throw new ComicVineAdaptorException("Error getting issues for volume", error);
    }

    if (result != null) {
      this.log.debug("Returning an issue");
    } else {
      this.log.debug("No comic found");
    }

    return result;
  }
}
