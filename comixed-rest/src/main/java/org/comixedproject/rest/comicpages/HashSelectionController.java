/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.rest.comicpages;

import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.comicpages.ComicPageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>HashSelectionController</code> provides APIs for working with selected page hashes.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class HashSelectionController {
  @Autowired private ComicPageService comicPageService;
  @Autowired private SelectedHashManager selectedHashManager;

  /**
   * Loads all hash selections from the user's session.
   *
   * @param session the session
   * @return the selected hashes
   */
  @GetMapping(value = "/api/pages/hashes/selected", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.page-hash.load-all")
  @PreAuthorize("hasRole('ADMIN')")
  public Set<String> loadHashSelections(final HttpSession session) {
    log.info("Loading hash selections");
    return this.selectedHashManager.load(session);
  }

  /**
   * Adds all duplicate hashes to the list of selected hashs.
   *
   * @param session the session
   * @return the selected hashes
   */
  @PostMapping(
      value = "/api/pages/hashes/selected/all",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.page-hash.add-all-duplicate")
  @PreAuthorize("hasRole('ADMIN')")
  public Set<String> addAllDuplicateHashes(final HttpSession session) {
    log.info("Adding all duplicate hashes to selection");
    this.selectedHashManager.merge(session, this.comicPageService.getAllDuplicateHashes());
    return this.selectedHashManager.load(session);
  }

  /**
   * Adds a hash to the list of selected hashs.
   *
   * @param session the session
   * @param hash the hash
   * @return the selected hashes
   */
  @PostMapping(
      value = "/api/pages/hashes/selected/{hash}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.page-hash.add-entry")
  @PreAuthorize("hasRole('ADMIN')")
  public Set<String> addHashSelection(
      final HttpSession session, @PathVariable("hash") String hash) {
    log.info("Adding hash selection: {}", hash);
    final Set<String> result = this.selectedHashManager.load(session);
    result.add(hash);
    this.selectedHashManager.save(session, result);
    return result;
  }

  /**
   * Removes a hash from the list of selected hashs.
   *
   * @param session the session
   * @param hash the hash
   * @return the selected hashes
   */
  @PutMapping(
      value = "/api/pages/hashes/selected/{hash}/delete",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.page-hash.remove-entry")
  @PreAuthorize("hasRole('ADMIN')")
  public Set<String> removeHashSelection(
      final HttpSession session, @PathVariable("hash") String hash) {
    log.info("Removing hash selection: {}", hash);
    final Set<String> result = this.selectedHashManager.load(session);
    result.remove(hash);
    this.selectedHashManager.save(session, result);
    return result;
  }

  /**
   * Clears the hash selection.
   *
   * @param session the session
   */
  @DeleteMapping(value = "/api/pages/hashes/selected/all")
  @Timed(value = "comixed.page-hash.remove-all")
  @PreAuthorize("hasRole('ADMIN')")
  public void clearHashSelections(final HttpSession session) {
    log.info("Clearing hash selections");
    this.selectedHashManager.clearSelections(session);
  }
}
