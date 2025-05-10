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

package org.comixedproject.messaging.lists;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.lists.ScrapedStory;
import org.comixedproject.views.View;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RunWith(MockitoJUnitRunner.class)
public class PublishStoryListUpdateActionTest {
  private static final String TEST_STORY_AS_JSON = "The story as JSON";
  private static final long TEST_STORY_ID = 927L;

  @InjectMocks private PublishStoryListUpdateAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private ScrapedStory story;

  @Before
  public void setUp() throws JsonProcessingException {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_STORY_AS_JSON);
    Mockito.when(story.getId()).thenReturn(TEST_STORY_ID);
  }

  @Test(expected = PublishingException.class)
  public void testPublishJsonProcessingException()
      throws PublishingException, JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    try {
      action.publish(story);
    } finally {
      Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.StoryList.class);
    }
  }

  @Test
  public void testPublish() throws PublishingException, JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_STORY_AS_JSON);

    action.publish(story);

    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.StoryList.class);
    Mockito.verify(objectWriter, Mockito.times(2)).writeValueAsString(story);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(PublishStoryListUpdateAction.STORY_LIST_UPDATE_TOPIC, TEST_STORY_AS_JSON);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(
            String.format(PublishStoryListUpdateAction.STORY_UPDATE_TOPIC, TEST_STORY_ID),
            TEST_STORY_AS_JSON);
  }
}
