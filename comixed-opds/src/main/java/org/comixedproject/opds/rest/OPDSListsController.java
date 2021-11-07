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

import static org.comixedproject.opds.model.OPDSAcquisitionFeed.ACQUISITION_FEED_LINK_TYPE;
import static org.comixedproject.opds.rest.OPDSLibraryController.START;

import java.security.Principal;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.model.*;
import org.comixedproject.opds.utils.OPDSUtils;
import org.comixedproject.service.lists.ReadingListException;
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
  @Autowired private ReadingListService readingListService;

  /**
   * Returns navigation links for the user's reading lists.
   *
   * @param principal the user principal
   * @return the reading list links
   * @throws OPDSException if an error occurs
   */
  @GetMapping(value = "/opds/lists", produces = MediaType.APPLICATION_XML_VALUE)
  @AuditableEndpoint(logResponse = true)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed loadReadingLists(final Principal principal) throws OPDSException {
    final String email = principal.getName();
    log.info("Getting reading lists for user: {}", email);
    final List<ReadingList> lists;
    try {
      lists = this.readingListService.loadReadingListsForUser(email);
      final OPDSNavigationFeed response = new OPDSNavigationFeed("Reading lists");
      lists.forEach(
          readingList -> {
            log.trace("Adding reading list: {}", readingList.getName());
            final OPDSNavigationFeedEntry entry =
                new OPDSNavigationFeedEntry(
                    String.format(
                        "%s (%d comics)", readingList.getName(), readingList.getComics().size()));
            entry.setContent(new OPDSNavigationFeedContent(readingList.getSummary()));
            entry
                .getLinks()
                .add(
                    new OPDSLink(
                        ACQUISITION_FEED_LINK_TYPE,
                        START,
                        String.format("/opds/lists/%d", readingList.getId())));
            response.getEntries().add(entry);
          });
      return response;
    } catch (ReadingListException error) {
      throw new OPDSException("Failed to load reading lists for user", error);
    }
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
  @AuditableEndpoint(logResponse = true)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSAcquisitionFeed loadReadingListEntries(
      final Principal principal, @PathVariable("id") final Long id) throws OPDSException {
    final String email = principal.getName();
    log.info("Getting reading list for user: {} id={}", email, id);
    final ReadingList list;
    try {
      list = this.readingListService.loadReadingListForUser(email, id);
      final OPDSAcquisitionFeed response =
          new OPDSAcquisitionFeed(
              String.format("Reading List: %s (%d)", list.getName(), list.getComics().size()));
      list.getComics()
          .forEach(
              comic -> {
                log.trace("Adding comic to reading list entries: {}", comic.getId());
                response.getEntries().add(OPDSUtils.createComicEntry(comic));
              });

      return response;
    } catch (ReadingListException error) {
      throw new OPDSException("Failed to load reading list entries", error);
    }
  }
}
