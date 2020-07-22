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

package org.comixedproject.scrapers.comicvine.actions;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.model.ComicVineGetVolumeDetailsResponse;
import org.comixedproject.scrapers.comicvine.model.ComicVineVolume;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * <code>ComicVineGetVolumeDetailsAction</code> gets the full set of details for a single volume.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ComicVineGetVolumeDetailsAction
    extends AbstractComicVineScrapingAction<ComicVineVolume> {
  @Getter @Setter private String apiUrl;

  @Override
  public ComicVineVolume execute() throws ScrapingException {
    this.addField("name");
    this.addField("start_year");
    this.addField("api_detail_url");
    this.addField("publisher");

    if (StringUtils.isEmpty(this.getApiKey())) throw new ScrapingException("Missing API key");
    if (StringUtils.isEmpty(this.apiUrl)) throw new ScrapingException("Missing details URL");

    log.debug(
        "Querying ComicVine for volume: url={} API key={}", this.apiUrl, this.getMaskedApiKey());

    final String url = this.createUrl(this.apiUrl);
    final WebClient client = this.createWebClient(url);

    final Mono<ComicVineGetVolumeDetailsResponse> request =
        client.get().uri(url).retrieve().bodyToMono(ComicVineGetVolumeDetailsResponse.class);
    ComicVineGetVolumeDetailsResponse response = null;

    try {
      response = request.block();
    } catch (Exception error) {
      throw new ScrapingException("failed to get issue details", error);
    }

    return response.getResults();
  }
}
