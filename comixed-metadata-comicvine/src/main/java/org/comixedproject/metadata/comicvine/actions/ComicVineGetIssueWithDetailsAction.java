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

package org.comixedproject.metadata.comicvine.actions;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.comicvine.model.ComicVineGetIssueDetailsResponse;
import org.comixedproject.metadata.comicvine.model.ComicVineIssue;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * <code>ComicVineGetIssueDetailsAction</code> retrieves the details for a single issue from
 * ComicVine.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class ComicVineGetIssueWithDetailsAction
    extends AbstractComicVineScrapingAction<ComicVineIssue> {
  static final String ENDPOINT = "issue/4000-%s";

  @Getter @Setter private String issueId;

  @Override
  public ComicVineIssue execute() throws MetadataException {
    if (!StringUtils.hasLength(this.baseUrl)) throw new MetadataException("Missing base URL");
    if (!StringUtils.hasLength(this.getApiKey())) throw new MetadataException("Missing API key");
    if (this.issueId == null) throw new MetadataException("Missing issue id");

    this.addField("id");
    this.addField("volume");
    this.addField("issue_number");
    this.addField("cover_date");
    this.addField("store_date");
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

    ComicVineGetIssueDetailsResponse result;
    try {
      result = request.block();
    } catch (Exception error) {
      throw new MetadataException("failed to get issue details", error);
    }

    if (result == null) throw new MetadataException("No response received");

    return result.getResults();
  }

  private String getEndpoint() {
    return String.format(ENDPOINT, this.issueId);
  }
}
