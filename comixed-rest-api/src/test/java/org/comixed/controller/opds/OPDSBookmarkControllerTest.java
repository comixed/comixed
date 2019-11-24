/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.controller.opds;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.Optional;
import org.comixed.model.library.Comic;
import org.comixed.model.opds.OPDSBookmark;
import org.comixed.model.user.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.service.library.ComicException;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.mockito.BDDMockito;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.security.*")
@PrepareForTest({SecurityContextHolder.class})
@SpringBootTest
public class OPDSBookmarkControllerTest {

  private static final String TEST_USER_EMAIL = "reader@local";
  private static final String EXPECTED_MESSAGE = "Bookmark Not Found";
  private static final long DOC_ID = 100L;
  private static final String MARK = "10";

  @InjectMocks private OPDSBookmarkController controller;

  @Mock private Authentication autentication;

  @Mock private SecurityContext securityContext;

  @Mock private ComiXedUserRepository userRepository;

  @Mock private ComicRepository comicRepository;

  @Mock private ComiXedUser user;

  @Mock private Comic comic;

  @Rule public ExpectedException expectedException = ExpectedException.none();

  @Before
  public void setUp() {
    PowerMockito.mockStatic(SecurityContextHolder.class);
    Mockito.when(autentication.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(securityContext.getAuthentication()).thenReturn(autentication);
    BDDMockito.given(SecurityContextHolder.getContext()).willReturn(securityContext);
    Mockito.when(userRepository.findByEmail(TEST_USER_EMAIL)).thenReturn(user);
    Mockito.when(comicRepository.findById(DOC_ID)).thenReturn(Optional.of(comic));
  }

  @Test
  public void testBookmarkNotFound() throws ComicException {
    Mockito.when(user.getBookmark(DOC_ID)).thenReturn("0");
    expectedException.expect(ComicException.class);
    expectedException.expectMessage(EXPECTED_MESSAGE);

    BDDMockito.given(controller.getBookmark(DOC_ID))
        .willThrow(new ComicException(EXPECTED_MESSAGE));
  }

  @Test
  public void testGetBookmark() throws ComicException {

    Mockito.when(user.getBookmark(DOC_ID)).thenReturn(MARK);
    OPDSBookmark result = controller.getBookmark(DOC_ID);

    assertEquals(result.getMark(), MARK);
    assertEquals(result.getIsFinished(), false);
  }

  @Test
  public void testGetBookmarkBookFinished() throws ComicException {
    Mockito.when(user.getBookmark(DOC_ID)).thenReturn(MARK);
    Mockito.when(comic.getPageCount()).thenReturn(10);
    OPDSBookmark result = controller.getBookmark(DOC_ID);

    assertEquals(result.getMark(), MARK);
    assertEquals(result.getIsFinished(), true);
  }

  @Test
  public void testSetBookmark() {
    OPDSBookmark opdsBookmark = new OPDSBookmark(DOC_ID, "1", true);
    ResponseEntity result = controller.setBookmark(DOC_ID, opdsBookmark);

    assertNotNull(result);
  }
}
