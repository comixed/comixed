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

import org.comixed.model.library.Comic;
import org.comixed.model.scraping.ComicVinePublisher;
import org.comixed.repositories.ComicVinePublisherRepository;
import org.comixed.web.ComicVinePublisherDetailsWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ComicVineQueryForPublisherDetailsAdaptor {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ObjectFactory<ComicVinePublisherDetailsWebRequest> webRequestFactory;

  @Autowired private WebRequestProcessor webRequestProcessor;

  @Autowired private ComicVinePublisherDetailsResponseProcessor contentProcessor;

  @Autowired private ComicVinePublisherRepository comicVinePublisherRepository;

  public void execute(String apiKey, String publisherId, Comic comic, boolean skipCache)
      throws ComicVineAdaptorException {
    this.logger.debug("Fetching publisher details: publisherId={}", publisherId);

    ComicVinePublisher publisher = null;
    String content = null;

    publisher = this.comicVinePublisherRepository.findByPublisherId(publisherId);

    if (skipCache || (publisher == null)) {
      this.logger.debug("Fetching publisher details from ComicVine...");

      ComicVinePublisherDetailsWebRequest request = this.webRequestFactory.getObject();

      request.setApiKey(apiKey);
      request.setPublisherId(publisherId);

      try {
        content = this.webRequestProcessor.execute(request);

        if (publisher != null) {
          this.comicVinePublisherRepository.delete(publisher);
        }

        this.logger.debug("Saving retrieved publisher data...");
        publisher = new ComicVinePublisher();
        publisher.setPublisherId(publisherId);
        publisher.setContent(content);
        this.comicVinePublisherRepository.save(publisher);
      } catch (WebRequestException error) {
        throw new ComicVineAdaptorException("Failed to retrieve publisher details", error);
      }
    } else {
      this.logger.debug("Publisher found in database.");
      content = publisher.getContent();
    }

    this.contentProcessor.process(content.getBytes(), comic);
  }
}
