/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project.
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

import java.util.Objects;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.library.DisplayableComic;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>DisplayableComicExampleBuilder</code> provides a component that can build an {@link
 * Example} to search for instances of {@link DisplayableComic}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class DisplayableComicExampleBuilder {
  @Setter private Integer coverYear;
  @Setter private Integer coverMonth;
  @Setter private ArchiveType archiveType;
  @Setter private ComicType comicType;
  @Setter private ComicState comicState;
  @Setter private boolean unscrapedState = false;
  @Setter private Boolean missing = false;
  @Setter private String searchText;
  @Setter private String publisher;
  @Setter private String series;
  @Setter private String volume;
  @Setter private Integer pageCount;

  public Example<DisplayableComic> build() {
    log.trace("Building ComicDetail example");
    final DisplayableComic detail = new DisplayableComic();

    detail.setComicState(null);
    detail.setCoverDate(null);
    detail.setMonthPublished(null);
    detail.setYearPublished(null);
    detail.setAddedDate(null);
    detail.setComicType(null);
    detail.setUnscraped(null);
    detail.setPageCount(null);

    ExampleMatcher matcher = ExampleMatcher.matching();

    if (StringUtils.hasLength(searchText)) {
      log.debug("Returning comics with filter text: {}", searchText);
      detail.setPublisher(searchText);
      detail.setSeries(searchText);
      detail.setTitle(searchText);
      detail.setNotes(searchText);
      detail.setDescription(searchText);
      matcher =
          ExampleMatcher.matchingAny()
              .withMatcher(
                  "publisher", ExampleMatcher.GenericPropertyMatchers.ignoreCase().contains())
              .withMatcher("series", ExampleMatcher.GenericPropertyMatchers.ignoreCase().contains())
              .withMatcher("title", ExampleMatcher.GenericPropertyMatchers.ignoreCase().contains())
              .withMatcher("notes", ExampleMatcher.GenericPropertyMatchers.ignoreCase().contains())
              .withMatcher(
                  "setDescription", ExampleMatcher.GenericPropertyMatchers.ignoreCase().contains());
    } else {
      if (coverYear != null) {
        log.debug("Setting cover year filter: {}", coverYear);
        detail.setYearPublished(coverYear);
        matcher = matcher.withMatcher("coverYear", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (coverMonth != null) {
        log.debug("Setting cover month filter: {}", coverMonth);
        detail.setMonthPublished(coverMonth);
        matcher = matcher.withMatcher("coverMonth", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (archiveType != null) {
        log.debug("Setting archive type filter: {}", archiveType);
        detail.setArchiveType(archiveType);
        matcher =
            matcher.withMatcher("archiveType", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (comicType != null) {
        log.debug("Setting comic type filter: {}", comicType);
        detail.setComicType(comicType);
        matcher = matcher.withMatcher("comicType", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (comicState != null) {
        log.debug("Setting comic state filter: {}", comicState);
        detail.setComicState(comicState);
        matcher = matcher.withMatcher("comicState", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (unscrapedState) {
        log.debug("Enabling unscraped filter");
        detail.setUnscraped(Boolean.TRUE);
        matcher = matcher.withMatcher("unscraped", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (missing) {
        log.debug("Enabling missing filter");
        detail.setMissing(Boolean.TRUE);
        matcher = matcher.withMatcher("missing", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (StringUtils.hasLength(publisher)) {
        log.debug("Enabling publisher filter");
        detail.setPublisher(publisher);
        matcher = matcher.withMatcher("publisher", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (StringUtils.hasLength(series)) {
        log.debug("Enabling series filter");
        detail.setSeries(series);
        matcher = matcher.withMatcher("series", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (StringUtils.hasLength(volume)) {
        log.debug("Enabling volume filter");
        detail.setVolume(volume);
        matcher = matcher.withMatcher("volume", ExampleMatcher.GenericPropertyMatchers.exact());
      }

      if (Objects.nonNull(pageCount) && pageCount >= 0) {
        log.debug("Enabling page count filter");
        detail.setPageCount(pageCount);
        matcher = matcher.withMatcher("pageCount", ExampleMatcher.GenericPropertyMatchers.exact());
      }
    }

    return Example.of(detail, matcher);
  }
}
