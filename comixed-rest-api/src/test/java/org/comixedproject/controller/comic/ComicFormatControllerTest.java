/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.controller.comic;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comic.ComicFormat;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.service.comic.ComicFormatService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RunWith(MockitoJUnitRunner.class)
public class ComicFormatControllerTest {
  private static final String TEST_USER_EMAIL = "user@domain.tld";

  @InjectMocks private ComicFormatController controller;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ComicFormatService comicFormatService;
  @Mock private Principal principal;
  @Mock private ComicFormat comicFormat;

  private List<ComicFormat> comicFormatList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
  }

  @Test
  public void testGetAll() {
    comicFormatList.add(comicFormat);

    Mockito.when(comicFormatService.getAll()).thenReturn(comicFormatList);

    controller.getAll(principal);

    Mockito.verify(comicFormatService, Mockito.times(1)).getAll();
    Mockito.verify(messagingTemplate, Mockito.times(comicFormatList.size()))
        .convertAndSendToUser(TEST_USER_EMAIL, Constants.COMIC_FORMAT_UPDATE_TOPIC, comicFormat);
  }
}
