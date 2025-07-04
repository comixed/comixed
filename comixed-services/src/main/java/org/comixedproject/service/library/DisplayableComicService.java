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

package org.comixedproject.service.library;

import java.util.List;
import java.util.Objects;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.DisplayableComicRepository;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>DisplayableComicService</code> provides methods for working with instances of {@link
 * DisplayableComic}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class DisplayableComicService {
  @Autowired private DisplayableComicRepository displayableComicRepository;
  @Autowired private ObjectFactory<DisplayableComicExampleBuilder> exampleBuilderObjectFactory;
  @Autowired private ReadingListService readingListService;

  /**
   * Loads comics filtered by the optional fields values provided.
   *
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param coverYear the optional cover year
   * @param coverMonth the optional cover month
   * @param archiveType the optional archive type
   * @param comicType the optional comic type
   * @param comicState the optional comic state
   * @param unscrapedState the optional unscraped state
   * @param searchText the optional search text
   * @param publisher the optional publisher
   * @param series the optional series
   * @param volume the optional volume
   * @param pageCount the optional page count
   * @param sortBy the optional sort field
   * @param sortDirection the optional sort direction
   * @return the comics
   */
  @Transactional
  public List<DisplayableComic> loadComicsByFilter(
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
      final Integer pageCount,
      final String sortBy,
      final String sortDirection) {
    log.debug("Loading comic details");
    final var displayableComicExample =
        doCreateExample(
            coverYear,
            coverMonth,
            archiveType,
            comicType,
            comicState,
            unscrapedState,
            searchText,
            publisher,
            series,
            volume,
            pageCount);

    if (Objects.nonNull(pageSize) && Objects.nonNull(pageIndex)) {
      return this.displayableComicRepository
          .findAll(
              displayableComicExample,
              PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)))
          .stream()
          .toList();
    } else {
      return this.displayableComicRepository.findAll(displayableComicExample);
    }
  }

  /**
   * Returns the comic ids that match the provided filter.
   *
   * @param coverYear the optional cover year
   * @param coverMonth the optional cover month
   * @param archiveType the optional archive type
   * @param comicType the optional comic type
   * @param comicState the optional comic state
   * @param unscrapedState the optional unscraped state
   * @param pageCount the optional page count
   * @param searchText the optional search text
   * @return the ids
   */
  @Transactional
  public List<Long> getIdsByFilter(
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final Integer pageCount,
      final String searchText) {
    final var displayableComicExample =
        doCreateExample(
            coverYear,
            coverMonth,
            archiveType,
            comicType,
            comicState,
            unscrapedState,
            searchText,
            null,
            null,
            null,
            pageCount);

    return this.displayableComicRepository.findAll(displayableComicExample).stream()
        .map(DisplayableComic::getComicDetailId)
        .toList();
  }

  /**
   * Returns the list of cover years for the given filter criteria.
   *
   * @param archiveType the optional archive type
   * @param comicType the optional comic type
   * @param comicState the optional comic state
   * @param unscrapedState the optional unscraped state
   * @param searchText the optional search text
   * @param publisher the optional publisher
   * @param series the optional series
   * @param volume the optional volume
   * @param pageCount the optional page count
   * @return the cover years
   */
  @Transactional
  public List<Integer> getCoverYearsForFilter(
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final String searchText,
      final String publisher,
      final String series,
      final String volume,
      final Integer pageCount) {
    log.debug("Loading cover years for filter");
    final var comicDetailExample =
        doCreateExample(
            null,
            null,
            archiveType,
            comicType,
            comicState,
            unscrapedState,
            searchText,
            publisher,
            series,
            volume,
            pageCount);

    return this.displayableComicRepository.findAll(comicDetailExample).stream()
        .map(DisplayableComic::getYearPublished)
        .distinct()
        .toList();
  }

  /**
   * Returns the list of cover months for the given filter criteria.
   *
   * @param archiveType the optional archive type
   * @param comicType the optional comic type
   * @param comicState the optional comic state
   * @param unscrapedState the optional unscraped state
   * @param searchText the optional search text
   * @param publisher the optional publisher
   * @param series the optional series
   * @param volume the optional volume
   * @param pageCount the optional page count
   * @return the cover years
   */
  @Transactional
  public List<Integer> getCoverMonthsForFilter(
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final String searchText,
      final String publisher,
      final String series,
      final String volume,
      final Integer pageCount) {
    log.debug("Loading cover months for filter");
    final var comicDetailExample =
        doCreateExample(
            null,
            null,
            archiveType,
            comicType,
            comicState,
            unscrapedState,
            searchText,
            publisher,
            series,
            volume,
            pageCount);

    return this.displayableComicRepository.findAll(comicDetailExample).stream()
        .map(DisplayableComic::getMonthPublished)
        .distinct()
        .toList();
  }

  /**
   * Returns the total number of comics for the given filter criteria.
   *
   * @param coverYear the optional cover year
   * @param coverMonth the optional cover month
   * @param archiveType the optional archive type
   * @param comicType the optional comic type
   * @param comicState the optional comic state
   * @param unscrapedState the optional unscraped state
   * @param searchText the optional search text
   * @param publisher the optional publisher
   * @param series the optional series
   * @param volume the optional volume
   * @param pageCount the optional page count
   * @return the cover years
   */
  @Transactional
  public long getComicCountForFilter(
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
      final Integer pageCount) {
    log.debug("Loading comic count for filter");
    final var comicDetailExample =
        doCreateExample(
            coverYear,
            coverMonth,
            archiveType,
            comicType,
            comicState,
            unscrapedState,
            searchText,
            publisher,
            series,
            volume,
            pageCount);

    return this.displayableComicRepository.count(comicDetailExample);
  }

  /**
   * Loads a displayable page worth of comics whose ids are in the provided list.
   *
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param sortBy the optional sort field
   * @param sortDirection the optional sort direction
   * @param idList the id list
   * @return the comics
   */
  @Transactional
  public List<DisplayableComic> loadComicsById(
      final Integer pageSize,
      final Integer pageIndex,
      final String sortBy,
      final String sortDirection,
      final List<Long> idList) {
    return this.displayableComicRepository.loadComicsById(
        idList, PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
  }

  /**
   * Loads a set of comics for the given tag type and value.
   *
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comics
   */
  @Transactional
  public List<DisplayableComic> loadComicsByTagTypeAndValue(
      final int pageSize,
      final int pageIndex,
      final ComicTagType tagType,
      final String tagValue,
      final String sortBy,
      final String sortDirection) {
    return this.displayableComicRepository.loadComicsByTagTypeAndValue(
        tagType,
        tagValue,
        PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
  }

  /**
   * Retrieves the comic ids for a given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the ta value
   * @return the ids
   */
  @Transactional
  public List<Long> getIdsByTagTypeAndValue(final ComicTagType tagType, final String tagValue) {
    return this.displayableComicRepository.getIdsByTagTypeAndValue(tagType, tagValue);
  }

  /**
   * Loads all comic ids for the given publisher.
   *
   * @param publisher the publisher
   * @return the comic ids
   */
  @Transactional
  public List<Long> getIdsByPublisher(final String publisher) {
    return this.displayableComicRepository.getIdsByPublisher(publisher);
  }

  /**
   * Loads all comic ids for the given publisher, series, and volume.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @return the ids
   */
  @Transactional
  public List<Long> getIdsByPublisherSeriesAndVolume(
      final String publisher, final String series, final String volume) {
    return this.displayableComicRepository.getIdsByPublisherSeriesAndVolume(
        publisher, series, volume);
  }

  /**
   * Gets the cover years for comics with the given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the years
   */
  @Transactional
  public List<Integer> getCoverYearsForTagTypeAndValue(
      final ComicTagType tagType, final String tagValue) {
    return this.displayableComicRepository.getCoverYearsForTagTypeAndValue(tagType, tagValue);
  }

  /**
   * Gets the cover months for comics with the given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the years
   */
  @Transactional
  public List<Integer> getCoverMonthsForTagTypeAndValue(
      final ComicTagType tagType, final String tagValue) {
    return this.displayableComicRepository.getCoverMonthsForTagTypeAndValue(tagType, tagValue);
  }

  /**
   * Gets the number of comics with the given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the comic count
   */
  @Transactional
  public long getComicCountForTagTypeAndValue(final ComicTagType tagType, final String tagValue) {
    return this.displayableComicRepository.getComicCountForTagTypeAndValue(tagType, tagValue);
  }

  /**
   * Returns comics not read by the given user.
   *
   * @param user the user
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comics
   */
  @Transactional
  public List<DisplayableComic> loadUnreadComics(
      final ComiXedUser user,
      final int pageSize,
      final int pageIndex,
      final String sortBy,
      final String sortDirection) {
    return this.displayableComicRepository.loadUnreadComics(
        user.getReadComicBooks(),
        PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
  }

  /**
   * Returns comics read by the given user.
   *
   * @param user the user
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comics
   */
  @Transactional
  public List<DisplayableComic> loadReadComics(
      final ComiXedUser user,
      final int pageSize,
      final int pageIndex,
      final String sortBy,
      final String sortDirection) {
    return this.displayableComicRepository.loadReadComics(
        user.getReadComicBooks(),
        PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
  }

  /**
   * Returns comics for the given reading list.
   *
   * @param email the user's email
   * @param readingListId the reading list id
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comics
   * @throws LibraryException if an error occurs
   */
  @Transactional
  public List<DisplayableComic> loadComicsForList(
      final String email,
      final long readingListId,
      final int pageSize,
      final int pageIndex,
      final String sortBy,
      final String sortDirection)
      throws LibraryException {
    try {
      log.debug("Loading reading list entries");
      final ReadingList readingList =
          this.readingListService.loadReadingListForUser(email, readingListId);
      return this.displayableComicRepository.loadComicsForList(
          readingList.getReadingListId(),
          PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
    } catch (ReadingListException error) {
      throw new LibraryException("Failed to load entries for reading list", error);
    }
  }

  /**
   * Loads duplicate comics to display.
   *
   * @param pageSize the page size
   * @param pageIndex the page index
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the comics
   */
  @Transactional
  public List<DisplayableComic> loadDuplicateComics(
      final int pageSize, final int pageIndex, final String sortBy, final String sortDirection) {
    log.debug(
        "Loading a page of duplicate comics: index={} size={} sort by={} direction={}",
        pageIndex,
        pageSize,
        sortBy,
        sortDirection);
    return this.displayableComicRepository.loadDuplicateComics(
        PageRequest.of(pageIndex, pageSize, this.doCreateSort(sortBy, sortDirection)));
  }

  /**
   * Loads the set of comic ids for all duplicate comics.
   *
   * @return the ids
   */
  @Transactional
  public List<Long> getDuplicateComicIds() {
    return this.displayableComicRepository.getDuplicateComicIds();
  }

  /**
   * Returns the number of duplicate comics.
   *
   * @return the count
   */
  @Transactional
  public long getDuplicateComicCount() {
    return this.displayableComicRepository.getDuplicateComicCount();
  }

  Example<DisplayableComic> doCreateExample(
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
      final Integer pageCount) {
    final DisplayableComicExampleBuilder builder = this.exampleBuilderObjectFactory.getObject();

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
    builder.setPageCount(pageCount);

    return builder.build();
  }

  Sort doCreateSort(final String sortField, final String sortDirection) {
    if (!StringUtils.hasLength(sortField) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortField) {
      case "archive-type" -> fieldName = "archiveType";
      case "comic-state" -> fieldName = "comicState";
      case "comic-type" -> fieldName = "comicType";
      case "publisher", "series", "volume" -> fieldName = sortField;
      case "issue-number" -> fieldName = "sortableIssueNumber";
      case "page-count" -> fieldName = "pageCount";
      case "added-date" -> fieldName = "addedDate";
      case "cover-date" -> fieldName = "coverDate";
      case "comic-count" -> fieldName = "comicCount";
      case "tag-value" -> fieldName = "value";
      case "store-date" -> fieldName = "storeDate";
      default -> fieldName = "comicDetailId";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }
}
