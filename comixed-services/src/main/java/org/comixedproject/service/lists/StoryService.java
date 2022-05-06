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

import static org.comixedproject.state.lists.StoryStateHandler.HEADER_STORY;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishStoryListUpdateAction;
import org.comixedproject.model.lists.Story;
import org.comixedproject.model.lists.StoryState;
import org.comixedproject.repositories.lists.StoryRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.lists.StoryEvent;
import org.comixedproject.state.lists.StoryStateChangeListener;
import org.comixedproject.state.lists.StoryStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>StoryService</code> provides business methods for working with instances of {@link Story}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class StoryService implements InitializingBean, StoryStateChangeListener {
  @Autowired private StoryStateHandler storyStateHandler;
  @Autowired private StoryRepository storyRepository;
  @Autowired private ComicBookService comicBookService;
  @Autowired private PublishStoryListUpdateAction publishStoryListUpdateAction;

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Suscribing to story state changes");
    this.storyStateHandler.addListener(this);
  }

  @Override
  public void onStoryStateChange(
      final State<StoryState, StoryEvent> state, final Message<StoryEvent> message) {
    log.trace("Fetching story from message headers");
    final var story = message.getHeaders().get(HEADER_STORY, Story.class);
    if (story == null) {
      return;
    }
    log.trace("Updating story state: [{}] =>  {}", story.getId(), state.getId());
    story.setStoryState(state.getId());
    log.trace("Updating last modified date");
    story.setModifiedOn(new Date());
    log.trace("Saving updated reading list");
    final Story savedStory = this.storyRepository.save(story);
    try {
      log.trace("Publishing changes");
      this.publishStoryListUpdateAction.publish(savedStory);
    } catch (PublishingException error) {
      log.error("Failed to publish update", error);
    }
  }

  /**
   * Retrieves all stories. Merges defined stories with tagged stories.
   *
   * @return the set of stories
   */
  public Set<String> loadAll() {
    final Set<String> result = new HashSet<>();
    this.storyRepository
        .findAll()
        .forEach(
            story -> {
              log.trace("Adding defined story: {}", story.getName());
              result.add(story.getName());
            });
    this.comicBookService
        .getAllStories()
        .forEach(
            story -> {
              log.trace("Adding story tag: {}", story);
              result.add(story);
            });
    return result;
  }

  /**
   * Fetches all stories with a given name.
   *
   * @param name the name
   * @return the list of stories
   */
  public Set<Story> findByName(final String name) {
    Set<Story> result = new HashSet<>();
    this.storyRepository
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
              result.add(new Story(name, publisher));
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
  public Story createStory(final Story source) throws StoryException {
    log.trace("Copying story to new model");
    final Story story =
        this.storyRepository.save(new Story(source.getName(), source.getPublisher()));
    log.trace("Firing event: story saved");
    this.storyStateHandler.fireEvent(story, StoryEvent.saved);
    log.trace("Returning saved story");
    return this.doGetStory(story.getId());
  }

  private Story doGetStory(final long id) throws StoryException {
    final Story result = this.storyRepository.getById(id);
    if (result == null) throw new StoryException("No such story: id=" + id);
    return result;
  }
}
