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

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.comicvine.model.ComicVineIssue;
import org.comixedproject.metadata.comicvine.model.ComicVineIssuesQueryResponse;
import org.comixedproject.metadata.model.IssueMetadata;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * <code>ComicVineGetIssueAction</code> retrieves the list of issues for a given comic volume.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class ComicVineGetIssueAction extends AbstractComicVineScrapingAction<List<IssueMetadata>> {
  @Getter @Setter private String volumeId;
  @Getter @Setter private String issueNumber;

  @Override
  public List<IssueMetadata> execute() throws MetadataException {
    if (!StringUtils.hasLength(this.getApiKey())) throw new MetadataException("Missing API key");
    if (this.volumeId == null) throw new MetadataException("Missing volume id");

    this.addField("id");
    this.addField("volume");
    this.addField("issue_number");
    this.addField("cover_date");
    this.addField("store_date");
    this.addField("description");
    this.addField("image");

    this.addFilter("volume", String.valueOf(this.volumeId));
    this.addFilter("issue_number", this.issueNumber);

    List<IssueMetadata> result = new ArrayList<>();
    boolean done = false;
    while (!done) {
      log.debug(
          "Creating url for: API key=****{} volume id={}", this.getMaskedApiKey(), this.volumeId);
      final String url = this.createUrl(this.baseUrl, "issues");
      final WebClient client = this.createWebClient(url);

      final Mono<ComicVineIssuesQueryResponse> request =
          client.get().uri(url).retrieve().bodyToMono(ComicVineIssuesQueryResponse.class);

      ComicVineIssuesQueryResponse response = null;

      try {
        response = request.block();
      } catch (Exception error) {
        throw new MetadataException("Failed to get response", error);
      }

      if (response == null) throw new MetadataException("No response received");

      log.debug(
          "Received: {} issue{}",
          response.getIssues().size(),
          response.getIssues().size() == 1 ? "" : "s");

      for (int index = 0; index < response.getIssues().size(); index++) {
        final ComicVineIssue issue = response.getIssues().get(index);
        final IssueMetadata entry = new IssueMetadata();
        entry.setIssueNumber(issue.getIssueNumber());
        entry.setId(issue.getId());
        entry.setVolumeId(issue.getVolume().getId());
        entry.setName(issue.getVolume().getName());
        entry.setVolumeName(issue.getVolume().getName());
        entry.setDescription(issue.getDescription());
        entry.setCoverDate(issue.getCoverDate());
        entry.setStoreDate(issue.getStoreDate());
        entry.setCoverUrl(issue.getImage().getMediumUrl());
        result.add(entry);
      }

      done =
          response.getOffset() + response.getNumberOfPageResults()
              >= response.getNumberOfTotalResults();
    }

    return result;
  }
}
