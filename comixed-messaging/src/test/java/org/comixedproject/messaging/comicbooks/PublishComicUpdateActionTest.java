/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project.
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

package org.comixedproject.messaging.comicbooks;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.messaging.Constants;
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
public class PublishComicUpdateActionTest {
  private static final String TEST_COMIC_AS_JSON = "Object as JSON";
  private static final long TEST_COMIC_ID = 273L;

  @InjectMocks private PublishComicUpdateAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private Comic comic;

  @Before
  public void setUp() throws JsonProcessingException {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_COMIC_AS_JSON);
    Mockito.when(comic.getId()).thenReturn(TEST_COMIC_ID);
  }

  @Test(expected = PublishingException.class)
  public void testPublishJsonProcessingException()
      throws PublishingException, JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    try {
      action.publish(comic);
    } finally {
      Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ComicListView.class);
    }
  }

  @Test
  public void testPublish() throws PublishingException, JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_COMIC_AS_JSON);

    action.publish(comic);

    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ComicListView.class);
    Mockito.verify(objectWriter, Mockito.times(2)).writeValueAsString(comic);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(Constants.COMIC_LIST_UPDATE_TOPIC, TEST_COMIC_AS_JSON);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(
            String.format(Constants.COMIC_BOOK_UPDATE_TOPIC, TEST_COMIC_ID), TEST_COMIC_AS_JSON);
  }
}
