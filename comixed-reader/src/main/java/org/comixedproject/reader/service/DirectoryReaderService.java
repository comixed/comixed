/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.reader.service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.reader.ReaderUtil;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>DirectoryReaderService</code> provides services for loading directories.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class DirectoryReaderService {
  @Autowired private ComicDetailService comicDetailService;
  @Autowired private ReadingListService readingListService;

  private static final SimpleDateFormat simpleDateFormat = new SimpleDateFormat("MMM yyyy");

  /**
   * Returns cover date entries for each publisher.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param rootUrl the root URL
   * @return the entries
   */
  public List<DirectoryEntry> getAllCoverDates(
      final String email, final boolean unread, final String rootUrl) {
    return this.comicDetailService.getAllCoverDates(email, unread).stream()
        .map(
            entry ->
                new DirectoryEntry(
                    ReaderUtil.generateId(String.format("publisher:%s", entry)),
                    entry,
                    String.format("%s/%s?unread=%s", rootUrl, ReaderUtil.urlEncode(entry), unread)))
        .toList();
  }

  /**
   * Returns entries for all comics with a given cover date.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param coverDate the cover date
   * @param urlRoot the url root
   * @return the entries
   */
  public List<DirectoryEntry> getAllComicsForCoverDate(
      final String email, final boolean unread, final String coverDate, final String urlRoot) {
    return this.comicDetailService.getAllComicsForCoverDate(coverDate, email, unread).stream()
        .map(comicDetail -> this.doCreateDirectoryEntry(comicDetail, urlRoot))
        .toList();
  }

  /**
   * Returns directory entries for each publisher.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param rootUrl the root URL
   * @return the entries
   */
  public List<DirectoryEntry> getAllPublishers(
      final String email, final boolean unread, final String rootUrl) {
    return this.comicDetailService.getAllPublishers(email, unread).stream()
        .map(
            entry ->
                new DirectoryEntry(
                    ReaderUtil.generateId(String.format("publisher:%s", entry)),
                    entry,
                    String.format("%s/%s?unread=%s", rootUrl, ReaderUtil.urlEncode(entry), unread)))
        .toList();
  }

  /**
   * Returns all series.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param rootUrl the root URL
   * @return the entries
   */
  public List<DirectoryEntry> getAllSeries(
      final String email, final boolean unread, final String rootUrl) {
    return this.comicDetailService.getAllSeries(email, unread).stream()
        .map(
            entry -> {
              final DirectoryEntry result =
                  new DirectoryEntry(
                      ReaderUtil.generateId(String.format("series:%s", entry)),
                      entry,
                      String.format(
                          "%s/%s?unread=%s", rootUrl, ReaderUtil.urlEncode(entry), unread));
              result.setDirectory(true);
              return result;
            })
        .toList();
  }

  /**
   * Returns all publishers with a given series name.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param series the series
   * @param rootUrl the root URL
   * @return the entries
   */
  public List<DirectoryEntry> getAllPublishersForSeries(
      final String email, final boolean unread, final String series, final String rootUrl) {
    return this.comicDetailService.getAllPublishersForSeries(series, email, unread).stream()
        .map(
            entry ->
                new DirectoryEntry(
                    ReaderUtil.generateId(String.format("series:%s:publisher:%s", series, entry)),
                    entry,
                    String.format("%s/%s?unread=%s", rootUrl, ReaderUtil.urlEncode(entry), unread)))
        .toList();
  }

  /**
   * Returns all series for a given publisher.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param publisher the publisher
   * @param rootUrl the root URL
   * @return the entries
   */
  public List<DirectoryEntry> getAllSeriesForPublisher(
      final String email, final boolean unread, final String publisher, final String rootUrl) {
    return this.comicDetailService.getAllSeriesForPublisher(publisher, email, unread).stream()
        .map(
            entry ->
                new DirectoryEntry(
                    ReaderUtil.generateId(
                        String.format("publisher:%s:series:%s", publisher, entry)),
                    entry,
                    String.format("%s/%s?unread=%s", rootUrl, ReaderUtil.urlEncode(entry), unread)))
        .toList();
  }

  /**
   * Returns all volumes for a given publisher and series.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param publisher the publisher
   * @param series the series
   * @param rootUrl the root URL
   * @return the entries
   */
  public List<DirectoryEntry> getAllVolumesForPublisherAndSeries(
      final String email,
      final boolean unread,
      final String publisher,
      final String series,
      final String rootUrl) {
    return this.comicDetailService
        .getAllVolumesForPublisherAndSeries(publisher, series, email, unread)
        .stream()
        .map(
            entry ->
                new DirectoryEntry(
                    ReaderUtil.generateId(
                        String.format(
                            "publisher:%s:series:%s:volume:%s", publisher, series, entry)),
                    entry,
                    String.format("%s/%s?unread=%s", rootUrl, ReaderUtil.urlEncode(entry), unread)))
        .toList();
  }

  /**
   * Returns all comics for the given publisher, series, and volume.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param rootUrl the root URL
   * @return the entries
   */
  public List<DirectoryEntry> getAllComicsForPublisherAndSeriesAndVolume(
      final String email,
      final boolean unread,
      final String publisher,
      final String series,
      final String volume,
      final String rootUrl) {
    return this.comicDetailService
        .getAllComicBooksForPublisherAndSeriesAndVolume(publisher, series, volume, email, unread)
        .stream()
        .map(entry -> doCreateDirectoryEntry(entry, rootUrl))
        .toList();
  }

  /**
   * Returns all reading lists for the user.
   *
   * @param email the user's email
   * @param urlRoot the root URL
   * @return the entries
   * @throws ReadingListException if the reading list is invalid
   */
  public List<DirectoryEntry> getAllReadingLists(final String email, final String urlRoot)
      throws ReadingListException {
    return this.readingListService.loadReadingListsForUser(email).stream()
        .map(
            list ->
                new DirectoryEntry(
                    ReaderUtil.generateId(String.format("reading-list:%s", list.getName())),
                    list.getName(),
                    String.format("%s/%s", urlRoot, list.getReadingListId())))
        .toList();
  }

  /**
   * Returns all comics for the given reading list.
   *
   * @param email the user's email
   * @param id the reading list id
   * @param urlRoot the root url
   * @return the entries
   */
  public List<DirectoryEntry> getAllComicsForReadingList(
      final String email, final Long id, final String urlRoot) {
    return this.comicDetailService.getAllComicsForReadingList(email, id).stream()
        .map(comicDetail -> this.doCreateDirectoryEntry(comicDetail, urlRoot))
        .toList();
  }

  /**
   * Returns the list of all values for the given tag type.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param tagType the tag type
   * @param urlRoot the url root
   * @return the entries
   */
  public List<DirectoryEntry> getAllForTagType(
      final String email, final boolean unread, final ComicTagType tagType, final String urlRoot) {
    return this.comicDetailService.getAllValuesForTag(tagType, email, unread).stream()
        .map(
            entry ->
                new DirectoryEntry(
                    ReaderUtil.generateId(String.format("comic-tag:%s:value:%s", tagType, entry)),
                    entry,
                    String.format("%s/%s", urlRoot, ReaderUtil.urlEncode(entry))))
        .toList();
  }

  /**
   * Returns entries for all comics with a given tag type and value.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param urlRoot the url root
   * @return the entries
   */
  public List<DirectoryEntry> getAllComicsForTagTypeAndValue(
      final String email,
      final boolean unread,
      final ComicTagType tagType,
      final String tagValue,
      final String urlRoot) {
    return this.comicDetailService.getAllComicsForTag(tagType, tagValue, email, unread).stream()
        .map(comicDetail -> this.doCreateDirectoryEntry(comicDetail, urlRoot))
        .toList();
  }

  private DirectoryEntry doCreateDirectoryEntry(
      final ComicDetail comicDetail, final String rootUrl) {
    final DirectoryEntry result =
        new DirectoryEntry(
            ReaderUtil.generateId(
                String.format(
                    "publisher:%s:series:%s:volume:%s:comic:%s",
                    comicDetail.getPublisher(),
                    comicDetail.getSeries(),
                    comicDetail.getVolume(),
                    comicDetail.getFilename())),
            this.createTitle(comicDetail),
            String.format(rootUrl, comicDetail.getComicId()));
    result.setFilename(comicDetail.getBaseFilename());
    result.setFileSize(FileUtils.sizeOf(comicDetail.getFile()));
    result.setDirectory(false);
    result.setCoverUrl(String.format(rootUrl, comicDetail.getComicId()));
    return result;
  }

  private @NonNull String createTitle(final ComicDetail comicDetail) {
    return String.format(
        "%s V%s #%s (%s)",
        this.getValueOrDefault(comicDetail.getSeries(), "[unknown]"),
        this.getValueOrDefault(comicDetail.getVolume(), "????"),
        this.getValueOrDefault(comicDetail.getIssueNumber(), "?"),
        this.getValueOrDefault(comicDetail.getCoverDate(), "unknown"));
  }

  private String getValueOrDefault(final String value, final String defaultValue) {
    if (Objects.isNull(value) || value.isEmpty()) return defaultValue;
    return value;
  }

  private Object getValueOrDefault(final Date coverDate, final String defaultValue) {
    if (Objects.isNull(coverDate)) return defaultValue;
    return simpleDateFormat.format(coverDate);
  }
}
