/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.service.session;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicSessionEventAuditor;
import org.comixedproject.model.page.BlockedPageHashSessionEventAuditor;
import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.model.session.SessionUpdateEvent;
import org.comixedproject.model.session.SessionUpdateEventType;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.page.BlockedPageHashService;
import org.comixedproject.service.task.TaskService;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>SessionService</code> provides business logic for building a session update.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class SessionService implements InitializingBean {
  @Autowired private TaskService taskService;
  @Autowired private ComicService comicService;
  @Autowired private BlockedPageHashService blockedPageHashService;
  @Autowired private ComicSessionEventAuditor comicSessionEventAuditor;
  @Autowired private BlockedPageHashSessionEventAuditor blockedPageHashSessionEventAuditor;

  private List<SessionUpdateEvent> sessionUpdateEvents =
      Collections.synchronizedList(new ArrayList<>());

  /**
   * Retrieves a session update with the specific timeout period. Only returns events that occurred
   * after the specified timestamp. For each type, returns only up to the specific maximum record
   * count.
   *
   * @param timestamp the timestamp
   * @param maximumRecords the maximum records
   * @param timeout the timeout period
   * @param email the user's email
   * @return the session update
   * @throws SessionException if an error occurs
   */
  public SessionUpdate getSessionUpdate(
      final long timestamp, final int maximumRecords, final long timeout, final String email)
      throws SessionException {
    log.debug("Getting session update for {}", email);

    Long cutoff = System.currentTimeMillis() + (timeout * 1000L);
    boolean done = false;
    final SessionUpdate result = new SessionUpdate();
    result.setLatest(timestamp);

    while (!done) {
      log.trace("Filtering session events before threshold");
      final List<SessionUpdateEvent> events =
          this.sessionUpdateEvents.stream()
              .filter(event -> event.getOccurred().getTime() > timestamp)
              .collect(Collectors.toList());

      if (!events.isEmpty()) {
        int count = 0;
        while (count < maximumRecords && count < events.size()) {
          final SessionUpdateEvent event = events.get(count);
          switch (event.getEventType()) {
            case COMIC_UPDATED:
              try {
                result.getUpdatedComics().add(this.comicService.getComic((Long) event.getValue()));
              } catch (ComicException error) {
                throw new SessionException("Unable to load comic", error);
              }
              break;
            case COMIC_DELETED:
              result.getRemovedComicIds().add((Long) event.getValue());
              break;
            case BLOCKED_HASH_ADDED:
              result.getHashes().add(String.format("+%s", event.getValue().toString()));
              break;
            case BLOCKED_HASH_REMOVED:
              result.getHashes().add(String.format("-%s", event.getValue().toString()));
              break;
          }
          result.setLatest(event.getOccurred().getTime());
          count++;
          done = (count == maximumRecords) || count == events.size();
        }
      } else {
        try {
          log.debug("Sleeping 1000ms waiting for session update");
          Thread.sleep(1000L);
        } catch (InterruptedException error) {
          log.error("Failed to wait for session update", error);
          Thread.currentThread().interrupt();
        }
        done = System.currentTimeMillis() >= cutoff;
      }
    }

    return result;
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.debug("Initializing session service");
    log.trace("Loading comics");
    this.comicService
        .getAll()
        .forEach(comic -> this.addComicEvent(SessionUpdateEventType.COMIC_UPDATED, comic));
    log.trace("Loading blocked page hashes");
    this.blockedPageHashService
        .getAllHashes()
        .forEach(
            hash -> this.addBlockedPageHashEvent(SessionUpdateEventType.BLOCKED_HASH_ADDED, hash));
    log.trace("Registering session audit event handlers");
    this.comicSessionEventAuditor.addHandler(
        ((eventType, value) -> this.addComicEvent(eventType, (Comic) value)));
    this.blockedPageHashSessionEventAuditor.addHandler(
        ((eventType, value) -> this.addBlockedPageHashEvent(eventType, (String) value)));
  }

  private void addBlockedPageHashEvent(final SessionUpdateEventType eventType, final String hash) {
    log.trace("Filtering blocked page hash events");
    this.sessionUpdateEvents =
        this.sessionUpdateEvents.stream()
            .filter(
                event ->
                    !(event.getValue().equals(hash)
                        && (event.getEventType().equals(SessionUpdateEventType.BLOCKED_HASH_ADDED)
                            || event
                                .getEventType()
                                .equals(SessionUpdateEventType.BLOCKED_HASH_REMOVED))))
            .collect(Collectors.toList());
    log.trace("Adding blocked page hash event to session");
    this.sessionUpdateEvents.add(new SessionUpdateEvent(hash, eventType));
  }

  private void addComicEvent(final SessionUpdateEventType eventType, final Comic comic) {
    log.trace("Filtering comic events");
    this.sessionUpdateEvents =
        this.sessionUpdateEvents.stream()
            .filter(
                event ->
                    !(event.getValue().equals(comic.getId())
                        && (event.getEventType().equals(SessionUpdateEventType.COMIC_UPDATED)
                            || event.getEventType().equals(SessionUpdateEventType.COMIC_DELETED))))
            .collect(Collectors.toList());
    log.trace("Adding comic event to session");
    this.sessionUpdateEvents.add(new SessionUpdateEvent(comic.getId(), eventType));
  }
}
