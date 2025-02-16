/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project.
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

package org.comixedproject.messaging.app;

import static org.comixedproject.messaging.app.PublishApplicationMessageAction.APP_MESSAGE_TOPIC_NAME;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.messaging.ApplicationEvent;
import org.comixedproject.views.View;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
class PublishApplicationMessageActionTest {
  private static final String TEST_UPDATE_AS_JSON = "The message as JSON";

  @InjectMocks private PublishApplicationMessageAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private ApplicationEvent applicationEvent;

  @BeforeEach
  public void setUp() throws JsonProcessingException {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_UPDATE_AS_JSON);
  }

  @Test
  void publish_jsonProcessingException() throws JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    assertThrows(PublishingException.class, () -> action.publish(applicationEvent));
  }

  @Test
  void publish() throws JsonProcessingException, PublishingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_UPDATE_AS_JSON);

    action.publish(applicationEvent);

    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.GenericObjectView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(applicationEvent);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(APP_MESSAGE_TOPIC_NAME, TEST_UPDATE_AS_JSON);
  }
}
