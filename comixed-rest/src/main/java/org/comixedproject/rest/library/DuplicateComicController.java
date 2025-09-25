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

package org.comixedproject.rest.library;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.library.DuplicateComic;
import org.comixedproject.model.net.library.LoadComicsResponse;
import org.comixedproject.model.net.library.LoadDuplicateComicsListRequest;
import org.comixedproject.model.net.library.LoadDuplicateComicsListResponse;
import org.comixedproject.model.net.library.LoadDuplicateComicsRequest;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.library.DuplicateComicService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>DuplicateComicController</code> provides APIs for working with duplicate comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class DuplicateComicController {
  @Autowired private DuplicateComicService duplicateComicService;
  @Autowired private DisplayableComicService displayableComicService;

  /**
   * Loads the duplicate comic books list.
   *
   * @param request the request body
   * @return the entries
   */
  @PostMapping(
      value = "/api/library/duplicates/list",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.duplicate-comic.load")
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.DuplicateComicListView.class)
  public LoadDuplicateComicsListResponse loadDuplicateComicsList(
      @RequestBody() final LoadDuplicateComicsListRequest request) {
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Loading duplicate comic books list: {}", request);
    final List<DuplicateComic> comics =
        this.duplicateComicService.loadDuplicateComicsList(
            pageSize, pageIndex, sortBy, sortDirection);

    final long filterCount = this.duplicateComicService.getDuplicateComicBookCount();
    return new LoadDuplicateComicsListResponse(comics, filterCount);
  }

  /**
   * Loads a set of duplicate comics.
   *
   * @param request the request body
   * @return the entries
   */
  @PostMapping(
      value = "/api/library/duplicates/load",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.duplicate-comic.load")
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadDuplicateComics(
      @RequestBody() final LoadDuplicateComicsRequest request) {
    final String publisher = request.getPublisher();
    final String series = request.getSeries();
    final String volume = request.getVolume();
    final String issueNumber = request.getIssueNumber();
    final Date coverDate = request.getCoverDate();
    final int pageIndex = request.getPageIndex();
    final int pageSize = request.getPageSize();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Loading duplicate comic book details: {}", request);
    final List<DisplayableComic> comics =
        this.displayableComicService.loadComics(
            publisher,
            series,
            volume,
            issueNumber,
            coverDate,
            pageIndex,
            pageSize,
            sortBy,
            sortDirection);
    final long total =
        this.displayableComicService.getComicCount(
            publisher, series, volume, issueNumber, coverDate);
    return new LoadComicsResponse(
        comics, Collections.emptyList(), Collections.emptyList(), total, total);
  }
}
