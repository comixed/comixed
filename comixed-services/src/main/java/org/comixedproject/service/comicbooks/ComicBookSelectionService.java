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

package org.comixedproject.service.comicbooks;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

/**
 * <code>ComicBookSelectionService</code> provides business functions for managing a user's
 * selection of comics.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicBookSelectionService {
  @Autowired private ComicDetailRepository comicDetailRepository;
  @Autowired private ObjectFactory<ComicDetailExampleBuilder> exampleBuilderObjectFactory;
  @Autowired private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;

  /**
   * Updates the list of selected comics based on the incoming request. If the request is adding,
   * then the set is updated. Otherwise, any matches found are removed. The updated set of ids is
   * returned.
   *
   * @param existing the existing comic book ids
   * @param incoming the incoming comic book id
   * @param adding true when adding selections
   * @return
   */
  public Set<Long> selectSingleComicBook(
      final Set<Long> existing, final Long incoming, final boolean adding) {
    final Set<Long> ids = new HashSet<>();
    ids.add(incoming);
    return this.doSelectComicBooks(existing, ids, adding);
  }

  public Set<Long> selectMultipleComicBooks(
      final Set<Long> existingIds,
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unreadState,
      final Boolean unscrapedState,
      final String searchText,
      final boolean adding) {
    final ComicDetailExampleBuilder builder = this.exampleBuilderObjectFactory.getObject();
    builder.setCoverYear(coverYear);
    builder.setCoverMonth(coverMonth);
    builder.setArchiveType(archiveType);
    builder.setComicType(comicType);
    builder.setComicState(comicState);
    builder.setUnreadState(unreadState);
    builder.setUnscrapedState(unscrapedState);
    builder.setSearchText(searchText);

    final Example<ComicDetail> example = builder.build();
    final Set<Long> ids =
        this.comicDetailRepository.findAll(example).stream()
            .map(ComicDetail::getComicId)
            .collect(Collectors.toSet());

    return this.doSelectComicBooks(existingIds, ids, adding);
  }

  private Set<Long> doSelectComicBooks(
      final Set<Long> existing, final Set<Long> incoming, final boolean adding) {
    Set<Long> result = existing;
    if (result == null) {
      log.trace("Creating new selection set");
      result = new HashSet<>();
    }
    if (adding) {
      log.debug("Adding comic book selections");
      if (existing != null) {
        result.addAll(existing);
      }
      result.addAll(incoming);
    } else {
      if (existing == null || existing.isEmpty()) {
        log.debug("No existing selections to remove");
      } else {
        log.trace("Removing comic books selections");
        existing.removeAll(incoming);
        result.addAll(existing);
      }
    }

    try {
      log.debug("Publishing selection update");
      this.publishComicBookSelectionStateAction.publish(result);
    } catch (PublishingException error) {
      log.error("Failed to published selected comic book update", error);
    }

    return result;
  }

  /**
   * Returns a cleared out collection of ids. It also publishes an update to the client.
   *
   * @return the empty set
   */
  public Set<Long> clearSelectedComicBooks() {
    log.debug("Publishing cleared out selection update");
    try {
      this.publishComicBookSelectionStateAction.publish(Collections.emptySet());
    } catch (PublishingException error) {
      log.error("Failed to published selected comic book update", error);
    }

    return Collections.emptySet();
  }
}
