/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.opds.rest;

import static org.comixedproject.opds.model.OPDSAcquisitionFeed.ACQUISITION_FEED_LINK_TYPE;
import static org.comixedproject.opds.rest.OPDSLibraryController.START;

import java.util.List;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.model.*;
import org.comixedproject.opds.utils.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>OPDSCollectionController</code> provides OPDS endpoints for retrieving collection feeds.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSCollectionController {
  public static final String UNNAMED = "UNNAMED";

  @Autowired private ComicService comicService;

  /**
   * Retrieves the root feed for a collection.
   *
   * @param collectionType the collection type
   * @return the feed
   * @throws OPDSException if the collection type is unknown
   */
  @GetMapping(value = "/opds/collections/{type}", produces = MediaType.APPLICATION_XML_VALUE)
  @AuditableEndpoint
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed getCollectionFeed(
      @NonNull @PathVariable("type") final CollectionType collectionType) throws OPDSException {
    log.info("Fetching the feed root for a collection: {}", collectionType);
    switch (collectionType) {
      case publishers:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Publishers"),
            this.comicService.getAllPublishers());
      case series:
        return createCollectionFeed(
            collectionType, new OPDSNavigationFeed("Series"), this.comicService.getAllSeries());
      case characters:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Characters"),
            this.comicService.getAllCharacters());
      case teams:
        return createCollectionFeed(
            collectionType, new OPDSNavigationFeed("Teams"), this.comicService.getAllTeams());
      case locations:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Locations"),
            this.comicService.getAllLocations());
      case stories:
        return createCollectionFeed(
            collectionType, new OPDSNavigationFeed("Stories"), this.comicService.getAllStories());
    }
    throw new OPDSException("Failed to process collection: " + collectionType);
  }

  private OPDSNavigationFeed createCollectionFeed(
      final CollectionType collectionType,
      final OPDSNavigationFeed feed,
      final List<String> entries) {
    entries.forEach(
        entryName -> {
          String name = entryName;
          if (StringUtils.isEmpty(name)) {
            name = UNNAMED;
          }
          log.trace("Adding {} link: {}", collectionType, name);
          final OPDSNavigationFeedEntry entry = new OPDSNavigationFeedEntry(name);
          entry
              .getLinks()
              .add(
                  new OPDSLink(
                      ACQUISITION_FEED_LINK_TYPE,
                      START,
                      String.format(
                          "/opds/collections/%s/%s",
                          collectionType, OPDSUtils.urlEncodeString(name))));
          feed.getEntries().add(entry);
        });
    return feed;
  }

  /**
   * Retrieves the feed for a single collection.
   *
   * @param collectionType the collection type
   * @param name the collection name
   * @return the feed
   * @throws OPDSException if the collection type is unknown
   */
  @GetMapping(value = "/opds/collections/{type}/{name}", produces = MediaType.APPLICATION_XML_VALUE)
  @AuditableEndpoint
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSAcquisitionFeed getEntriesForCollectionFeed(
      @PathVariable("type") final CollectionType collectionType,
      @PathVariable("name") final String name)
      throws OPDSException {
    final String nameValue = OPDSUtils.urlDecodeString(name);
    log.info("Fetching the feed root for publisher: {}", nameValue);
    switch (collectionType) {
      case publishers:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(String.format("Publisher: %s", nameValue)),
            this.comicService.getAllForPublisher(nameValue));
      case series:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(String.format("Series: %s", nameValue)),
            this.comicService.getAllForSeries(nameValue));
      case characters:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(String.format("Character: %s", nameValue)),
            this.comicService.getAllForCharacter(nameValue));
      case teams:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(String.format("Team: %s", nameValue)),
            this.comicService.getAllForTeam(nameValue));
      case locations:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(String.format("Location: %s", nameValue)),
            this.comicService.getAllForLocation(nameValue));
      case stories:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(String.format("Story: %s", nameValue)),
            this.comicService.getAllForStory(nameValue));
    }
    throw new OPDSException("Failed to process collection entries: " + collectionType);
  }

  private OPDSAcquisitionFeed createCollectionEntriesFeed(
      final OPDSAcquisitionFeed feed, final List<Comic> entries) {
    entries.forEach(
        comic -> {
          log.trace("Adding comic to collection entries: {}", comic.getId());
          feed.getEntries().add(OPDSUtils.createComicEntry(comic));
        });
    return feed;
  }
}
