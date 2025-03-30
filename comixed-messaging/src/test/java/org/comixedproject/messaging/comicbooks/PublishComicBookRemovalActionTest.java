/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.messaging.comicbooks;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.views.View;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PublishComicBookRemovalActionTest {
  private static final String TEST_COMIC_AS_JSON = "Object as JSON";
  private static final long TEST_COMIC_ID = 273L;

  @InjectMocks private PublishComicBookRemovalAction action;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private ComicBook comicBook;

  @BeforeEach
  public void setUp() throws JsonProcessingException {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_COMIC_AS_JSON);
    Mockito.when(comicBook.getComicBookId()).thenReturn(TEST_COMIC_ID);
  }

  @Test
  void publish_jsonProcessingException() throws JsonProcessingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    assertThrows(PublishingException.class, () -> action.publish(comicBook));
  }

  @Test
  void publish() throws JsonProcessingException, PublishingException {
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_COMIC_AS_JSON);

    action.publish(comicBook);

    Mockito.verify(objectMapper, Mockito.times(2)).writerWithView(View.ComicDetailsView.class);
    Mockito.verify(objectWriter, Mockito.times(2)).writeValueAsString(comicBook);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(PublishComicBookRemovalAction.COMIC_LIST_REMOVAL_TOPIC, TEST_COMIC_AS_JSON);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(
            String.format(PublishComicBookRemovalAction.COMIC_BOOK_REMOVAL_TOPIC, TEST_COMIC_ID),
            TEST_COMIC_AS_JSON);
  }
}
