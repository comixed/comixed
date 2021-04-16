/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.controller.user;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import java.security.Principal;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.model.messaging.user.DeleteUserPropertyMessage;
import org.comixedproject.model.messaging.user.SetUserPropertyMessage;
import org.comixedproject.model.net.user.UpdateCurrentUserRequest;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.views.View;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class UserControllerTest {
  private static final long TEST_USER_ID = 717L;
  private static final String TEST_EMAIL = "comixedreader@comixed.org";
  private static final String TEST_PASSWORD = "My!P455w0rD";
  private static final String TEST_PROPERTY_NAME = "property.name";
  private static final String TEST_PROPERTY_VALUE = "property value";
  private static final String TEST_USER_AS_JSON = "This is the user as a JSON object";

  @InjectMocks private UserController controller;
  @Mock private UserService userService;
  @Mock private ComiXedUser user;
  @Mock private Principal principal;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
  }

  @Test(expected = ComiXedUserException.class)
  public void testLoadCurrentUserInvalidEmail() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.loadCurrentUser(principal);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testLoadCurrentUser() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);

    final ComiXedUser result = controller.loadCurrentUser(principal);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test(expected = ComiXedUserException.class)
  public void testSetUserPropertyServiceFailure() throws ComiXedUserException {
    Mockito.when(
            userService.setUserProperty(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.saveCurrentUserProperty(
          principal, new SetUserPropertyMessage(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE));
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    }
  }

  @Test
  public void testSetUserPropertySuccess() throws ComiXedUserException {
    Mockito.when(
            userService.setUserProperty(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result =
        controller.saveCurrentUserProperty(
            principal, new SetUserPropertyMessage(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE));

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1))
        .setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
  }

  @Test(expected = ComiXedUserException.class)
  public void testDeleteUserPropertyServiceFailure() throws ComiXedUserException {
    Mockito.when(userService.deleteUserProperty(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.deleteCurrentUserProperty(
          principal, new DeleteUserPropertyMessage(TEST_PROPERTY_NAME));
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);
    }
  }

  @Test
  public void testDeleteUserPropertySuccess() throws ComiXedUserException {
    Mockito.when(userService.deleteUserProperty(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result =
        controller.deleteCurrentUserProperty(
            principal, new DeleteUserPropertyMessage(TEST_PROPERTY_NAME));

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1))
        .deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);
  }

  @Test(expected = ComiXedUserException.class)
  public void testSaveCurrentUserServiceThrowsException() throws ComiXedUserException {
    Mockito.when(
            userService.updateCurrentUser(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.updateCurrentUser(
          TEST_USER_ID, new UpdateCurrentUserRequest(TEST_EMAIL, TEST_PASSWORD));
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    }
  }

  @Test
  public void testSaveCurrentUserJsonProcessingException()
      throws JsonProcessingException, ComiXedUserException {
    Mockito.when(
            userService.updateCurrentUser(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    final ComiXedUser response =
        controller.updateCurrentUser(
            TEST_USER_ID, new UpdateCurrentUserRequest(TEST_EMAIL, TEST_PASSWORD));

    assertNotNull(response);
    assertSame(user, response);

    Mockito.verify(userService, Mockito.times(1))
        .updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.UserDetailsView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(user);
    Mockito.verify(messagingTemplate, Mockito.never())
        .convertAndSend(Constants.CURRENT_USER_UPDATE_TOPIC);
  }

  @Test
  public void testSaveCurrentUser() throws JsonProcessingException, ComiXedUserException {
    Mockito.when(
            userService.updateCurrentUser(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_USER_AS_JSON);

    final ComiXedUser response =
        controller.updateCurrentUser(
            TEST_USER_ID, new UpdateCurrentUserRequest(TEST_EMAIL, TEST_PASSWORD));

    assertNotNull(response);
    assertSame(user, response);

    Mockito.verify(userService, Mockito.times(1))
        .updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.UserDetailsView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(user);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(Constants.CURRENT_USER_UPDATE_TOPIC, TEST_USER_AS_JSON);
  }
}
