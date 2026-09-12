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

import static junit.framework.TestCase.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishStoryListUpdateAction;
import org.comixedproject.model.collections.ScrapedStory;
import org.comixedproject.repositories.collections.ScrapedStoryRepository;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.lists.StoryException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ScrapedStoryServiceTest {
  private static final String TEST_STORY_NAME = "The ScrapedStory Name";
  private static final String TEST_PUBLISHER = "The Publisher";

  @InjectMocks private ScrapedStoryService service;
  @Mock private ScrapedStoryRepository scrapedStoryRepository;
  @Mock private ComicService comicService;
  @Mock private PublishStoryListUpdateAction publishStoryListUpdateAction;
  @Mock private ScrapedStory story;

  @Captor private ArgumentCaptor<ScrapedStory> storyArgumentCaptor;

  @BeforeEach
  void setUp() {
    when(story.getName()).thenReturn(TEST_STORY_NAME);
    when(story.getPublisher()).thenReturn(TEST_PUBLISHER);
  }

  @Test
  void loadAll() {
    final List<ScrapedStory> stories = new ArrayList<>();
    stories.add(story);

    when(scrapedStoryRepository.findAll()).thenReturn(stories);

    final Set<String> result = service.loadAll();

    assertNotNull(result);
    assertTrue(result.contains(TEST_STORY_NAME));

    verify(scrapedStoryRepository).findAll();
  }

  @Test
  void findByName() {
    final List<ScrapedStory> stories = new ArrayList<>();
    stories.add(story);
    when(scrapedStoryRepository.findByName(anyString())).thenReturn(stories);

    final Set<String> publishers = new HashSet<>();
    publishers.add(TEST_PUBLISHER);
    when(comicService.getAllPublishersForStory(anyString())).thenReturn(publishers);

    final Set<ScrapedStory> result = service.findByName(TEST_STORY_NAME);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(story));
    assertTrue(result.contains(new ScrapedStory(TEST_STORY_NAME, TEST_PUBLISHER)));

    verify(scrapedStoryRepository).findByName(TEST_STORY_NAME);
  }

  @Test
  void createStory() throws StoryException, PublishingException {
    when(scrapedStoryRepository.save(storyArgumentCaptor.capture())).thenReturn(story);

    final ScrapedStory result = service.createStory(story);

    assertNotNull(result);
    assertSame(story, result);

    final ScrapedStory model = storyArgumentCaptor.getValue();
    assertNotNull(model);
    assertEquals(TEST_STORY_NAME, model.getName());
    assertEquals(TEST_PUBLISHER, model.getPublisher());

    verify(scrapedStoryRepository).save(model);
    verify(publishStoryListUpdateAction).publish(result);
  }

  @Test
  void createStory_publishingException() throws StoryException, PublishingException {
    when(scrapedStoryRepository.save(storyArgumentCaptor.capture())).thenReturn(story);
    doThrow(PublishingException.class).when(publishStoryListUpdateAction).publish(any());

    final ScrapedStory result = service.createStory(story);

    assertNotNull(result);
    assertSame(story, result);

    final ScrapedStory model = storyArgumentCaptor.getValue();
    assertNotNull(model);
    assertEquals(TEST_STORY_NAME, model.getName());
    assertEquals(TEST_PUBLISHER, model.getPublisher());

    verify(scrapedStoryRepository).save(model);
    verify(publishStoryListUpdateAction).publish(result);
  }

  @Test
  void getForName() {
    when(scrapedStoryRepository.getByName(anyString())).thenReturn(story);

    final ScrapedStory result = service.getForName(TEST_STORY_NAME);

    assertNotNull(result);
    assertSame(story, result);

    verify(scrapedStoryRepository).getByName(TEST_STORY_NAME);
  }

  @Test
  void saveStory() throws PublishingException {
    when(scrapedStoryRepository.save(storyArgumentCaptor.capture())).thenReturn(story);

    final ScrapedStory result = service.saveStory(story);

    assertNotNull(result);
    assertSame(story, result);

    final ScrapedStory model = storyArgumentCaptor.getValue();
    assertNotNull(model);
    assertEquals(TEST_STORY_NAME, model.getName());
    assertEquals(TEST_PUBLISHER, model.getPublisher());

    verify(scrapedStoryRepository).save(model);
    verify(publishStoryListUpdateAction).publish(result);
  }

  @Test
  void saveStory_pulishingException() throws PublishingException {
    when(scrapedStoryRepository.save(storyArgumentCaptor.capture())).thenReturn(story);
    doThrow(PublishingException.class).when(publishStoryListUpdateAction).publish(any());

    final ScrapedStory result = service.saveStory(story);

    assertNotNull(result);
    assertSame(story, result);

    final ScrapedStory model = storyArgumentCaptor.getValue();
    assertNotNull(model);
    assertEquals(TEST_STORY_NAME, model.getName());
    assertEquals(TEST_PUBLISHER, model.getPublisher());

    verify(scrapedStoryRepository).save(model);
    verify(publishStoryListUpdateAction).publish(result);
  }
}
