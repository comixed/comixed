/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.actions;

import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * <code>AbstractScrapingAction</code> provides a foundation for creating concrete {@link
 * ScrapingAction} types.
 *
 * @param <T> the result for the action
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractScrapingAction<T> implements ScrapingAction<T> {
  /**
   * Creates a consistent {@link WebClient} instance to use for requests.
   *
   * @param url the url
   * @return the instance
   */
  protected WebClient createWebClient(final String url) {
    log.debug("Creating web client: url={}", url);
    return WebClient.builder()
        .baseUrl(url)
        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
        .defaultHeaders(
            headers -> {
              headers.add(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
              headers.add(HttpHeaders.USER_AGENT, "ComiXed/0.7");
            })
        .build();
  }
}
