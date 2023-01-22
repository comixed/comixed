/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.opds.service;

import static org.comixedproject.opds.model.OPDSNavigationFeed.NAVIGATION_FEED_LINK_TYPE;
import static org.comixedproject.opds.service.OPDSNavigationService.COMIC_STORE_DATE_FOR_YEAR_ID;
import static org.comixedproject.opds.service.OPDSNavigationService.READING_LIST_FACTOR_ID;
import static org.comixedproject.opds.service.OPDSNavigationService.SELF;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSLink;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>OPDSAcquisitionService</code> generates acquisition feeds for the OPDS subsystem.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class OPDSAcquisitionService {

  @Autowired private ComicDetailService comicDetailService;
  @Autowired private ReadingListService readingListService;
  @Autowired private OPDSUtils opdsUtils;

  private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("MMM dd yyyy");

  /**
   * Retrieves the acquisition feed for the specific collection. Comics previously read by the user
   * are filtered out if the unread flag is set.
   *
   * @param email the reader's email address
   * @param collectionType the collection type
   * @param collectionName the collection name
   * @param unread the unread flag
   * @return the feed
   */
  public OPDSAcquisitionFeed getEntriesForCollectionFeed(
      final String email,
      final CollectionType collectionType,
      final String collectionName,
      final boolean unread) {

    return this.createCollectionEntriesFeed(
        new OPDSAcquisitionFeed(
            String.format(
                String.format(
                    "%s: %s", collectionType.getOpdsNavigationFeedTitle(), collectionName),
                collectionName),
            String.valueOf(collectionType.getOpdsIdKey())),
        this.comicDetailService.getAllComicsForTag(
            collectionType.getComicTagType(), email, unread));
  }

  private OPDSAcquisitionFeed createCollectionEntriesFeed(
      final OPDSAcquisitionFeed feed, final List<ComicDetail> entries) {
    entries.forEach(
        comic -> {
          log.trace("Adding comic to collection entries: {}", comic.getId());
          feed.getEntries().add(this.opdsUtils.createComicEntry(comic));
        });
    String type = feed.getTitle().split(": ")[0];
    String name = this.opdsUtils.urlEncodeString(feed.getTitle().split(": ")[1]);
    feed.getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format("/opds/collections/%s/%s/", type, name)));
    return feed;
  }

  /**
   * Retrieves the acquisition feed for a given publisher, series, and volume. Comics previous read
   * by the user are filtered if the unread flag is set.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param email the reader's email
   * @param unread the unread flag
   * @return the acquisition feed
   */
  public OPDSAcquisitionFeed getComicFeedsForPublisherAndSeriesAndVolume(
      final String publisher,
      final String series,
      final String volume,
      final String email,
      final boolean unread) {
    log.debug(
        "Getting comic feed for publisher={} series={} volume={} for {} [unread={}]",
        publisher,
        series,
        volume,
        email,
        unread);
    OPDSAcquisitionFeed result =
        new OPDSAcquisitionFeed(
            String.format("%s: %s v%s", publisher, series, volume),
            String.valueOf(
                this.opdsUtils.createIdForEntry(
                    "PUBLISHER:SERIES:VOLUME", publisher + ":" + series + ":" + volume)));
    this.comicDetailService
        .getAllComicBooksForPublisherAndSeriesAndVolume(publisher, series, volume, email, unread)
        .forEach(
            comicBook -> {
              log.trace("Adding comic book to feed");
              result.getEntries().add(this.opdsUtils.createComicEntry(comicBook));
            });
    result
        .getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format(
                    "/opds/collections/publishers/%s/series/%s/volumes/%s?unread=%s",
                    this.opdsUtils.urlEncodeString(publisher),
                    this.opdsUtils.urlEncodeString(series),
                    this.opdsUtils.urlEncodeString(volume),
                    String.valueOf(unread))));
    return result;
  }

  /**
   * Returns the acquisition feed for the given reading list by id.
   *
   * @param email the reader's email
   * @param id the reading list id
   * @return the acquisition feed
   * @throws OPDSException if an error occurs loading the reading list or its entries
   */
  public OPDSAcquisitionFeed getComicFeedForReadingList(final String email, final long id)
      throws OPDSException {
    try {
      final ReadingList list = this.readingListService.loadReadingListForUser(email, id);
      final OPDSAcquisitionFeed response =
          new OPDSAcquisitionFeed(
              String.format("Reading List: %s (%d)", list.getName(), list.getEntries().size()),
              String.valueOf(READING_LIST_FACTOR_ID + list.getId()));
      response
          .getLinks()
          .add(new OPDSLink(NAVIGATION_FEED_LINK_TYPE, SELF, String.format("/opds/lists/%d/", id)));
      list.getEntries().stream()
          .forEach(
              comic -> {
                log.trace("Adding comic to reading list entries: {}", comic.getId());
                response.getEntries().add(this.opdsUtils.createComicEntry(comic));
              });

      return response;
    } catch (ReadingListException error) {
      throw new OPDSException("Failed to load reading list entries", error);
    }
  }

  /**
   * Retrieves the acquisition feed of comics with a store date in the given week and year.Comics
   * previous read by the user are filtered if the unread flag is set.
   *
   * @param email the reader's email address
   * @param year the target year
   * @param week the target week
   * @param unread the unread flag
   * @return the acquisition feed
   */
  public OPDSAcquisitionFeed getComicsFeedForYearAndWeek(
      final String email, final int year, final int week, final boolean unread) {
    final Date weekStarts = this.getDateFor(year, week, Calendar.SUNDAY);
    final Date weekEnds = this.getDateFor(year, week, Calendar.SATURDAY);

    final OPDSAcquisitionFeed response =
        new OPDSAcquisitionFeed(
            String.format(
                "Comics For Week Of %s To %s",
                simpleDateFormat.format(weekStarts), simpleDateFormat.format(weekEnds)),
            String.valueOf(COMIC_STORE_DATE_FOR_YEAR_ID + year));
    log.trace("Loading comics");
    this.comicDetailService.getComicsForYearAndWeek(year, week, email, unread).stream()
        .forEach(
            comicBook -> {
              log.trace("Adding comic to collection entries: {}", comicBook.getId());
              response.getEntries().add(this.opdsUtils.createComicEntry(comicBook));
            });
    response
        .getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format(
                    "/opds/dates/released/years/%d/weeks/%d?unread=%s", year, week, unread)));
    return response;
  }

  private Date getDateFor(final Integer year, final Integer week, final int dayOfWeek) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.set(Calendar.YEAR, year);
    calendar.set(Calendar.WEEK_OF_YEAR, week);
    calendar.set(Calendar.DAY_OF_WEEK, dayOfWeek);
    return calendar.getTime();
  }

  /**
   * Returns a feed contain those comics that match the provided search term.
   *
   * @param term the term
   * @return the feeds
   */
  public OPDSAcquisitionFeed getComicsFeedForSearchTerms(final String term) {
    final OPDSAcquisitionFeed response =
        new OPDSAcquisitionFeed(String.format("Search for term: %s", term), term);
    log.trace("Loading comics");
    this.comicDetailService.getComicForSearchTerm(term).stream()
        .forEach(
            comicDetail -> {
              log.trace("Adding comic to collection entries: {}", comicDetail.getId());
              response.getEntries().add(this.opdsUtils.createComicEntry(comicDetail));
            });
    response
        .getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE, SELF, String.format("/opds/search?terms=%s", term)));
    return response;
  }
}
