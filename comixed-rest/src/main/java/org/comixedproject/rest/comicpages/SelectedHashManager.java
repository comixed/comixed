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

import jakarta.servlet.http.HttpSession;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * <code>SelectedHashManager</code> manages the list of selected page hashes for a user's session.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class SelectedHashManager {
  static final String HASH_SELECTIONS = "page.hash-selections";

  /**
   * Retrieves the selected hashes from the session.
   *
   * @param session the session
   * @return the selected hashes
   */
  public Set<String> load(final HttpSession session) {
    Object selections = session.getAttribute(HASH_SELECTIONS);
    if (Objects.isNull(selections)) {
      log.debug("No hash selections found");
      selections = new HashSet<>();
      session.setAttribute(HASH_SELECTIONS, selections);
    }
    log.debug("Converting hash selection");
    final Set<String> result = new HashSet<>();
    ((Set) selections).forEach(entry -> result.add(entry.toString()));
    return result;
  }

  /**
   * Saves the selected hashes to the session.
   *
   * @param session the session
   * @param selections the selections
   */
  public void save(final HttpSession session, final Set<String> selections) {
    this.doSave(session, selections);
  }

  /**
   * Merges the provided selections with the existing selections.
   *
   * @param session the session
   * @param selections the new selections
   */
  public void merge(final HttpSession session, final List<String> selections) {
    final Set<String> existing = (Set<String>) session.getAttribute(HASH_SELECTIONS);
    existing.addAll(selections);
    this.doSave(session, existing);
  }

  /**
   * Clears all selections.
   *
   * @param session the session
   */
  public void clearSelections(final HttpSession session) {
    this.doSave(session, new HashSet<>());
  }

  private void doSave(final HttpSession session, final Set<String> selections) {
    session.setAttribute(HASH_SELECTIONS, selections);
  }
}
