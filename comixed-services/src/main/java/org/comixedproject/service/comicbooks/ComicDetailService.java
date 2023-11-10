/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

package org.comixedproject.service.comicbooks;

import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.collections.CollectionEntry;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>ComicDetailService</code> provides methods for working with instances of {@link
 * ComicDetail}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicDetailService {
  @Autowired private ComicDetailRepository comicDetailRepository;

  @Autowired
  private ObjectFactory<ComicDetailExampleBuilder> comicDetailExampleBuilderObjectFactory;

  /**
   * Loads a set of comic details with ids greater than the last id.
   *
   * @param lastId the last id
   * @param maximum the maximum record
   * @return the list of comic details
   */
  @Transactional
  public List<ComicDetail> loadById(final long lastId, final int maximum) {
    log.debug("Loading comic detail records: last id={} maximum={}", lastId, maximum);
    return this.comicDetailRepository.getWithIdGreaterThan(lastId, PageRequest.of(0, maximum));
  }

  /**
   * Returns the set of all publishers. Filters out comics read by the user if the flag is set.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @return the publishers
   */
  public Set<String> getAllPublishers(final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all publishers with unread comics: email={}", email);
      return this.comicDetailRepository.getAllUnreadPublishers(email);
    } else {
      log.debug("Loading all publishers");
      return this.comicDetailRepository.getAllPublishers();
    }
  }

  /**
   * Returns the set of series for the given publisher. Filters out comics read by the user if the
   * flag is set.
   *
   * @param publisher the publisher
   * @param email the user's email
   * @param unread the unread flag
   * @return the series
   */
  public Set<String> getAllSeriesForPublisher(
      final String publisher, final String email, final boolean unread) {
    if (unread) {
      log.debug(
          "Loading all series for publisher with unread comics: publisher={} email={}",
          publisher,
          email);
      return this.comicDetailRepository.getAllUnreadSeriesForPublisher(publisher, email);
    } else {
      log.debug("Loading all series for publisher: publisher={}", publisher);
      return this.comicDetailRepository.getAllSeriesForPublisher(publisher);
    }
  }

  /**
   * Returns the set of volumes for the given publisher and series. Filters out comics read by the
   * user if the flag is set.
   *
   * @param publisher the publisher
   * @param series the series
   * @param email the user's email
   * @param unread the unread flag
   * @return the volumes
   */
  public Set<String> getAllVolumesForPublisherAndSeries(
      final String publisher, final String series, final String email, final boolean unread) {
    if (unread) {
      log.debug(
          "Loading all volumes for publisher and series with unread comics: publisher={} series={} email={}",
          publisher,
          series,
          email);
      return this.comicDetailRepository.getAllUnreadVolumesForPublisherAndSeries(
          publisher, series, email);
    } else {
      log.debug(
          "LOading all volumes for publisher and series: publisher={} series={} email={}",
          publisher,
          series);
      return this.comicDetailRepository.getAllVolumesForPublisherAndSeries(publisher, series);
    }
  }

  /**
   * Returns the list of all series.
   *
   * @return the series list
   */
  public Set<String> getAllSeries() {
    log.debug("Loading all series");
    return this.comicDetailRepository.getAllSeries();
  }

  /**
   * Returns the set of series names. Filters out comics read by the user if the flag is set.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @return the series
   */
  public Set<String> getAllSeries(final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all series with unread comics: email={}", email);
      return this.comicDetailRepository.getAllUnreadSeries(email);
    } else {
      log.debug("Loading all series");
      return this.comicDetailRepository.getAllSeries();
    }
  }

  /**
   * Returns the set of publishers for the given series. Filters out comics read by the user if the
   * flag is set.
   *
   * @param series the series name
   * @param email the user's email
   * @param unread the unread flag
   * @return the volumes
   */
  public Set<String> getAllPublishersForSeries(
      final String series, final String email, final boolean unread) {
    if (unread) {
      log.debug(
          "Loading all publishers for series with unread comics: series={} email={}",
          series,
          email);
      return this.comicDetailRepository.getAllUnreadPublishersForSeries(series, email);
    } else {
      log.debug("Loading all publishers for series: {}", series);
      return this.comicDetailRepository.getAllPublishersForSeries(series);
    }
  }

  /**
   * Returns the list of entries for the given publisher, series, and volume. Optionally filters by
   * the unread status for the given user.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param email the user email
   * @param unread the unread flag
   * @return the comic details
   */
  public List<ComicDetail> getAllComicBooksForPublisherAndSeriesAndVolume(
      final String publisher,
      final String series,
      final String volume,
      final String email,
      final boolean unread) {
    if (unread) {
      log.debug(
          "Loading unread comics: publisher={} series={} volume={} email={}",
          publisher,
          series,
          volume,
          email);
      return this.comicDetailRepository.getAllUnreadForPublisherAndSeriesAndVolume(
          publisher, series, volume, email);
    }

    log.debug(
        "Loading comics: publisher={} series={} volume={} email={}",
        publisher,
        series,
        volume,
        email);
    return this.comicDetailRepository.getAllForPublisherAndSeriesAndVolume(
        publisher, series, volume);
  }

  /**
   * Returns the set of all comics with a given tag type. Optionally filters by the unread state for
   * the given user.
   *
   * @param tagType the tag type
   * @param email the user's email
   * @param unread the unread flag
   * @return the comic details
   */
  public Set<String> getAllValuesForTag(
      final ComicTagType tagType, final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all unread comics: tag type={} email={}", tagType, email);
      return this.comicDetailRepository.getAllUnreadValuesForTagType(tagType, email);
    } else {
      log.debug("Lading all comics: tag type={}", tagType);
      return this.comicDetailRepository.getAllValuesForTagType(tagType);
    }
  }

  /**
   * Returns the list of all cover date years. Optionally filters by the unread state for the given
   * user.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @return the years
   */
  public Set<Integer> getAllYears(final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all years with unread comics: email={}", email);
      return this.comicDetailRepository.getAllUnreadYears(email);
    } else {
      log.debug("Loading all years");
      return this.comicDetailRepository.getAllYears();
    }
  }

  /**
   * Returns the list of all weeks for a given year. Optionally filters by the unread state for the
   * given user.
   *
   * @param year the year
   * @param email the user's email
   * @param unread the unread flag
   * @return the weeks
   */
  public Set<Integer> getAllWeeksForYear(final int year, final String email, final boolean unread) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    if (unread) {
      log.debug("Loading all weeks with unread comics for year: year={} email={}", year, email);
      return this.comicDetailRepository.getAllUnreadWeeksForYear(year, email).stream()
          .map(
              coverDate -> {
                calendar.setTime(coverDate);
                return calendar.get(Calendar.WEEK_OF_YEAR);
              })
          .collect(Collectors.toSet());
    } else {
      log.debug("Loading all weeks for year: year={}", year);
      return this.comicDetailRepository.getAllWeeksForYear(year).stream()
          .map(
              coverDate -> {
                calendar.setTime(coverDate);
                return calendar.get(Calendar.WEEK_OF_YEAR);
              })
          .collect(Collectors.toSet());
    }
  }

  /**
   * Returns the list of comics for the given year and week. Optionally filters by the unread state
   * for the given user.
   *
   * @param year the year
   * @param week the week
   * @param email the user's email
   * @param unread the unread flag
   * @return the matching comics
   */
  public List<ComicDetail> getComicsForYearAndWeek(
      final int year, final int week, final String email, final boolean unread) {
    log.trace("Converting year and week to start and end dates");
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    calendar.set(Calendar.YEAR, year);
    calendar.set(Calendar.WEEK_OF_YEAR, week);
    log.trace("Getting first day of requested week");
    calendar.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
    final Date startDate = calendar.getTime();
    log.trace("Getting last day of requested week");
    calendar.set(Calendar.DAY_OF_WEEK, Calendar.SATURDAY);
    final Date endDate = calendar.getTime();

    if (unread) {
      log.debug(
          "Loading unread comics for given year and week: year={} week={} email={}",
          year,
          week,
          email);
      return this.comicDetailRepository.getAllUnreadForYearAndWeek(startDate, endDate, email);
    } else {
      log.debug("Loading all comics for year and week: year={} week={}", year, week);
      return this.comicDetailRepository.getAllForYearAndWeek(startDate, endDate);
    }
  }

  /**
   * Returns all comics that match the given search term.
   *
   * @param term the search term
   * @return the matching comics
   */
  public List<ComicDetail> getComicForSearchTerm(final String term) {
    log.debug("Loading all comics for search term: \"{}\"", term);
    return this.comicDetailRepository.getForSearchTerm(term);
  }

  /**
   * Returns all comics with the given tag type and value. Optionally filters by the unread state
   * for the given user.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param email the use's email
   * @param unread the unread flag
   * @return the matching comics
   */
  public List<ComicDetail> getAllComicsForTag(
      final ComicTagType tagType, final String tagValue, final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all unread comics for tag type: tag type={} email={}", tagType, email);
      return this.comicDetailRepository.getAllUnreadComicsForTagType(tagType, tagValue, email);
    } else {
      log.debug("Loading all comics for tag type: tag type={}", tagType);
      return this.comicDetailRepository.getAllComicsForTagType(tagType, tagValue);
    }
  }

  /**
   * Returns the page of comics for the given index and filters.
   *
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param coverYear the cover year filter
   * @param coverMonth the cover month filter
   * @param archiveType the archive type filter
   * @param comicType the comic type filter
   * @param comicState the comic state filter
   * @param unscrapedState the unscraped state filter
   * @param searchText the search text filter
   * @param publisher the publisher filter
   * @param series the series filter
   * @param volume the volume filter
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comic details
   */
  public List<ComicDetail> loadComicDetailList(
      final Integer pageSize,
      final Integer pageIndex,
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final String searchText,
      final String publisher,
      final String series,
      final String volume,
      final String sortBy,
      final String sortDirection) {
    log.debug("Loading comic details");
    final ComicDetailExampleBuilder builder =
        this.comicDetailExampleBuilderObjectFactory.getObject();

    builder.setCoverYear(coverYear);
    builder.setCoverMonth(coverMonth);
    builder.setArchiveType(archiveType);
    builder.setComicType(comicType);
    builder.setComicState(comicState);
    builder.setUnscrapedState(unscrapedState);
    builder.setSearchText(searchText);
    builder.setPublisher(publisher);
    builder.setSeries(series);
    builder.setVolume(volume);

    final Example<ComicDetail> comicDetailExample = builder.build();

    if (pageSize != null && pageIndex != null) {
      return this.comicDetailRepository
          .findAll(
              comicDetailExample,
              PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)))
          .stream()
          .collect(Collectors.toList());
    } else {
      return this.comicDetailRepository.findAll(comicDetailExample).stream()
          .collect(Collectors.toList());
    }
  }

  /**
   * Returns the total number of comics found when the given filters are applied.
   *
   * @param coverYear the cover year filter
   * @param coverMonth the cover month filter
   * @param archiveType the archive type filter
   * @param comicType the comic type filter
   * @param comicState the comic state filter
   * @param unscrapedState the unscraped state filter
   * @param searchText the search text filter
   * @param publisher the publisher filter
   * @param series the series filter
   * @param volume the volume filter
   * @return the comic count
   */
  public long getFilterCount(
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final String searchText,
      final String publisher,
      final String series,
      final String volume) {
    log.debug("Loading filtered comic detail count");
    final ComicDetailExampleBuilder builder =
        this.comicDetailExampleBuilderObjectFactory.getObject();
    builder.setCoverYear(coverYear);
    builder.setCoverMonth(coverMonth);
    builder.setArchiveType(archiveType);
    builder.setComicType(comicType);
    builder.setComicState(comicState);
    builder.setUnscrapedState(unscrapedState);
    builder.setSearchText(searchText);
    builder.setPublisher(publisher);
    builder.setSeries(series);
    builder.setVolume(volume);

    final Example<ComicDetail> comicDetailExample = builder.build();

    return this.comicDetailRepository.count(comicDetailExample);
  }

  /**
   * Returns the total number of comics with a given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the total comic count
   */
  public long getFilterCount(final ComicTagType tagType, final String tagValue) {
    log.debug("Loading filtered comic count for tag: type={} value={}", tagType, tagValue);
    return this.comicDetailRepository.getFilterCount(tagType, tagValue);
  }

  /**
   * Loads a set of records by their id.
   *
   * @param ids the record ids
   * @return the records
   */
  public List<ComicDetail> loadComicDetailListById(final Set<Long> ids) {
    log.debug("Loading comic details by id: {}", ids);
    return this.comicDetailRepository.findAllById(ids);
  }

  /**
   * Returns the list of cover years for the given filter criteria.
   *
   * @param coverYear the cover year filter
   * @param coverMonth the cover month filter
   * @param archiveType the archive type filter
   * @param comicType the comic type filter
   * @param comicState the comic state filter
   * @param unscrapedState the unscraped state filter
   * @param searchText the search text filter
   * @param publisher the publisher filter
   * @param series the series filter
   * @param volume the volume filter
   * @return the cover years
   */
  public List<Integer> getCoverYears(
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final String searchText,
      final String publisher,
      final String series,
      final String volume) {
    log.debug("Loading cover years");
    final ComicDetailExampleBuilder builder =
        this.comicDetailExampleBuilderObjectFactory.getObject();
    builder.setCoverYear(coverYear);
    builder.setCoverMonth(coverMonth);
    builder.setArchiveType(archiveType);
    builder.setComicType(comicType);
    builder.setComicState(comicState);
    builder.setUnscrapedState(unscrapedState);
    builder.setSearchText(searchText);
    builder.setPublisher(publisher);
    builder.setSeries(series);
    builder.setVolume(volume);

    final Example<ComicDetail> comicDetailExample = builder.build();

    return this.comicDetailRepository.findAll(comicDetailExample).stream()
        .map(ComicDetail::getYearPublished)
        .distinct()
        .collect(Collectors.toList());
  }

  /**
   * Returns the list of cover years for the given set of record ids.
   *
   * @param ids the record ids
   * @return the years
   */
  public List<Integer> getCoverYears(final Set<Long> ids) {
    log.debug("Loading cover years for ids: {}", ids);
    return this.comicDetailRepository.findAllById(ids).stream()
        .map(ComicDetail::getYearPublished)
        .distinct()
        .collect(Collectors.toList());
  }

  /**
   * Returns all cover years for comics with the given tag type and value.
   *
   * @param tagType the tage type
   * @param tagValue the tag value
   * @return the years
   */
  public List<Integer> getCoverYears(final ComicTagType tagType, final String tagValue) {
    log.debug("Getting cover years for tag: type={} value={}", tagType, tagValue);
    return this.comicDetailRepository.getCoverYears(tagType, tagValue);
  }

  /**
   * Returns the list of cover years for the given filter criteria.
   *
   * @param coverYear the cover year filter
   * @param coverMonth the cover month filter
   * @param archiveType the archive type filter
   * @param comicType the comic type filter
   * @param comicState the comic state filter
   * @param unscrapedState the unscraped state filter
   * @param searchText the search text filter
   * @param publisher the publisher filter
   * @param series the series filter
   * @param volume the volume filter
   * @return the cover years
   */
  public List<Integer> getCoverMonths(
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final String searchText,
      final String publisher,
      final String series,
      final String volume) {
    log.debug("Loading cover months");
    final ComicDetailExampleBuilder builder =
        this.comicDetailExampleBuilderObjectFactory.getObject();
    builder.setCoverYear(coverYear);
    builder.setCoverMonth(coverMonth);
    builder.setArchiveType(archiveType);
    builder.setComicType(comicType);
    builder.setComicState(comicState);
    builder.setUnscrapedState(unscrapedState);
    builder.setSearchText(searchText);
    builder.setPublisher(publisher);
    builder.setSeries(series);
    builder.setVolume(volume);

    final Example<ComicDetail> comicDetailExample = builder.build();

    return this.comicDetailRepository.findAll(comicDetailExample).stream()
        .map(ComicDetail::getMonthPublished)
        .distinct()
        .collect(Collectors.toList());
  }

  /**
   * Returns the list of cover months for the given set of record ids.
   *
   * @param ids the record ids
   * @return the months
   */
  public List<Integer> getCoverMonths(final Set<Long> ids) {
    log.debug("Loading cover months for ids: {}", ids);
    return this.comicDetailRepository.findAllById(ids).stream()
        .map(ComicDetail::getMonthPublished)
        .distinct()
        .sorted()
        .collect(Collectors.toList());
  }

  /**
   * Returns the list of cover months for comics with the given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the months
   */
  public List<Integer> getCoverMonths(final ComicTagType tagType, final String tagValue) {
    log.debug("Loading cover months for tag: type={} value={}", tagType, tagValue);
    return this.comicDetailRepository.getCoverMonths(tagType, tagValue);
  }

  /**
   * Returns all records that match the provided example.
   *
   * @param example the example
   * @return the records
   */
  public List<ComicDetail> findAllByExample(final Example<ComicDetail> example) {
    log.debug("Finding all comic details by example: {}", example);
    return this.comicDetailRepository.findAll(example);
  }

  /**
   * Loads a page of comics with a given tag type and value.
   *
   * @param pageSize the number of records to return
   * @param pageIndex the page number
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comics
   */
  public List<ComicDetail> loadComicDetailListForTagType(
      final int pageSize,
      final int pageIndex,
      final ComicTagType tagType,
      final String tagValue,
      final String sortBy,
      final String sortDirection) {
    log.debug("Loading comics for collection: type={} value={}", tagType, tagValue);
    return this.comicDetailRepository.loadForTagTypeAndValue(
        tagType,
        tagValue,
        PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
  }

  /**
   * Loads a page of tag values for a given tag type.
   *
   * @param tagType the tag type
   * @param pageSize the number of records to return
   * @param pageIndex the page number
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the collection entries
   */
  public List<CollectionEntry> loadCollectionEntries(
      final ComicTagType tagType,
      final int pageSize,
      final int pageIndex,
      final String sortBy,
      final String sortDirection) {
    log.debug("Loading collection entries: type={} page={} size={}", tagType, pageIndex, pageSize);
    return this.comicDetailRepository.loadCollectionEntries(
        tagType, PageRequest.of(pageIndex, pageSize));
  }

  /**
   * Returns the number of comic books with a given tag type.
   *
   * @param tagType the tag type
   * @return the number of comics
   */
  public long loadCollectionTotalEntries(final ComicTagType tagType) {
    log.debug("Getting the number of comics with tag type: {}", tagType);
    return this.comicDetailRepository.getFilterCount(tagType);
  }

  private Sort doCreateSort(final String sortBy, final String sortDirection) {

    if (!StringUtils.hasLength(sortBy) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortBy) {
      case "archive-type":
        fieldName = "archiveType";
        break;
      case "comic-state":
        fieldName = "comicState";
        break;
      case "comic-type":
        fieldName = "comicType";
        break;
      case "publisher":
      case "series":
      case "volume":
        fieldName = sortBy;
        break;
      case "issue-number":
        fieldName = "sortableIssueNumber";
        break;
      case "added-date":
        fieldName = "addedDate";
        break;
      case "cover-date":
        fieldName = "coverDate";
        break;
      default:
        fieldName = "id";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }

  public List<ComicDetail> loadUnreadComicDetails(
      final String email,
      final int pageSize,
      final int pageIndex,
      final String sortBy,
      final String sortDirection) {
    log.debug(
        "Loading unread comics for user: email={} page={} size={}", email, pageIndex, pageSize);
    return this.comicDetailRepository.loadUnreadComicDetails(
        email, PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
  }
}
