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

import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicSelectionService</code> provides business functions for managing a user's selection of
 * comics.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicSelectionService {
  @Autowired private ComicDetailService comicDetailService;
  @Autowired private ObjectFactory<ComicDetailExampleBuilder> exampleBuilderObjectFactory;
  @Autowired private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;

  /**
   * Updates the list of selected comics based on the incoming request. If the request is adding,
   * then the set is updated. Otherwise, any matches found are removed. The updated set of ids is
   * returned.
   *
   * @param selections the current selection set
   * @param comicBookId the incoming comic book id
   */
  @Transactional
  public void addComicSelectionForUser(final List selections, final Long comicBookId) {
    if (!selections.contains(comicBookId)) {
      log.debug("Adding comic book to selections: {}", comicBookId);
      selections.add(comicBookId);
      this.doPublishSelectionUpdateForUser(selections);
    }
  }

  /**
   * Removes a comic selection from the specified user if it exists.
   *
   * @param selections the current selections
   * @param comicBookId the incoming comic book id
   */
  @Transactional
  public void removeComicSelectionFromUser(final List selections, final Long comicBookId) {
    if (selections.contains(comicBookId)) {
      log.debug("Removing comic book from selections: {}", comicBookId);
      selections.remove(comicBookId);
      this.doPublishSelectionUpdateForUser(selections);
    }
  }

  /**
   * Marks comics as selected based on filters.
   *
   * @param selections the selected comic book ids
   * @param coverYear the optional cover year
   * @param coverMonth the optional cover month
   * @param archiveType the optional archive type
   * @param comicType the optional cover type
   * @param comicState the optional comic state
   * @param unreadState the optional unread state
   * @param unscrapedState the optional unscraped state
   * @param searchText the optional search text
   * @param adding adding or removing flag
   */
  @Transactional
  public void selectMultipleComicBooks(
      final List selections,
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
    final List selectedIds =
        this.comicDetailService.findAllByExample(example).stream()
            .map(ComicDetail::getComicId)
            .collect(Collectors.toList());
    if (adding) {
      log.debug("Adding {} selection{}", selections.size(), selectedIds.size() == 1 ? "" : "s");
      selections.addAll(selectedIds);
    } else {
      log.debug("Removing {} selection{}", selections.size(), selectedIds.size() == 1 ? "" : "s");
      selections.removeAll(selectedIds);
    }

    if (!selectedIds.isEmpty()) {
      this.doPublishSelectionUpdateForUser(selections);
    }
  }

  /**
   * Returns a cleared out collection of ids. It also publishes an update to the client.
   *
   * @param selections the selected comic book ids
   */
  public void clearSelectedComicBooks(final List selections) {
    log.debug("Clearing the selected ids");
    selections.clear();
    log.debug("Publishing cleared out selection update");
    this.doPublishSelectionUpdateForUser(selections);
  }

  private void doPublishSelectionUpdateForUser(final List selections) {
    try {
      log.trace("Publishing selection update");
      this.publishComicBookSelectionStateAction.publish(selections);
    } catch (PublishingException error) {
      log.error("failed to publish selection update", error);
    }
  }
}
