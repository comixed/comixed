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

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.model.ComicVineVolume;
import org.comixedproject.scrapers.comicvine.model.ComicVineVolumesQueryResponse;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * <code>ComicVineGetVolumesAction</code> retrieves the list of volumes from ComicVine for the given
 * search criteria.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ComicVineGetVolumesAction
    extends AbstractComicVineScrapingAction<List<ScrapingVolume>> {

  @Getter @Setter private String series;
  @Getter @Setter private Integer maxRecords;

  @Override
  public List<ScrapingVolume> execute() throws ScrapingException {
    if (StringUtils.isEmpty(this.getApiKey())) throw new ScrapingException("Missing API key");
    if (StringUtils.isEmpty(this.series)) throw new ScrapingException("Missing series name");
    if (maxRecords == null) throw new ScrapingException("Missing maximum records");

    this.addFilter(NAME_FILTER, this.series);

    this.addField("id");
    this.addField("name");
    this.addField("count_of_issues");
    this.addField("publisher");
    this.addField("start_year");
    this.addField("image");

    this.addParameter(RESOURCES_PARAMETER, "volume");
    this.addParameter(QUERY_PARAMETER, this.series);
    if (maxRecords > 0) this.addParameter(LIMIT_PARAMETER, String.valueOf(this.maxRecords));

    List<ScrapingVolume> result = new ArrayList<>();
    int page = 0;
    boolean done = false;

    while (!done) {
      if (++page > 1) {
        log.debug("Setting page: {}", page);
        this.addParameter(PAGE_PARAMETER, String.valueOf(page));
      }

      log.debug("Creating url for: API key=****{} series={}", this.getMaskedApiKey(), this.series);
      final String url = this.createUrl(this.baseUrl, "search");
      final WebClient client = this.createWebClient(url);
      final Mono<ComicVineVolumesQueryResponse> request =
          client.get().uri(url).retrieve().bodyToMono(ComicVineVolumesQueryResponse.class);
      ComicVineVolumesQueryResponse response = null;

      try {
        response = request.block();
      } catch (Exception error) {
        throw new ScrapingException("Failed to get response", error);
      }

      if (response == null) {
        throw new ScrapingException("Failed to receive a response");
      }
      log.debug(
          "Received: {} volume{}",
          response.getVolumes().size(),
          response.getVolumes().size() == 1 ? "" : "s");

      for (int index = 0; index < response.getVolumes().size(); index++) {
        log.debug("Encoding {} of {}", index + 1, response.getVolumes().size());
        final ComicVineVolume volume = response.getVolumes().get(index);
        final ScrapingVolume entry = new ScrapingVolume();
        entry.setId(volume.getId());
        entry.setName(volume.getName());
        entry.setIssueCount(volume.getIssueCount());
        if (!StringUtils.isEmpty(volume.getPublisher()))
          entry.setPublisher(volume.getPublisher().getName());
        entry.setStartYear(volume.getStartYear());
        entry.setImageURL(volume.getImage().getScreenUrl());
        result.add(entry);

        if (hitMaxRecordLimit(result)) break;
      }

      done =
          (hitMaxRecordLimit(result))
              || (response.getOffset() + response.getNumberOfPageResults())
                  >= response.getNumberOfTotalResults();
    }

    return result;
  }

  private boolean hitMaxRecordLimit(final List<ScrapingVolume> records) {
    return this.maxRecords > 0 && records.size() == this.maxRecords;
  }
}
