/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OpenSearchDescriptor;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>OPDSSearchController</code> provides OPDS endpoints for searching through the library.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSSearchController {
  @Autowired private OPDSAcquisitionService opdsAcquisitionService;
  @Autowired private OPDSUtils opdsUtils;
  OpenSearchDescriptor searchDescriptor = new OpenSearchDescriptor();

  @GetMapping(value = "/opds/search.xml", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OpenSearchDescriptor getSearchDescriptor() {
    log.info("Getting the library search document descriptor");
    return this.searchDescriptor;
  }

  @GetMapping(value = "/opds/search", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  public OPDSAcquisitionFeed search(final @RequestParam("terms") String searchTerms) {
    log.info("Searching for {}", searchTerms);
    return this.opdsAcquisitionService.getComicsFeedForSearchTerms(
        this.opdsUtils.urlDecodeString(searchTerms));
  }
}
