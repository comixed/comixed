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

package org.comixedproject.service.collections;

import java.util.HashSet;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishStoryListUpdateAction;
import org.comixedproject.model.collections.ScrapedStory;
import org.comixedproject.repositories.collections.ScrapedStoryRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.StoryException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ScrapedStoryService</code> provides business methods for working with instances of {@link
 * ScrapedStory}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ScrapedStoryService {
  @Autowired private ScrapedStoryRepository scrapedStoryRepository;
  @Autowired private ComicBookService comicBookService;
  @Autowired private PublishStoryListUpdateAction publishStoryListUpdateAction;

  /**
   * Retrieves all stories. Merges defined stories with tagged stories.
   *
   * @return the set of stories
   */
  @Transactional
  public Set<String> loadAll() {
    final Set<String> result = new HashSet<>();
    this.scrapedStoryRepository
        .findAll()
        .forEach(
            story -> {
              log.trace("Adding defined story: {}", story.getName());
              result.add(story.getName());
            });
    return result;
  }

  /**
   * Fetches all stories with a given name.
   *
   * @param name the name
   * @return the list of stories
   */
  public Set<ScrapedStory> findByName(final String name) {
    Set<ScrapedStory> result = new HashSet<>();
    this.scrapedStoryRepository
        .findByName(name)
        .forEach(
            story -> {
              log.trace("Adding story: id={}", story.getScrapedStoryId());
              result.add(story);
            });
    this.comicBookService
        .getAllPublishersForStory(name)
        .forEach(
            publisher -> {
              log.trace("Adding tagged story publisher: {}", publisher);
              result.add(new ScrapedStory(name, publisher));
            });
    return result;
  }

  /**
   * Creates a new story from the given data model.
   *
   * @param source the source story
   * @return the saved story
   * @throws StoryException if an error occurs
   */
  @Transactional
  public ScrapedStory createStory(final ScrapedStory source) throws StoryException {
    log.debug("Copying story to new model");
    final ScrapedStory story =
        this.scrapedStoryRepository.save(new ScrapedStory(source.getName(), source.getPublisher()));
    log.debug(
        "Publishing story list update: id={} name={}", story.getScrapedStoryId(), story.getName());
    try {
      this.publishStoryListUpdateAction.publish(story);
    } catch (PublishingException error) {
      log.error("Failed to publish story list update", error);
    }
    return story;
  }

  /**
   * Returns the story with the given name.
   *
   * @param name the story name
   * @return the story
   */
  @Transactional(readOnly = true)
  public ScrapedStory getForName(final String name) {
    log.debug("Loading story: name={}", name);
    return this.scrapedStoryRepository.getByName(name);
  }

  /**
   * Saves the provided story.
   *
   * @param story the story
   * @return the updated story
   */
  @Transactional
  public ScrapedStory saveStory(final ScrapedStory story) {
    log.debug("Saving story: id={} name={}", story.getScrapedStoryId(), story.getName());
    final ScrapedStory result = this.scrapedStoryRepository.save(story);
    log.debug("Publishing story update");
    try {
      this.publishStoryListUpdateAction.publish(result);
    } catch (PublishingException error) {
      log.error("Failed to publish story update", error);
    }
    return result;
  }
}
