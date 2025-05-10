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

package org.comixedproject.service.lists;

import java.util.HashSet;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishStoryListUpdateAction;
import org.comixedproject.model.lists.ScrapedStory;
import org.comixedproject.repositories.lists.ScrapedStoryRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>StoryService</code> provides business methods for working with instances of {@link
 * ScrapedStory}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class StoryService {
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
              log.trace("Adding story: id={}", story.getId());
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
    log.trace("Copying story to new model");
    final ScrapedStory story =
        this.scrapedStoryRepository.save(new ScrapedStory(source.getName(), source.getPublisher()));
    log.trace("Publishing story list update: id={} name={}", story.getId(), story.getName());
    try {
      this.publishStoryListUpdateAction.publish(story);
    } catch (PublishingException error) {
      log.error("Failed to publish story list update", error);
    }
    return story;
  }

  private ScrapedStory doGetStory(final long id) throws StoryException {
    final ScrapedStory result = this.scrapedStoryRepository.getById(id);
    if (result == null) throw new StoryException("No such story: id=" + id);
    return result;
  }
}
