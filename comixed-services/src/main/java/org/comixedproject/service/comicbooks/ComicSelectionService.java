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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.messaging.comicbooks.ComicBookSelectionEvent;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * <code>ComicSelectionService</code> provides business functions for managing a user's selection of
 * comics.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicSelectionService {
  @Autowired private DisplayableComicService displayableComicService;
  @Autowired private UserService userService;
  @Autowired private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;
  @Autowired private ObjectMapper objectMapper;

  /**
   * Updates the list of selected comics based on the incoming request. If the request is adding,
   * then the set is updated. Otherwise, any matches found are removed. The updated set of ids is
   * returned.
   *
   * @param email the user's email
   * @param selections the current selection set
   * @param comicBookId the incoming comic book id
   */
  public void addComicSelectionForUser(
      final String email, final List<Long> selections, final Long comicBookId) {
    if (!selections.contains(comicBookId)) {
      log.debug("Adding comic book to selections: {}", comicBookId);
      selections.add(comicBookId);
      this.doPublishSelectionUpdateForUser(email, selections);
    }
  }

  /**
   * Removes a comic selection from the specified user if it exists.
   *
   * @param email the user's email
   * @param selections the current selections
   * @param comicBookId the incoming comic book id
   */
  public void removeComicSelectionFromUser(
      final String email, final List selections, final Long comicBookId) {
    if (selections.contains(comicBookId)) {
      log.debug("Removing comic book from selections: {}", comicBookId);
      selections.remove(comicBookId);
      this.doPublishSelectionUpdateForUser(email, selections);
    }
  }

  /**
   * Marks comics as selected based on filters.
   *
   * @param email the user's email
   * @param selections the selected comic book ids
   * @param coverYear the optional cover year
   * @param coverMonth the optional cover month
   * @param archiveType the optional archive type
   * @param comicType the optional cover type
   * @param comicState the optional comic state
   * @param unscrapedState the optional unscraped state
   * @param missing the optional missing flag
   * @param pageCount the optional page count
   * @param searchText the optional search text
   * @param adding adding or removing flag
   */
  public void selectByFilter(
      final String email,
      final List selections,
      final Integer coverYear,
      final Integer coverMonth,
      final ArchiveType archiveType,
      final ComicType comicType,
      final ComicState comicState,
      final Boolean unscrapedState,
      final Boolean missing,
      final Integer pageCount,
      final String searchText,
      final boolean adding) {
    final List selectedIds =
        this.displayableComicService.getIdsByFilter(
            coverYear,
            coverMonth,
            archiveType,
            comicType,
            comicState,
            unscrapedState,
            missing,
            pageCount,
            searchText);
    if (adding) {
      log.debug("Adding {} selection{}", selections.size(), selectedIds.size() == 1 ? "" : "s");
      selections.addAll(selectedIds);
    } else {
      log.debug("Removing {} selection{}", selections.size(), selectedIds.size() == 1 ? "" : "s");
      selections.removeAll(selectedIds);
    }

    if (!selectedIds.isEmpty()) {
      this.doPublishSelectionUpdateForUser(email, selections);
    }
  }

  /**
   * Returns a cleared out collection of ids. It also publishes an update to the client.
   *
   * @param email the user's email
   * @param selections the selected comic book ids
   */
  public void clearSelectedComicBooks(final String email, final List<Long> selections) {
    log.debug("Clearing the selected ids");
    selections.clear();
    log.debug("Publishing cleared out selection update");
    this.doPublishSelectionUpdateForUser(email, selections);
  }

  /**
   * Decodes a previously stored selection set.
   *
   * @param storeSelections the encoded selections
   * @return the decoded selections
   * @throws ComicBookSelectionException if an error occurs
   */
  public List<Long> decodeSelections(final Object storeSelections)
      throws ComicBookSelectionException {
    if (storeSelections == null) {
      log.debug("Creating new selection set");
      return new ArrayList();
    } else {
      try {
        final ListOfIds result =
            this.objectMapper.readValue(storeSelections.toString(), ListOfIds.class);
        return result.getIds().stream().collect(Collectors.toList());
      } catch (JsonProcessingException error) {
        throw new ComicBookSelectionException("failed to load selections from session", error);
      }
    }
  }

  /**
   * Returns an encoded copy of the selection list.
   *
   * @param selections the selections
   * @return the encoded selections
   * @throws ComicBookSelectionException if an error occurs
   */
  public String encodeSelections(final List<Long> selections) throws ComicBookSelectionException {
    log.debug("Storing selection set");
    try {
      return this.objectMapper.writeValueAsString(new ListOfIds(new HashSet<>(selections)));
    } catch (JsonProcessingException error) {
      throw new ComicBookSelectionException("failed to save selections to session", error);
    }
  }

  /**
   * Publishes the selection update.
   *
   * @param email the user's email
   * @param selections the selected ids
   */
  public void publishSelections(final String email, final List<Long> selections) {
    this.doPublishSelectionUpdateForUser(email, selections);
  }

  @Async
  protected void doPublishSelectionUpdateForUser(final String email, final List<Long> selections) {
    try {
      final ComiXedUser user = this.userService.findByEmail(email);
      this.publishComicBookSelectionStateAction.publish(
          new ComicBookSelectionEvent(user, selections));
    } catch (PublishingException | ComiXedUserException error) {
      log.error("Failed to publish selection update", error);
    }
  }

  /**
   * Adds comics by their type and value.
   *
   * @param selections the selections
   * @param tagType the tag type
   * @param tagValue the tag value
   */
  public void addByTagTypeAndValue(
      final List selections, final ComicTagType tagType, final String tagValue) {
    selections.addAll(this.displayableComicService.getIdsByTagTypeAndValue(tagType, tagValue));
  }

  /**
   * Removes comics by their tga type and value.
   *
   * @param selections the selections
   * @param tagType the tag type
   * @param tagValue the tag value
   */
  public void removeByTagTypeAndValue(
      final List selections, final ComicTagType tagType, final String tagValue) {
    selections.removeAll(this.displayableComicService.getIdsByTagTypeAndValue(tagType, tagValue));
  }

  @NoArgsConstructor
  @AllArgsConstructor
  public static class ListOfIds {
    @Getter private Set<Long> ids;
  }
}
