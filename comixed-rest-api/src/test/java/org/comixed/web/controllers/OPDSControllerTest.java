/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.controllers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.security.Principal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Comic;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ComicRepository;
import org.comixed.web.opds.OPDSFeed;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class OPDSControllerTest
{
    private static final String TEST_USER_EMAIL = "reader@local";
    private static final Long TEST_USER_ID = 1000L;

    @InjectMocks
    private OPDSController controller;

    @Mock
    private ComiXedUserRepository userRepository;

    @Mock
    private Principal principal;

    @Mock
    private ComiXedUser user;

    @Mock
    private ComicRepository comicRepository;

    private List<Comic> comicList = new ArrayList<>();

    @Test
    public void testGetNavigationFeedNotAuthenticated() throws ParseException
    {
        OPDSFeed result = controller.getNavigationFeed(null);

        assertNull(result);
    }

    @Test
    public void testGetNavigationFeed() throws ParseException
    {
        Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL);

        OPDSFeed result = controller.getNavigationFeed(principal);

        assertNotNull(result);

        Mockito.verify(principal, Mockito.times(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
        Mockito.verify(user, Mockito.atLeast(1)).getEmail();
    }

    @Test
    public void testGetAllComicsNotAuthenticated() throws ParseException
    {
        OPDSFeed result = controller.getAllComics(null);

        assertNull(result);
    }

    @Test
    public void testGetAllComics() throws ParseException
    {
        Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL);
        Mockito.when(comicRepository.findAll()).thenReturn(comicList);

        OPDSFeed result = controller.getAllComics(principal);

        assertNotNull(result);
        assertEquals(comicList, result.getEntries());

        Mockito.verify(principal, Mockito.times(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
        Mockito.verify(user, Mockito.atLeast(1)).getEmail();
        Mockito.verify(comicRepository, Mockito.times(1)).findAll();
    }

    @Test
    public void testGetUnreadNotAuthenticated() throws ParseException
    {
        OPDSFeed result = controller.getUnread(null);

        assertNull(result);
    }

    @Test
    public void testGetUnread() throws ParseException
    {
        Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL);
        Mockito.when(user.getId()).thenReturn(TEST_USER_ID);
        Mockito.when(comicRepository.findAllUnreadByUser(TEST_USER_ID)).thenReturn(comicList);

        OPDSFeed result = controller.getUnread(principal);

        assertNotNull(result);
        assertEquals(comicList, result.getEntries());

        Mockito.verify(principal, Mockito.times(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
        Mockito.verify(user, Mockito.atLeast(1)).getEmail();
        Mockito.verify(user, Mockito.times(1)).getId();
        Mockito.verify(comicRepository, Mockito.times(1)).findAllUnreadByUser(TEST_USER_ID);
    }
}
