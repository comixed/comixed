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

import static junit.framework.TestCase.*;
import static org.comixedproject.state.lists.StoryStateHandler.HEADER_STORY;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishStoryListUpdateAction;
import org.comixedproject.model.lists.Story;
import org.comixedproject.model.lists.StoryState;
import org.comixedproject.repositories.lists.StoryRepository;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.state.lists.StoryEvent;
import org.comixedproject.state.lists.StoryStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@RunWith(MockitoJUnitRunner.class)
public class StoryServiceTest {
  private static final StoryState TEST_STORY_STATE = StoryState.STABLE;
  private static final String TEST_STORY_NAME = "The Story Name";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final long TEST_STORY_ID = 27L;

  @InjectMocks private StoryService service;
  @Mock private StoryRepository storyRepository;
  @Mock private ComicService comicService;
  @Mock private StoryStateHandler storyStateHandler;
  @Mock private State<StoryState, StoryEvent> state;
  @Mock private Message<StoryEvent> message;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Story story;
  @Mock private Story savedStory;
  @Mock private PublishStoryListUpdateAction publishStoryListUpdateAction;
  @Mock private Set<Story> storySet;

  @Captor private ArgumentCaptor<Story> storyArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_STORY, Story.class)).thenReturn(story);

    Mockito.when(story.getName()).thenReturn(TEST_STORY_NAME);
    Mockito.when(story.getPublisher()).thenReturn(TEST_PUBLISHER);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(storyStateHandler, Mockito.times(1)).addListener(service);
  }

  @Test
  public void testOnStoryStateChange() throws PublishingException {
    Mockito.when(state.getId()).thenReturn(TEST_STORY_STATE);
    Mockito.when(storyRepository.save(Mockito.any(Story.class))).thenReturn(savedStory);

    service.onStoryStateChange(state, message);

    Mockito.verify(story, Mockito.times(1)).setStoryState(TEST_STORY_STATE);
    Mockito.verify(story, Mockito.times(1)).setModifiedOn(Mockito.any(Date.class));
    Mockito.verify(storyRepository, Mockito.times(1)).save(story);
    Mockito.verify(publishStoryListUpdateAction, Mockito.times(1)).publish(savedStory);
  }

  @Test
  public void testOnStoryStateChangePublishingException() throws PublishingException {
    Mockito.when(state.getId()).thenReturn(TEST_STORY_STATE);
    Mockito.when(storyRepository.save(Mockito.any(Story.class))).thenReturn(savedStory);
    Mockito.doThrow(PublishingException.class)
        .when(publishStoryListUpdateAction)
        .publish(Mockito.any(Story.class));

    service.onStoryStateChange(state, message);

    Mockito.verify(story, Mockito.times(1)).setStoryState(TEST_STORY_STATE);
    Mockito.verify(story, Mockito.times(1)).setModifiedOn(Mockito.any(Date.class));
    Mockito.verify(storyRepository, Mockito.times(1)).save(story);
    Mockito.verify(publishStoryListUpdateAction, Mockito.times(1)).publish(savedStory);
  }

  @Test
  public void testLoadAll() {
    final List<Story> stories = new ArrayList<>();
    stories.add(story);
    final List<String> distinctStories = new ArrayList<>();
    distinctStories.add(TEST_STORY_NAME);
    final String otherStory = String.format("Other story %d", System.currentTimeMillis());
    distinctStories.add(otherStory);

    Mockito.when(storyRepository.findAll()).thenReturn(stories);
    Mockito.when(comicService.getAllStories()).thenReturn(distinctStories);

    final Set<String> result = service.loadAll();

    assertNotNull(result);
    assertTrue(result.contains(TEST_STORY_NAME));
    assertTrue(result.contains(otherStory));

    Mockito.verify(storyRepository, Mockito.times(1)).findAll();
    Mockito.verify(comicService, Mockito.times(1)).getAllStories();
  }

  @Test
  public void testFindByName() {
    final List<Story> stories = new ArrayList<>();
    stories.add(story);
    Mockito.when(storyRepository.findByName(Mockito.anyString())).thenReturn(stories);

    final List<String> publishers = new ArrayList<>();
    publishers.add(TEST_PUBLISHER);
    Mockito.when(comicService.getAllPublishersForStory(Mockito.anyString())).thenReturn(publishers);

    final Set<Story> result = service.findByName(TEST_STORY_NAME);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(story));
    assertTrue(result.contains(new Story(TEST_STORY_NAME, TEST_PUBLISHER)));

    Mockito.verify(storyRepository, Mockito.times(1)).findByName(TEST_STORY_NAME);
  }

  @Test
  public void testCreateStory() throws StoryException {
    Mockito.when(storyRepository.save(storyArgumentCaptor.capture())).thenReturn(story);
    Mockito.when(story.getId()).thenReturn(TEST_STORY_ID);
    Mockito.when(storyRepository.getById(Mockito.anyLong())).thenReturn(savedStory);

    final Story result = service.createStory(story);

    assertNotNull(result);
    assertSame(savedStory, result);

    final Story model = storyArgumentCaptor.getValue();
    assertNotNull(model);
    assertEquals(TEST_STORY_NAME, model.getName());
    assertEquals(TEST_PUBLISHER, model.getPublisher());

    Mockito.verify(storyRepository, Mockito.times(1)).save(model);
    Mockito.verify(storyStateHandler, Mockito.times(1)).fireEvent(story, StoryEvent.saved);
    Mockito.verify(storyRepository, Mockito.times(1)).getById(TEST_STORY_ID);
  }
}
