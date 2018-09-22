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

package org.comixed.web;

import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineIssuesWebRequestTest extends BaseWebRequestTest
{
    private static final String TEST_API_KEY = "12345";
    private static final String TEST_COMIC_VOLUME = "92750";
    private static final String TEST_ISSUE_NUMBER = "38";
    @InjectMocks
    private ComicVineIssuesWebRequest request;

    @Test(expected = WebRequestException.class)
    public void testGetURLRequiresApiKey() throws WebRequestException
    {
        request.setVolume(TEST_COMIC_VOLUME);
        request.setIssueNumber(TEST_ISSUE_NUMBER);

        request.getURL();
    }

    @Test(expected = WebRequestException.class)
    public void testGetURLRequiresVolume() throws WebRequestException
    {
        request.setApiKey(TEST_API_KEY);
        request.setIssueNumber(TEST_ISSUE_NUMBER);

        request.getURL();
    }

    @Test(expected = WebRequestException.class)
    public void testGetURLRequiresIssueNumber() throws WebRequestException
    {
        request.setApiKey(TEST_API_KEY);
        request.setVolume(TEST_COMIC_VOLUME);

        request.getURL();
    }

    @Test
    public void testGetURL() throws WebRequestException
    {
        request.setApiKey(TEST_API_KEY);
        request.setVolume(TEST_COMIC_VOLUME);
        request.setIssueNumber(TEST_ISSUE_NUMBER);

        String result = request.getURL();

        assertNotNull(result);
        assertNotEquals(-1, result.indexOf("api_key=" + TEST_API_KEY));
        assertNotEquals(-1, result.indexOf("volume:" + TEST_COMIC_VOLUME));
        assertNotEquals(-1, result.indexOf("issue_number:" + TEST_ISSUE_NUMBER));
    }
}
