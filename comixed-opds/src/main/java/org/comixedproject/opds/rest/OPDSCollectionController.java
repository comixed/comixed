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

import static org.comixedproject.opds.service.OPDSNavigationService.*;

import java.security.Principal;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.*;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.comixedproject.opds.service.OPDSNavigationService;
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
  @Autowired private OPDSNavigationService opdsNavigationService;
  @Autowired private OPDSAcquisitionService opdsAcquisitionService;
  @Autowired private OPDSUtils opdsUtils;

  /**
   * Retrieves the root feed for a collection.
   *
   * @param collectionType the collection type
   * @param unread the unread flag
   * @return the feed
   */
  @GetMapping(value = "/opds/collections/{type}", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed getCollectionFeed(
      @NonNull @PathVariable("type") final CollectionType collectionType,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    log.info("Loading OPDS navigation feed for collection: {} unread={}", collectionType, unread);
    return this.opdsNavigationService.getCollectionFeed(collectionType, unread);
  }

  /**
   * Retrieves the feed for a single collection.
   *
   * @param collectionType the collection type
   * @param name the collection name
   * @param unread the unread flag
   * @return the feed
   */
  @GetMapping(value = "/opds/collections/{type}/{name}", produces = MediaType.APPLICATION_XML_VALUE)
  @ResponseBody
  public OPDSAcquisitionFeed getEntriesForCollectionFeed(
      final Principal principal,
      @PathVariable("type") final CollectionType collectionType,
      @PathVariable("name") final String name,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    final String collectionName = this.opdsUtils.urlDecodeString(name);
    final String email = principal.getName();
    log.info(
        "Loading the OPDS collection entries for {}: {} name={} unread={}",
        email,
        collectionType,
        collectionName,
        unread);
    return this.opdsAcquisitionService.getEntriesForCollectionFeed(
        email, collectionType, collectionName, unread);
  }
}
