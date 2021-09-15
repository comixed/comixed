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

package org.comixedproject.messaging.lists;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.model.user.ComiXedUser;
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
public class PublishReadingListUpdateActionTest {
  private static final String TEST_READING_LIST_AS_JSON = "The reading list as JSON";
  private static final long TEST_READING_LIST_ID = 717L;
  private static final String TEST_OWNER_EMAIL = "reader@comixedproject.org";

  @InjectMocks private PublishReadingListUpdateAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private ReadingList readingList;
  @Mock private ComiXedUser owner;

  @Before
  public void setUp() throws JsonProcessingException {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_READING_LIST_AS_JSON);
    Mockito.when(readingList.getOwner()).thenReturn(owner);
    Mockito.when(owner.getEmail()).thenReturn(TEST_OWNER_EMAIL);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
  }

  @Test
  public void testPublishReadingListUpdate() throws PublishingException, JsonProcessingException {
    action.publish(readingList);

    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ReadingLists.class);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ReadingListDetail.class);
    Mockito.verify(objectWriter, Mockito.times(2)).writeValueAsString(readingList);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSendToUser(
            TEST_OWNER_EMAIL, Constants.READING_LISTS_UPDATE_TOPIC, TEST_READING_LIST_AS_JSON);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSendToUser(
            TEST_OWNER_EMAIL,
            String.format(Constants.READING_LIST_UPDATE_TOPIC, TEST_READING_LIST_ID),
            TEST_READING_LIST_AS_JSON);
  }

  @Test(expected = PublishingException.class)
  public void testPublishReadingListUpdatePublishingException()
      throws PublishingException, JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    try {
      action.publish(readingList);
    } finally {
      Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ReadingLists.class);
      Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(readingList);
      Mockito.verify(messagingTemplate, Mockito.never())
          .convertAndSendToUser(Mockito.any(), Mockito.any(), Mockito.any());
    }
  }
}
