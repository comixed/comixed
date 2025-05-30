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

package org.comixedproject.reader.rest;

import static org.comixedproject.reader.rest.LibraryReaderController.API_ROOT;

import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ComicTagReaderController</code> provides the root controller for navigating the collections
 * in a library from a reader.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComicTagReaderController {
  private static final String ALL_FOR_TAG_TYPE = "%s/collections/%s";

  @Autowired private DirectoryReaderService directoryReaderService;

  /**
   * Loads all values for the provided tag type.
   *
   * @param principal the user principal
   * @param unreadParam the unread parameter
   * @param tagTypeParam the tag type parameter
   * @return the directory entries
   */
  @GetMapping(
      value = API_ROOT + "/collections/{tagType}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-all-for-collection")
  public LoadDirectoryResponse getAllForTagType(
      final Principal principal,
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam,
      @PathVariable("tagType") final String tagTypeParam) {
    final String email = principal.getName();
    final boolean unread = Boolean.parseBoolean(unreadParam);
    final ComicTagType tagType = ComicTagType.forValue(tagTypeParam);
    log.info("Loading all for tag type: {} email={} unread={}", tagType, email, unread);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .addAll(
            directoryReaderService.getAllForTagType(
                email,
                unread,
                tagType,
                String.format(ALL_FOR_TAG_TYPE, API_ROOT, tagType.getValue())));
    return result;
  }
}
