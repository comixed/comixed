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
import static org.comixedproject.reader.rest.LibraryReaderController.COMIC_DOWNLOAD_URL;

import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.comixedproject.service.lists.ReadingListException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Log4j2
public class ReadingListReaderController {
  public static final String READING_LIST_URL = API_ROOT + "/lists/reading";
  @Autowired private DirectoryReaderService directoryReaderService;

  /**
   * Retrieves all reading lists for a user.
   *
   * @param principal the user principal
   * @return the reading lists
   * @throws ReadingListException if an error occurs
   */
  @GetMapping(value = READING_LIST_URL, produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-reading-lists")
  public LoadDirectoryResponse getReadingLists(final Principal principal)
      throws ReadingListException {
    final String email = principal.getName();
    log.info("Loading all reading lists: email={}", email);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result.getContents().addAll(directoryReaderService.getAllReadingLists(email, READING_LIST_URL));
    return result;
  }

  /**
   * Retrieves all reading lists for a user.
   *
   * @param principal the user principal
   * @param id the reading list id
   * @return the reading lists
   * @throws ReadingListException if an error occurs
   */
  @GetMapping(value = API_ROOT + "/lists/reading/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-reading-lists")
  public LoadDirectoryResponse getComicsForReadingList(
      final Principal principal, @PathVariable("id") Long id) throws ReadingListException {
    final String email = principal.getName();
    log.info("Loading comics for reading list: email={} id={}", email, id);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .addAll(directoryReaderService.getAllComicsForReadingList(email, id, COMIC_DOWNLOAD_URL));
    return result;
  }
}
