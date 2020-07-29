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
import org.comixedproject.model.comic.Comic;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.adaptors.ComicVineScrapingAdaptor;
import org.comixedproject.scrapers.comicvine.model.*;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
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
    extends AbstractComicVineScrapingAction<ScrapingIssueDetails> {

  @Getter @Setter protected String apiKey;
  @Getter @Setter protected Integer issueId;

  @Autowired
  private ObjectFactory<ComicVineGetIssueWithDetailsAction> issueDetailsActionObjectFactory;

  @Autowired
  private ObjectFactory<ComicVineGetVolumeDetailsAction> volumeDetailsActionObjectFactory;

  @Autowired
  private ObjectFactory<ComicVineGetPublisherDetailsAction> publisherDetailsActionObjectFactory;

  @Override
  public ScrapingIssueDetails execute() throws ScrapingException {
    if (StringUtils.isEmpty(this.apiKey)) throw new ScrapingException("Missing API key");
    if (this.issueId == null) throw new ScrapingException("Missing issue id");

    final ComicVineIssue issueDetails = this.getIssueDetails();
    final ComicVineVolume volumeDetails = this.getVolumeDetails(issueDetails.getVolume());
    final ComicVinePublisher publisherDetails =
        this.getPublisherDetails(volumeDetails.getPublisher());

    log.debug("Populatie the issue details");
    final ScrapingIssueDetails result = new ScrapingIssueDetails();
    result.setPublisher(publisherDetails.getName());
    result.setSeries(volumeDetails.getName());
    result.setVolume(volumeDetails.getStartYear());
    result.setIssueNumber(issueDetails.getIssueNumber());
    result.setCoverDate(issueDetails.getCoverDate());
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
          .add(new ScrapingIssueDetails.CreditEntry(credit.getName(), credit.getRole()));

    return result;
  }

  private ComicVinePublisher getPublisherDetails(final ComicVinePublisher publisher)
      throws ScrapingException {
    log.debug("Setting up the publisher details request: {}", publisher.getName());
    final ComicVineGetPublisherDetailsAction getPublisherDetails =
        this.publisherDetailsActionObjectFactory.getObject();
    getPublisherDetails.setApiKey(this.apiKey);
    getPublisherDetails.setApiUrl(publisher.getDetailUrl());

    log.debug("Fetching the publisher details");
    return getPublisherDetails.execute();
  }

  private ComicVineVolume getVolumeDetails(final ComicVineVolume volume) throws ScrapingException {
    log.debug("Setting up the volume details request: id={}", volume.getName());
    final ComicVineGetVolumeDetailsAction getVolumeDetails =
        this.volumeDetailsActionObjectFactory.getObject();
    getVolumeDetails.setApiKey(this.apiKey);
    getVolumeDetails.setApiUrl(volume.getDetailUrl());

    log.debug("Fetching the volume details");
    return getVolumeDetails.execute();
  }

  private ComicVineIssue getIssueDetails() throws ScrapingException {
    log.debug("Setting up the issue details request");
    final ComicVineGetIssueWithDetailsAction getIssueDetails =
        this.issueDetailsActionObjectFactory.getObject();
    getIssueDetails.setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    getIssueDetails.setApiKey(this.apiKey);
    getIssueDetails.setIssueId(this.issueId);

    log.debug("Fetching the issue details");
    return getIssueDetails.execute();
  }
}
