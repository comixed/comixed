/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixed.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import org.comixed.model.library.CollectionEntry;
import org.comixed.model.library.CollectionType;
import org.comixed.model.library.Comic;
import org.comixed.net.GetPageForEntryRequest;
import org.comixed.net.GetPageForEntryResponse;
import org.comixed.service.library.CollectionException;
import org.comixed.service.library.CollectionService;
import org.comixed.views.View;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/")
public class CollectionController {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private CollectionService collectionService;

  @GetMapping(value = "/collections/{collectionType}", produces = MediaType.APPLICATION_JSON_VALUE)
  public List<CollectionEntry> getCollectionEntries(
      @PathVariable("collectionType") final String collectionType) throws CollectionException {
    this.logger.info("Getting collections: type={}", collectionType);

    return this.collectionService.getCollectionEntries(CollectionType.fromValue(collectionType));
  }

  @PostMapping(
      value = "/collections/{collectionType}/{name}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicList.class)
  public GetPageForEntryResponse getPageForEntry(
      @PathVariable("collectionType") final String collectionType,
      @PathVariable("name") final String name,
      @RequestBody() final GetPageForEntryRequest request)
      throws CollectionException {
    this.logger.info(
        "Getting comics for collection: type={} name={} page={} count={} sortField={} ascending={}",
        collectionType,
        name,
        request.getPage(),
        request.getCount(),
        request.getSortField(),
        request.isAscending());

    this.logger.debug("Getting comics");
    final List<Comic> comics =
        this.collectionService.getPageForEntry(
            CollectionType.fromValue(collectionType),
            name,
            request.getPage(),
            request.getCount(),
            request.getSortField(),
            request.isAscending());

    this.logger.debug("Getting comic count");
    final int comicCount =
        this.collectionService.getCountForCollectionTypeAndName(
            CollectionType.fromValue(collectionType), name);

    this.logger.debug("Returning response");
    return new GetPageForEntryResponse(comics, comicCount);
  }
}
