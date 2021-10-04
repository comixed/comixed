/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.rest.lists;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.Set;
import org.comixedproject.model.lists.Story;
import org.comixedproject.service.lists.StoryException;
import org.comixedproject.service.lists.StoryService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class StoryControllerTest {
  private static final String TEST_STORY_NEW = "Story Name";

  @InjectMocks private StoryController controller;
  @Mock private StoryService storyService;
  @Mock private Set<String> storyNameSet;
  @Mock private Story story;
  @Mock private Story savedStory;
  @Mock private Set<Story> storySet;

  @Test
  public void testLoadAll() {
    Mockito.when(storyService.loadAll()).thenReturn(storyNameSet);

    final Set<String> result = controller.loadAllNames();

    assertNotNull(result);
    assertSame(storyNameSet, result);

    Mockito.verify(storyService, Mockito.times(1)).loadAll();
  }

  @Test
  public void testLoadAllWithName() {
    Mockito.when(storyService.findByName(Mockito.anyString())).thenReturn(storySet);

    final Set<Story> result = controller.loadAllWithName(TEST_STORY_NEW);

    assertNotNull(result);
    assertSame(storySet, result);

    Mockito.verify(storyService, Mockito.times(1)).findByName(TEST_STORY_NEW);
  }

  @Test(expected = StoryException.class)
  public void testCreateStoryServiceException() throws StoryException {
    Mockito.when(storyService.createStory(Mockito.any(Story.class)))
        .thenThrow(StoryException.class);

    try {
      controller.createStory(story);
    } finally {
      Mockito.verify(storyService, Mockito.times(1)).createStory(story);
    }
  }

  @Test
  public void testCreateStory() throws StoryException {
    Mockito.when(storyService.createStory(Mockito.any(Story.class))).thenReturn(savedStory);

    final Story result = controller.createStory(story);

    assertNotNull(result);
    assertSame(savedStory, result);

    Mockito.verify(storyService, Mockito.times(1)).createStory(story);
  }
}
