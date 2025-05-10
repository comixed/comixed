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

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishStoryListUpdateAction;
import org.comixedproject.model.lists.ScrapedStory;
import org.comixedproject.repositories.lists.ScrapedStoryRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class StoryServiceTest {
  private static final String TEST_STORY_NAME = "The Story Name";
  private static final String TEST_PUBLISHER = "The Publisher";

  @InjectMocks private StoryService service;
  @Mock private ScrapedStoryRepository scrapedStoryRepository;
  @Mock private ComicBookService comicBookService;
  @Mock private PublishStoryListUpdateAction publishStoryListUpdateAction;
  @Mock private ScrapedStory story;

  @Captor private ArgumentCaptor<ScrapedStory> storyArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(story.getName()).thenReturn(TEST_STORY_NAME);
    Mockito.when(story.getPublisher()).thenReturn(TEST_PUBLISHER);
  }

  @Test
  public void testLoadAll() {
    final List<ScrapedStory> stories = new ArrayList<>();
    stories.add(story);

    Mockito.when(scrapedStoryRepository.findAll()).thenReturn(stories);

    final Set<String> result = service.loadAll();

    assertNotNull(result);
    assertTrue(result.contains(TEST_STORY_NAME));

    Mockito.verify(scrapedStoryRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testFindByName() {
    final List<ScrapedStory> stories = new ArrayList<>();
    stories.add(story);
    Mockito.when(scrapedStoryRepository.findByName(Mockito.anyString())).thenReturn(stories);

    final List<String> publishers = new ArrayList<>();
    publishers.add(TEST_PUBLISHER);
    Mockito.when(comicBookService.getAllPublishersForStory(Mockito.anyString()))
        .thenReturn(publishers);

    final Set<ScrapedStory> result = service.findByName(TEST_STORY_NAME);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(story));
    assertTrue(result.contains(new ScrapedStory(TEST_STORY_NAME, TEST_PUBLISHER)));

    Mockito.verify(scrapedStoryRepository, Mockito.times(1)).findByName(TEST_STORY_NAME);
  }

  @Test
  public void testCreateStory() throws StoryException, PublishingException {
    Mockito.when(scrapedStoryRepository.save(storyArgumentCaptor.capture())).thenReturn(story);

    final ScrapedStory result = service.createStory(story);

    assertNotNull(result);
    assertSame(story, result);

    final ScrapedStory model = storyArgumentCaptor.getValue();
    assertNotNull(model);
    assertEquals(TEST_STORY_NAME, model.getName());
    assertEquals(TEST_PUBLISHER, model.getPublisher());

    Mockito.verify(scrapedStoryRepository, Mockito.times(1)).save(model);
    Mockito.verify(publishStoryListUpdateAction, Mockito.times(1)).publish(result);
  }
}
