/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

import static org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction.COMIC_BOOK_SELECTION_UPDATE_TOPIC;
import static org.junit.Assert.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import java.util.HashSet;
import java.util.Set;
import org.comixedproject.messaging.PublishingException;
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
public class PublishComicBookSelectionStateActionTest {
  private static final String TEST_IDS_AS_JSON = "Object as JSON";
  private static final long TEST_COMIC_ID = 273L;
  private final Set<Long> comicBookIdList = new HashSet<>();
  @InjectMocks private PublishComicBookSelectionStateAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;

  @Before
  public void setUp() throws JsonProcessingException {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_IDS_AS_JSON);
  }

  @Test(expected = PublishingException.class)
  public void testPublishJsonProcessingException()
      throws JsonProcessingException, PublishingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    try {
      action.publish(comicBookIdList);
    } finally {
      Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.GenericObjectView.class);
    }
  }

  @Test
  public void testPublish() throws JsonProcessingException, PublishingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_IDS_AS_JSON);

    action.publish(comicBookIdList);

    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.GenericObjectView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(comicBookIdList);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(COMIC_BOOK_SELECTION_UPDATE_TOPIC, TEST_IDS_AS_JSON);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(COMIC_BOOK_SELECTION_UPDATE_TOPIC, TEST_IDS_AS_JSON);
  }
}
