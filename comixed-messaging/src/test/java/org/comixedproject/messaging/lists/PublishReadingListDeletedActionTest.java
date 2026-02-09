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

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.views.View;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.ObjectWriter;

@ExtendWith(MockitoExtension.class)
class PublishReadingListDeletedActionTest {
  private static final String TEST_READING_LIST_AS_JSON = "The reading list as JSON";
  private static final String TEST_OWNER_EMAIL = "reader@comixedproject.org";

  @InjectMocks private PublishReadingListDeletedAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private ReadingList readingList;
  @Mock private ComiXedUser owner;

  @BeforeEach
  public void setUp() throws JacksonException {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_READING_LIST_AS_JSON);
    Mockito.when(readingList.getOwner()).thenReturn(owner);
    Mockito.when(owner.getEmail()).thenReturn(TEST_OWNER_EMAIL);
  }

  @Test
  void PublishReadingListUpdate() throws PublishingException, JacksonException {
    action.publish(readingList);

    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ReadingListDetail.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(readingList);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSendToUser(
            TEST_OWNER_EMAIL,
            PublishReadingListDeletedAction.READING_LIST_REMOVED_TOPIC,
            TEST_READING_LIST_AS_JSON);
  }

  @Test
  void PublishReadingListUpdatePublishingException() throws JacksonException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenThrow(JacksonException.class);

    assertThrows(PublishingException.class, () -> action.publish(readingList));
  }
}
