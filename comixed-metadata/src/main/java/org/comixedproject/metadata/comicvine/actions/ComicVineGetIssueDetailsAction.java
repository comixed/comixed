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
import org.comixedproject.metadata.comicvine.adaptors.ComicVineMetadataAdaptor;
import org.comixedproject.metadata.comicvine.model.*;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.model.comicbooks.Comic;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ComicVineScrapeComicAction</code> scrapes the details for a issue {@link Comic} and returns
 * the unsaved, updated object.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ComicVineGetIssueDetailsAction
    extends AbstractComicVineScrapingAction<IssueDetailsMetadata> {

  @Getter @Setter protected String apiKey;
  @Getter @Setter protected Integer issueId;

  @Autowired
  private ObjectFactory<ComicVineGetIssueWithDetailsAction> issueDetailsActionObjectFactory;

  @Autowired
  private ObjectFactory<ComicVineGetVolumeDetailsAction> volumeDetailsActionObjectFactory;

  @Autowired
  private ObjectFactory<ComicVineGetPublisherDetailsAction> publisherDetailsActionObjectFactory;

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
      result
          .getCredits()
          .add(new IssueDetailsMetadata.CreditEntry(credit.getName(), credit.getRole()));

    return result;
  }

  private ComicVinePublisher getPublisherDetails(final ComicVinePublisher publisher)
      throws MetadataException {
    log.debug("Setting up the publisher details request: {}", publisher.getName());
    final ComicVineGetPublisherDetailsAction getPublisherDetails =
        this.publisherDetailsActionObjectFactory.getObject();
    getPublisherDetails.setApiKey(this.apiKey);
    getPublisherDetails.setApiUrl(publisher.getDetailUrl());

    log.debug("Fetching the publisher details");
    return getPublisherDetails.execute();
  }

  private ComicVineVolume getVolumeDetails(final ComicVineVolume volume) throws MetadataException {
    log.debug("Setting up the volume details request: id={}", volume.getName());
    final ComicVineGetVolumeDetailsAction getVolumeDetails =
        this.volumeDetailsActionObjectFactory.getObject();
    getVolumeDetails.setApiKey(this.apiKey);
    getVolumeDetails.setApiUrl(volume.getDetailUrl());

    log.debug("Fetching the volume details");
    return getVolumeDetails.execute();
  }

  private ComicVineIssue getIssueDetails() throws MetadataException {
    log.debug("Setting up the issue details request");
    final ComicVineGetIssueWithDetailsAction getIssueDetails =
        this.issueDetailsActionObjectFactory.getObject();
    getIssueDetails.setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    getIssueDetails.setApiKey(this.apiKey);
    getIssueDetails.setIssueId(this.issueId);

    log.debug("Fetching the issue details");
    return getIssueDetails.execute();
  }
}
