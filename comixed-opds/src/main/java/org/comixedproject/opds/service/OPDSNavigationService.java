/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.opds.service;

import static org.comixedproject.opds.model.OPDSAcquisitionFeed.ACQUISITION_FEED_LINK_TYPE;
import static org.comixedproject.opds.model.OPDSNavigationFeed.NAVIGATION_FEED_LINK_TYPE;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.*;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>OPDSNavigationService</code> generates navigation feeds for the OPDS subsystem.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class OPDSNavigationService {
  public static final String UNNAMED = "UNNAMED";
  public static final String SUBSECTION = "subsection";
  public static final String SELF = "self";
  public static final String ROOT_ID = "1";
  public static final String LIBRARY_ID = "10";
  public static final long PUBLISHERS_ID = 11L;
  public static final long SERIES_ID = 12L;
  public static final long CHARACTERS_ID = 13L;
  public static final long TEAMS_ID = 14L;
  public static final long LOCATIONS_ID = 15L;
  public static final long STORIES_ID = 16L;
  public static final long COVER_DATE_ID = 17L;
  private static final String READING_LISTS_ID = "20";
  public static final long READING_LIST_FACTOR_ID = 1000000L;
  private static final String STORE_DATE_YEARS_ID = "20";
  static final int COMIC_STORE_DATE_FOR_YEAR_ID = 20;

  @Autowired private ComicBookService comicBookService;
  @Autowired private ReadingListService readingListService;
  @Autowired private OPDSUtils opdsUtils;

  private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("MMM dd yyyy");

  /**
   * Retrieves the top-level navigation feed for the library.
   *
   * @return the navigation feeds
   */
  public OPDSNavigationFeed getRootFeed() {
    log.info("Fetching root navigation feed");
    final OPDSNavigationFeed response = new OPDSNavigationFeed("Comixed Comics Catalog", ROOT_ID);
    response.getLinks().add(new OPDSLink(NAVIGATION_FEED_LINK_TYPE, SELF, "/opds/"));
    log.trace("Adding library root feed");
    OPDSNavigationFeedEntry entry;
    // add the library link
    entry = new OPDSNavigationFeedEntry("All Comics", "1");
    entry.setContent(new OPDSNavigationFeedContent("The library root"));
    entry.getLinks().add(new OPDSLink(ACQUISITION_FEED_LINK_TYPE, SUBSECTION, "/opds/library/"));
    response.getEntries().add(entry);
    // add unread entries link
    entry = new OPDSNavigationFeedEntry("Unread Comics", "2");
    entry.setContent(new OPDSNavigationFeedContent("Unread comics only"));
    entry
        .getLinks()
        .add(new OPDSLink(ACQUISITION_FEED_LINK_TYPE, SUBSECTION, "/opds/library/?unread=true"));
    response.getEntries().add(entry);
    // add the reading lists link
    entry = new OPDSNavigationFeedEntry("Reading Lists", "3");
    entry.setContent(new OPDSNavigationFeedContent("Your personal reading lists"));
    entry.getLinks().add(new OPDSLink(ACQUISITION_FEED_LINK_TYPE, SUBSECTION, "/opds/lists/"));
    response.getEntries().add(entry);
    return response;
  }

  public OPDSNavigationFeed getLibraryFeed(final boolean unread) {
    log.info("Fetching the library root feed");
    final OPDSNavigationFeed response = new OPDSNavigationFeed("Library", LIBRARY_ID);
    String unreadStr = String.valueOf(unread);
    response
        .getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format("/opds/library/?unread=%s", unreadStr)));
    OPDSNavigationFeedEntry entry;
    // add the cover date link
    log.trace("Adding cover dates link");
    entry = new OPDSNavigationFeedEntry("Cover Date", String.valueOf(COVER_DATE_ID));
    entry.setContent(new OPDSNavigationFeedContent("Comics By Release Date"));
    entry
        .getLinks()
        .add(
            new OPDSLink(
                ACQUISITION_FEED_LINK_TYPE,
                SUBSECTION,
                String.format("/opds/dates/released/?unread=%s", unreadStr)));
    response.getEntries().add(entry);
    log.trace("Adding publishers link");
    entry = new OPDSNavigationFeedEntry("Publishers", String.valueOf(PUBLISHERS_ID));
    entry.setContent(new OPDSNavigationFeedContent("All Publishers"));
    entry
        .getLinks()
        .add(
            new OPDSLink(
                ACQUISITION_FEED_LINK_TYPE,
                SUBSECTION,
                String.format("/opds/collections/publishers/?unread=%s", unreadStr)));
    response.getEntries().add(entry);

    log.trace("Adding series link");
    entry = new OPDSNavigationFeedEntry("Series", String.valueOf(SERIES_ID));
    entry.setContent(new OPDSNavigationFeedContent("All Series"));
    entry
        .getLinks()
        .add(
            new OPDSLink(
                ACQUISITION_FEED_LINK_TYPE,
                SUBSECTION,
                String.format("/opds/collections/series/?unread=%s", unreadStr)));
    response.getEntries().add(entry);

    log.trace("Adding characters link");
    entry = new OPDSNavigationFeedEntry("Characters", String.valueOf(CHARACTERS_ID));
    entry.setContent(new OPDSNavigationFeedContent("All Characters"));
    entry
        .getLinks()
        .add(
            new OPDSLink(
                ACQUISITION_FEED_LINK_TYPE,
                SUBSECTION,
                String.format("/opds/collections/characters/?unread=%s", unreadStr)));
    response.getEntries().add(entry);

    log.trace("Adding teams link");
    entry = new OPDSNavigationFeedEntry("Teams", String.valueOf(TEAMS_ID));
    entry.setContent(new OPDSNavigationFeedContent("All Teams"));
    entry
        .getLinks()
        .add(
            new OPDSLink(
                ACQUISITION_FEED_LINK_TYPE,
                SUBSECTION,
                String.format("/opds/collections/teams/?unread=%s", unreadStr)));
    response.getEntries().add(entry);

    log.trace("Adding locations link");
    entry = new OPDSNavigationFeedEntry("Locations", String.valueOf(LOCATIONS_ID));
    entry.setContent(new OPDSNavigationFeedContent("All Locations"));
    entry
        .getLinks()
        .add(
            new OPDSLink(
                ACQUISITION_FEED_LINK_TYPE,
                SUBSECTION,
                String.format("/opds/collections/locations/?unread=%s", unreadStr)));
    response.getEntries().add(entry);

    log.trace("Adding stories link");
    entry = new OPDSNavigationFeedEntry("Stories", String.valueOf(STORIES_ID));
    entry.setContent(new OPDSNavigationFeedContent("All Stories"));
    entry
        .getLinks()
        .add(
            new OPDSLink(
                ACQUISITION_FEED_LINK_TYPE,
                SUBSECTION,
                String.format("/opds/collections/stories/?unread=%s", unreadStr)));
    response.getEntries().add(entry);
    return response;
  }

  /**
   * Retrieves the root navigation feed for publishers.
   *
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getRootFeedForPublishers(final boolean unread) {
    log.trace("Getting root feed for publishers");
    final OPDSNavigationFeed feed =
        new OPDSNavigationFeed("Publishers", String.valueOf(PUBLISHERS_ID));
    this.comicBookService.getAllPublishers().stream()
        .map(
            publisher ->
                new CollectionFeedEntry(
                    publisher, this.opdsUtils.createIdForEntry("PUBLISHER", publisher)))
        .collect(Collectors.toUnmodifiableList())
        .forEach(
            publisher -> {
              final OPDSNavigationFeedEntry feedEntry =
                  new OPDSNavigationFeedEntry(
                      publisher.getName(),
                      String.valueOf(
                          this.opdsUtils.createIdForEntry("PUBLISHER", publisher.getName())));
              feedEntry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/collections/publishers/%s?unread=%s",
                              this.opdsUtils.urlEncodeString(publisher.getName()),
                              String.valueOf(unread))));
              feed.getEntries().add(feedEntry);
            });
    return feed;
  }

  /**
   * Retrieves a navigation feed of series for the given publisher.
   *
   * @param publisher the publisher
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getSeriesFeedForPublisher(
      final String publisher, final boolean unread) {
    OPDSNavigationFeed result =
        new OPDSNavigationFeed(
            String.format("Publisher: %s", publisher), String.valueOf(PUBLISHERS_ID));
    this.comicBookService.getAllSeriesForPublisher(publisher).stream()
        .forEach(
            series -> {
              final OPDSNavigationFeedEntry feedEntry =
                  new OPDSNavigationFeedEntry(
                      series, String.valueOf(this.opdsUtils.createIdForEntry("SERIES", series)));
              feedEntry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/collections/publishers/%s/series/%s?unread=%s",
                              this.opdsUtils.urlEncodeString(publisher),
                              this.opdsUtils.urlEncodeString(series),
                              String.valueOf(unread))));
              result.getEntries().add(feedEntry);
            });
    return result;
  }

  /**
   * Retrieves the navigation feed for the given publisher and series.
   *
   * @param publisher the publisher
   * @param series the series
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getVolumeFeedForPublisherAndSeries(
      final String publisher, final String series, final boolean unread) {
    OPDSNavigationFeed result =
        new OPDSNavigationFeed(String.format("Series: %s", series), String.valueOf(SERIES_ID));
    this.comicBookService.getAllVolumesForPublisherAndSeries(publisher, series).stream()
        .forEach(
            volume -> {
              final OPDSNavigationFeedEntry feedEntry =
                  new OPDSNavigationFeedEntry(
                      String.format("v%s", volume),
                      String.valueOf(
                          this.opdsUtils.createIdForEntry("SERIES:VOLUME", series + ":" + volume)));
              feedEntry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/collections/publishers/%s/series/%s/volumes/%s?unread=%s",
                              this.opdsUtils.urlEncodeString(publisher),
                              this.opdsUtils.urlEncodeString(series),
                              this.opdsUtils.urlEncodeString(volume),
                              String.valueOf(unread))));
              result.getEntries().add(feedEntry);
            });
    return result;
  }

  /**
   * Returns the root navigation feed for series.
   *
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getRootFeedForSeries(final boolean unread) {
    log.trace("Loading root feed for series");
    final OPDSNavigationFeed feed = new OPDSNavigationFeed("Series", String.valueOf(SERIES_ID));
    this.comicBookService.getAllSeries().stream()
        .map(
            series ->
                new CollectionFeedEntry(series, this.opdsUtils.createIdForEntry("SERIES", series)))
        .collect(Collectors.toUnmodifiableList())
        .forEach(
            entry -> {
              String name = entry.getName();
              final Long id = entry.getId();
              if (StringUtils.isEmpty(name)) {
                name = UNNAMED;
              }
              log.trace("Adding series link: id={} name={}", id, name);
              final OPDSNavigationFeedEntry feedEntry =
                  new OPDSNavigationFeedEntry(name, String.valueOf(SERIES_ID + id));
              feedEntry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/collections/series/%s?unread=%s",
                              this.opdsUtils.urlEncodeString(name), String.valueOf(unread))));
              feed.getEntries().add(feedEntry);
            });
    feed.getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format("/opds/library/?unread=%s", String.valueOf(unread))));
    return feed;
  }

  /**
   * Builds the volumes navigation feed for a single series.
   *
   * @param name the series name
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getVolumesFeedForSeries(final String name, final boolean unread) {
    log.trace("Loading volumes feed for series: {}", name);
    OPDSNavigationFeed result =
        new OPDSNavigationFeed(String.format("Series: %s", name), String.valueOf(SERIES_ID));
    this.comicBookService.getAllVolumesForSeries(name).stream()
        .forEach(
            volume -> {
              final OPDSNavigationFeedEntry feedEntry =
                  new OPDSNavigationFeedEntry(
                      String.format("%s v%s", name, volume),
                      String.valueOf(
                          this.opdsUtils.createIdForEntry("SERIES:VOLUME", name + ":" + volume)));
              feedEntry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/collections/series/%s/volumes/%s?unread=%s",
                              this.opdsUtils.urlEncodeString(name),
                              this.opdsUtils.urlEncodeString(volume),
                              String.valueOf(unread))));
              result.getEntries().add(feedEntry);
            });
    return result;
  }

  /**
   * Retrieves the navigation feed for a given collection type.
   *
   * @param collectionType the collection type
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getCollectionFeed(
      @NonNull final CollectionType collectionType, final boolean unread) {
    log.info("Fetching the feed root for a collection: {}", collectionType);
    switch (collectionType) {
      case characters:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Characters", String.valueOf(CHARACTERS_ID)),
            CHARACTERS_ID,
            this.comicBookService.getAllCharacters().stream()
                .map(
                    character ->
                        new CollectionFeedEntry(
                            character, this.opdsUtils.createIdForEntry("CHARACTER", character)))
                .collect(Collectors.toUnmodifiableList()),
            unread);
      case teams:
        return createCollectionFeed(
            collectionType,
            new OPDSNavigationFeed("Teams", String.valueOf(TEAMS_ID)),
            TEAMS_ID,
            this.comicBookService.getAllTeams().stream()
                .map(
                    team ->
                        new CollectionFeedEntry(
                            team, this.opdsUtils.createIdForEntry("TEAM", team)))
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
                            location, this.opdsUtils.createIdForEntry("LOCATION", location)))
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
                        new CollectionFeedEntry(
                            story, this.opdsUtils.createIdForEntry("STORY", story)))
                .collect(Collectors.toUnmodifiableList()),
            unread);
    }
    return null;
  }

  /**
   * Retrieves the navigation feed for the given user's reading lists.
   *
   * @param email the user's email
   * @return the navigation feed
   * @throws OPDSException if there was an error loading the reading lists
   */
  public OPDSNavigationFeed getReadingListsFeed(@NonNull final String email) throws OPDSException {
    try {
      final List<ReadingList> lists = this.readingListService.loadReadingListsForUser(email);
      final OPDSNavigationFeed response = new OPDSNavigationFeed("Reading lists", READING_LISTS_ID);
      response.getLinks().add(new OPDSLink(NAVIGATION_FEED_LINK_TYPE, SELF, "/opds/lists/"));
      lists.forEach(
          readingList -> {
            log.trace("Adding reading list: {}", readingList.getName());
            final OPDSNavigationFeedEntry entry =
                new OPDSNavigationFeedEntry(
                    String.format(
                        "%s (%d comics)",
                        readingList.getName(), readingList.getComicBooks().size()),
                    String.valueOf(READING_LIST_FACTOR_ID + readingList.getId()));
            entry.setContent(new OPDSNavigationFeedContent(readingList.getSummary()));
            entry
                .getLinks()
                .add(
                    new OPDSLink(
                        ACQUISITION_FEED_LINK_TYPE,
                        SUBSECTION,
                        String.format("/opds/lists/%d/", readingList.getId())));
            response.getEntries().add(entry);
          });
      return response;
    } catch (ReadingListException error) {
      throw new OPDSException("failed to load reading lists for user", error);
    }
  }

  /**
   * Returns the navigation feed for comic cover date years.
   *
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getYearsFeed(final boolean unread) {
    final OPDSNavigationFeed response =
        new OPDSNavigationFeed("Store Date: Years", STORE_DATE_YEARS_ID);
    this.comicBookService.getYearsForComics().stream()
        .sorted()
        .forEach(
            year -> {
              log.trace("Adding year: {}", year);
              OPDSNavigationFeedEntry entry =
                  new OPDSNavigationFeedEntry(String.valueOf(year), String.valueOf(year));
              entry.setContent(new OPDSNavigationFeedContent(String.format("The Year %d", year)));
              entry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/dates/released/years/%d/weeks?unread=%s", year, unread)));
              response.getEntries().add(entry);
            });
    return response;
  }

  /**
   * Retrieves the navigation feed for cover date weeks in the library for a specific year.
   *
   * @param year the year
   * @param unread the unread flag
   * @return the navigation feed
   */
  public OPDSNavigationFeed getWeeksFeedForYear(final int year, final boolean unread) {
    final OPDSNavigationFeed response =
        new OPDSNavigationFeed(
            "Comics For Year: " + year, String.valueOf(COMIC_STORE_DATE_FOR_YEAR_ID + year));
    log.trace("Loading days with comics for year");
    this.comicBookService.getWeeksForYear(year).stream()
        .sorted()
        .forEach(
            weekNumber -> {
              log.trace("Adding week {} of {}", weekNumber, year);
              final Date weekStarts = this.getDateFor(year, weekNumber, Calendar.SUNDAY);
              final Date weekEnds = this.getDateFor(year, weekNumber, Calendar.SATURDAY);
              OPDSNavigationFeedEntry entry =
                  new OPDSNavigationFeedEntry(
                      String.format("Year %d Week %d", year, weekNumber),
                      String.valueOf(year + weekNumber));
              entry.setContent(
                  new OPDSNavigationFeedContent(
                      String.format(
                          "%s thru %s",
                          this.simpleDateFormat.format(weekStarts),
                          this.simpleDateFormat.format(weekEnds))));
              entry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/dates/released/years/%d/weeks/%d?unread=%s",
                              year, weekNumber, String.valueOf(unread))));
              response.getEntries().add(entry);
            });
    return response;
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
                          "/opds/collections/%s/%s?unread=%s",
                          collectionType,
                          this.opdsUtils.urlEncodeString(name),
                          String.valueOf(unread))));
          feed.getEntries().add(feedEntry);
        });
    feed.getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format(
                    "/opds/collections/%s?unread=%s", feed.getTitle(), String.valueOf(unread))));
    return feed;
  }

  private Date getDateFor(final Integer year, final Integer week, final int dayOfWeek) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.set(Calendar.YEAR, year);
    calendar.set(Calendar.WEEK_OF_YEAR, week);
    calendar.set(Calendar.DAY_OF_WEEK, dayOfWeek);
    return calendar.getTime();
  }
}
