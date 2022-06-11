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
import lombok.extern.log4j.Log4j2;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.*;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.comixedproject.opds.service.OPDSNavigationService;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>OPDSListsController</code> provides REST APIs for retrieving reading lists for users.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSListsController {
  @Autowired private OPDSNavigationService opdsNavigationService;
  @Autowired private OPDSAcquisitionService opdsAcquisitionService;
  @Autowired private ReadingListService readingListService;
  @Autowired private OPDSUtils opdsUtils;

  /**
   * Returns navigation links for the user's reading lists.
   *
   * @param principal the user principal
   * @return the reading list links
   * @throws OPDSException if an error occurs
   */
  @GetMapping(value = "/opds/lists", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed loadReadingLists(final Principal principal) throws OPDSException {
    final String email = principal.getName();
    log.info("Getting reading lists for user: {}", email);
    return this.opdsNavigationService.getReadingListsFeed(email);
  }

  /**
   * Returns the comics for a single reading list.
   *
   * @param principal the user principal
   * @param id the reading list record id
   * @return the reading list links
   * @throws OPDSException if an error occurs
   */
  @GetMapping(value = "/opds/lists/{id}", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSAcquisitionFeed loadReadingListEntries(
      final Principal principal, @PathVariable("id") final Long id) throws OPDSException {
    final String email = principal.getName();
    log.info("Getting reading list for user: {} id={}", email, id);
    return this.opdsAcquisitionService.getComicFeedForReadingList(email, id);
  }
}
