/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import static org.junit.Assert.fail;

import org.comixed.web.ComicVineQueryWebRequest;
import org.comixed.web.WebRequestProcessor;
import org.comixed.web.comicvine.ComicVineQueryAdaptor;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicScraperControllerTest
{
    @InjectMocks
    private ComicScraperController controller;

    @Mock
    private WebRequestProcessor webRequestProcessor;

    @Mock
    private ComicVineQueryAdaptor comicVineQueryAdaptor;

    @Mock
    private ObjectFactory<ComicVineQueryWebRequest> searchQueryForIssuesFactory;

    @Mock
    private ComicVineQueryWebRequest searchQueryForIssues;

    @Test
    public void testQueryForVolumesAdaptorRaisesException()
    {
        fail("Not implemented yet");
    }

    @Test
    public void testQueryForVolumes()
    {
        fail("Not implemented yet");
    }

    @Test
    public void testQueryForVolumesMultipointPages()
    {
        fail("Not implemented yet");
    }
}
