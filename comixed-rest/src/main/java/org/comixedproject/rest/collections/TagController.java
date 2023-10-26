/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.rest.collections;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.collections.LoadCollectionListRequest;
import org.comixedproject.model.net.collections.LoadCollectionListResponse;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>TagController</code> handles requests relating to comic tag types.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class TagController {
  @Autowired private ComicDetailService comicDetailService;

  @PostMapping(
      value = "/api/collections/{tagType}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.collection.load-list")
  @JsonView(View.CollectionEntryList.class)
  public LoadCollectionListResponse loadCollectionList(
      @RequestBody final LoadCollectionListRequest request,
      @PathVariable("tagType") final String tagType) {
    final ComicTagType tag = ComicTagType.forValue(tagType);
    log.info("Loading collection list entries: type={}", tag);
    return new LoadCollectionListResponse(
        this.comicDetailService.loadCollectionEntries(
            tag,
            request.getPageSize(),
            request.getPageIndex(),
            request.getSortBy(),
            request.getSortDirection()),
        this.comicDetailService.loadCollectionTotalEntries(tag));
  }
}
