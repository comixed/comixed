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
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.messaging.comicbooks.ComicBookSelectionEvent;
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

@ExtendWith(MockitoExtension.class)
class PublishComicBookSelectionStateActionTest {
  private static final String TEST_IDS_AS_JSON = "Object as JSON";
  private static final String TEST_USER_EMAIL = "user@comixedproject.org";

  @InjectMocks private PublishComicBookSelectionStateAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private ComiXedUser user;

  private final List<Long> comicBookIds = new ArrayList<>();
  private ComicBookSelectionEvent comicBookSelectionEvent;

  @BeforeEach
  public void setUp() throws JsonProcessingException {
    Mockito.lenient().when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.lenient()
        .when(objectWriter.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_IDS_AS_JSON);
    Mockito.lenient().when(user.getEmail()).thenReturn(TEST_USER_EMAIL);
    this.comicBookSelectionEvent = new ComicBookSelectionEvent(this.user, this.comicBookIds);
  }

  @Test
  void publish_jsonProcessingException() throws JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    assertThrows(PublishingException.class, () -> action.publish(comicBookSelectionEvent));
  }

  @Test
  void publish() throws JsonProcessingException, PublishingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_IDS_AS_JSON);

    action.publish(comicBookSelectionEvent);

    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.GenericObjectView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(comicBookIds);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSendToUser(TEST_USER_EMAIL, COMIC_BOOK_SELECTION_UPDATE_TOPIC, TEST_IDS_AS_JSON);
  }
}
