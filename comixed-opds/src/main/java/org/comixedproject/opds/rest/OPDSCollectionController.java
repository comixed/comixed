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
import static org.comixedproject.opds.model.OPDSNavigationFeed.NAVIGATION_FEED_LINK_TYPE;
import static org.comixedproject.opds.rest.OPDSLibraryController.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.auditlog.rest.AuditableRestEndpoint;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.model.*;
import org.comixedproject.opds.utils.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>OPDSCollectionController</code> provides OPDS endpoints for retrieving collection feeds.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSCollectionController {
  public static final String UNNAMED = "UNNAMED";

  @Autowired private ComicBookService comicBookService;

  /**
   * Retrieves the root feed for a collection.
   *
   * @param collectionType the collection type
   * @return the feed
   * @throws OPDSException if the collection type is unknown
   */
  @GetMapping(value = "/opds/collections/{type}", produces = MediaType.APPLICATION_XML_VALUE)
  @AuditableRestEndpoint(logResponse = true)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed getCollectionFeed(
      @NonNull @PathVariable("type") final CollectionType collectionType,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread)
      throws OPDSException {
    log.info("Fetching the feed root for a collection: {}", collectionType);
    switch (collectionType) {
      case publishers:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Publishers", String.valueOf(PUBLISHERS_ID)),
            PUBLISHERS_ID,
            this.comicBookService.getAllPublishers().stream()
                .map(
                    publisher ->
                        new CollectionFeedEntry(
                            publisher, Long.valueOf(("PUBLISHER" + publisher).hashCode())))
                .collect(Collectors.toUnmodifiableList()),
            unread);
      case series:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Series", String.valueOf(SERIES_ID)),
            SERIES_ID,
            this.comicBookService.getAllSeries().stream()
                .map(
                    series ->
                        new CollectionFeedEntry(
                            series, Long.valueOf(("SERIES" + series).hashCode())))
                .collect(Collectors.toUnmodifiableList()),
            unread);
      case characters:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Characters", String.valueOf(CHARACTERS_ID)),
            CHARACTERS_ID,
            this.comicBookService.getAllCharacters().stream()
                .map(
                    character ->
                        new CollectionFeedEntry(
                            character, Long.valueOf(("CHARACTER" + character).hashCode())))
                .collect(Collectors.toUnmodifiableList()),
            unread);
      case teams:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Teams", String.valueOf(TEAMS_ID)),
            TEAMS_ID,
            this.comicBookService.getAllTeams().stream()
                .map(
                    team -> new CollectionFeedEntry(team, Long.valueOf(("TEAM" + team).hashCode())))
                .collect(Collectors.toUnmodifiableList()),
            unread);
      case locations:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Locations", String.valueOf(LOCATIONS_ID)),
            LOCATIONS_ID,
            this.comicBookService.getAllLocations().stream()
                .map(
                    location ->
                        new CollectionFeedEntry(
                            location, Long.valueOf(("LOCATION" + location).hashCode())))
                .collect(Collectors.toUnmodifiableList()),
            unread);
      case stories:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Stories", String.valueOf(STORIES_ID)),
            STORIES_ID,
            this.comicBookService.getAllStories().stream()
                .map(
                    story ->
                        new CollectionFeedEntry(story, Long.valueOf(("STORY" + story).hashCode())))
                .collect(Collectors.toUnmodifiableList()),
            unread);
    }
    throw new OPDSException("Failed to process collection: " + collectionType);
  }

  private OPDSNavigationFeed createCollectionFeed(
      final CollectionType collectionType,
      final OPDSNavigationFeed feed,
      final long entryOffset,
      final List<CollectionFeedEntry> entries,
      final boolean unread) {
    entries.forEach(
        entry -> {
          String name = entry.getName();
          final Long id = entry.getId();
          if (StringUtils.isEmpty(name)) {
            name = UNNAMED;
          }
          log.trace("Adding {} link: id={} name={}", collectionType, id, name);
          final OPDSNavigationFeedEntry feedEntry =
              new OPDSNavigationFeedEntry(name, String.valueOf(entryOffset + id));
          feedEntry
              .getLinks()
              .add(
                  new OPDSLink(
                      ACQUISITION_FEED_LINK_TYPE,
                      SUBSECTION,
                      String.format(
                          "/opds/collections/%s/%s/?unread=%s",
                          collectionType,
                          OPDSUtils.urlEncodeString(name),
                          String.valueOf(unread))));
          feed.getEntries().add(feedEntry);
        });
    feed.getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format(
                    "/opds/collections/%s/?unread=%s", feed.getTitle(), String.valueOf(unread))));
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
  @AuditableRestEndpoint(logResponse = true)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSAcquisitionFeed getEntriesForCollectionFeed(
      final Principal principal,
      @PathVariable("type") final CollectionType collectionType,
      @PathVariable("name") final String name,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread)
      throws OPDSException {
    final String nameValue = OPDSUtils.urlDecodeString(name);
    log.info("Fetching the feed root for publisher: {}", nameValue);
    final String email = principal.getName();
    switch (collectionType) {
      case publishers:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(
                String.format("Publisher: %s", nameValue), String.valueOf(PUBLISHERS_ID)),
            this.comicBookService.getAllForPublisher(nameValue, email, unread));
      case series:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(
                String.format("Series: %s", nameValue), String.valueOf(SERIES_ID)),
            this.comicBookService.getAllForSeries(nameValue, email, unread));
      case characters:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(
                String.format("Character: %s", nameValue), String.valueOf(CHARACTERS_ID)),
            this.comicBookService.getAllForCharacter(nameValue, email, unread));
      case teams:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(String.format("Team: %s", nameValue), String.valueOf(TEAMS_ID)),
            this.comicBookService.getAllForTeam(nameValue, email, unread));
      case locations:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(
                String.format("Location: %s", nameValue), String.valueOf(LOCATIONS_ID)),
            this.comicBookService.getAllForLocation(nameValue, email, unread));
      case stories:
        return this.createCollectionEntriesFeed(
            new OPDSAcquisitionFeed(
                String.format("Story: %s", nameValue), String.valueOf(STORIES_ID)),
            this.comicBookService.getAllForStory(nameValue, email, unread));
    }
    throw new OPDSException("Failed to process collection entries: " + collectionType);
  }

  private OPDSAcquisitionFeed createCollectionEntriesFeed(
      final OPDSAcquisitionFeed feed, final List<ComicBook> entries) {
    entries.forEach(
        comic -> {
          log.trace("Adding comic to collection entries: {}", comic.getId());
          feed.getEntries().add(OPDSUtils.createComicEntry(comic));
        });
    String type = feed.getTitle().split(": ")[0];
    String name = OPDSUtils.urlEncodeString(feed.getTitle().split(": ")[1]);
    feed.getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format("/opds/collections/%s/%s/", type, name)));
    return feed;
  }
}
