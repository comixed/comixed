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

import java.util.Arrays;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.comicvine.adaptors.ComicVineMetadataAdaptor;
import org.comixedproject.metadata.comicvine.model.*;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ComicVineScrapeComicAction</code> scrapes the details for a issue {@link ComicBook} and
 * returns the unsaved, updated object.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ComicVineGetIssueDetailsAction
    extends AbstractComicVineScrapingAction<IssueDetailsMetadata> {

  /** The API key. */
  @Getter @Setter protected String apiKey;

  /** The issue id. This is the record id in ComicVine and not the issue number itself. */
  @Getter @Setter protected String issueId;

  /** The action to fetch the issue details. */
  protected ComicVineGetIssueWithDetailsAction getIssueWithDetailsAction =
      new ComicVineGetIssueWithDetailsAction();

  /** The action to fetch the volume details. */
  protected ComicVineGetVolumeDetailsAction getVolumeDetailsAction =
      new ComicVineGetVolumeDetailsAction();

  /** The action to fetch the publisher details. */
  protected ComicVineGetPublisherDetailsAction getPublisherDetailsAction =
      new ComicVineGetPublisherDetailsAction();

  @Override
  public IssueDetailsMetadata execute() throws MetadataException {
    if (!StringUtils.hasLength(this.apiKey)) throw new MetadataException("Missing API key");
    if (this.issueId == null) throw new MetadataException("Missing issue id");

    final ComicVineIssue issueDetails = this.getIssueDetails();
    final ComicVineVolume volumeDetails = this.getVolumeDetails(issueDetails.getVolume());
    final ComicVinePublisher publisherDetails =
        this.getPublisherDetails(volumeDetails.getPublisher());

    log.debug("Populate the issue details");
    final IssueDetailsMetadata result = new IssueDetailsMetadata();
    result.setSourceId(issueDetails.getId());
    result.setPublisher(publisherDetails.getName());
    result.setSeries(volumeDetails.getName());
    result.setVolume(volumeDetails.getStartYear());
    result.setIssueNumber(issueDetails.getIssueNumber());
    result.setCoverDate(issueDetails.getCoverDate());
    result.setStoreDate(issueDetails.getStoreDate());
    result.setTitle(issueDetails.getTitle());
    result.setDescription(issueDetails.getDescription());

    for (ComicVineCharacter character : issueDetails.getCharacters())
      result.getCharacters().add(character.getName());
    for (ComicVineTeam team : issueDetails.getTeams()) result.getTeams().add(team.getName());
    for (ComicVineLocation location : issueDetails.getLocations())
      result.getLocations().add(location.getName());
    for (ComicVineStory story : issueDetails.getStories()) result.getStories().add(story.getName());
    for (ComicVineCredit credit : issueDetails.getPeople())
      result.getCredits().addAll(createCreditEntry(credit.getName(), credit.getRole()));

    return result;
  }

  private List<IssueDetailsMetadata.CreditEntry> createCreditEntry(
      final String name, final String roles) {
    return doSplitString(roles).stream()
        .map(role -> new IssueDetailsMetadata.CreditEntry(name, role))
        .toList();
  }

  private List<String> doSplitString(final String roles) {
    return Arrays.stream(roles.split(","))
        .map(String::trim)
        .map(role -> ComicVineCreditType.forValue(role).getTagType().getValue())
        .toList();
  }

  private ComicVinePublisher getPublisherDetails(final ComicVinePublisher publisher)
      throws MetadataException {
    log.debug("Setting up the publisher details request: {}", publisher.getName());
    this.getPublisherDetailsAction.setApiKey(this.apiKey);
    this.getPublisherDetailsAction.setApiUrl(publisher.getDetailUrl());

    log.debug("Fetching the publisher details");
    return this.getPublisherDetailsAction.execute();
  }

  private ComicVineVolume getVolumeDetails(final ComicVineVolume volume) throws MetadataException {
    log.debug("Setting up the volume details request: id={}", volume.getName());
    this.getVolumeDetailsAction.setApiKey(this.apiKey);
    this.getVolumeDetailsAction.setApiUrl(volume.getDetailUrl());

    log.debug("Fetching the volume details");
    return this.getVolumeDetailsAction.execute();
  }

  private ComicVineIssue getIssueDetails() throws MetadataException {
    log.debug("Setting up the issue details request");
    this.getIssueWithDetailsAction.setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    this.getIssueWithDetailsAction.setApiKey(this.apiKey);
    this.getIssueWithDetailsAction.setIssueId(this.issueId);

    log.debug("Fetching the issue details");
    return this.getIssueWithDetailsAction.execute();
  }
}
