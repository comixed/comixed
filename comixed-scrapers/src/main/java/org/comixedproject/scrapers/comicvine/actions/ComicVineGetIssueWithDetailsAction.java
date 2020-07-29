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
import org.comixedproject.scrapers.comicvine.model.ComicVineGetIssueDetailsResponse;
import org.comixedproject.scrapers.comicvine.model.ComicVineIssue;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * <code>ComicVineGetIssueDetailsAction</code> retrieves the details for a single issue from
 * ComicVine.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ComicVineGetIssueWithDetailsAction
    extends AbstractComicVineScrapingAction<ComicVineIssue> {
  static final String ENDPOINT = "issue/4000-%s";

  @Getter @Setter private Integer issueId;

  @Override
  public ComicVineIssue execute() throws ScrapingException {
    if (StringUtils.isEmpty(this.baseUrl)) throw new ScrapingException("Missing base URL");
    if (StringUtils.isEmpty(this.getApiKey())) throw new ScrapingException("Missing API key");
    if (this.issueId == null) throw new ScrapingException("Missing issue id");

    this.addField("volume");
    this.addField("issue_number");
    this.addField("cover_date");
    this.addField("name");
    this.addField("description");
    this.addField("character_credits");
    this.addField("team_credits");
    this.addField("location_credits");
    this.addField("story_arc_credits");
    this.addField("person_credits");

    log.debug(
        "Querying ComicVine for issue: id={} API key={}", this.issueId, this.getMaskedApiKey());
    final String url = this.createUrl(this.baseUrl, this.getEndpoint());
    final WebClient client = this.createWebClient(url);

    final Mono<ComicVineGetIssueDetailsResponse> request =
        client.get().uri(url).retrieve().bodyToMono(ComicVineGetIssueDetailsResponse.class);

    try {
      return request.block().getResults();
    } catch (Exception error) {
      throw new ScrapingException("failed to get issue details", error);
    }
  }

  private String getEndpoint() {
    return String.format(ENDPOINT, this.issueId);
  }
}
