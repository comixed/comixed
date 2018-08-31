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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineIssueWebRequestTest extends BaseWebRequestTest
{
    private static final String TEST_API_KEY = "12345";
    private static final String TEST_EXPECTED_FILTERED = "filter=id:4055";

    @InjectMocks
    private ComicVineIssueWebRequest request;

    @Before
    public void setUp()
    {
        request.setIssueId("599828");
    }

    @Test
    public void testEnsureSetup()
    {
        assertEquals("issue/4000-599828", request.endpoint);
    }

    @Test(expected = WebRequestException.class)
    public void testGetUrlWithoutIssueId() throws WebRequestException
    {
        request.endpoint = null;
        request.getURL();
    }

    @Test
    public void testGetURLWithFilters() throws WebRequestException
    {
        request.setApiKey(TEST_API_KEY);
        request.addFilter("id", "4055");

        String result = request.getURL();

        assertNotEquals(-1, result.indexOf(TEST_EXPECTED_FILTERED));
    }
}
