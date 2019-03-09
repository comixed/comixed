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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

@RunWith(PowerMockRunner.class)
@PrepareForTest(
{URLEncoder.class})
public class ComicVineQueryWebRequestTest
{
    private static final String TEST_SERIES_NAME = "A really great comic";
    private static final String TEST_API_KEY = "12345";

    @InjectMocks
    private ComicVineQueryWebRequest request;

    @Test
    public void testSetSeriesName() throws WebRequestException, UnsupportedEncodingException
    {
        request.setSeriesName(TEST_SERIES_NAME);

        assertTrue(request.parameterSet.containsKey(ComicVineQueryWebRequest.SERIES_NAME_KEY));
        assertEquals(URLEncoder.encode(TEST_SERIES_NAME, StandardCharsets.UTF_8.name()),
                     request.parameterSet.get(ComicVineQueryWebRequest.SERIES_NAME_KEY));
    }

    @Test
    public void testSetSeriesNameWithEmptyString() throws WebRequestException
    {
        request.setSeriesName("");

        assertFalse(request.parameterSet.containsKey(ComicVineQueryWebRequest.SERIES_NAME_KEY));
    }

    @Test(expected = WebRequestException.class)
    public void testSetSeriesNameTwice() throws WebRequestException, UnsupportedEncodingException
    {
        request.setSeriesName(TEST_SERIES_NAME);
        request.setSeriesName(TEST_SERIES_NAME);
    }

    @Test(expected = WebRequestException.class)
    public void testGetURLWithNoApiKeySet() throws WebRequestException
    {
        request.getURL();
    }

    @Test(expected = WebRequestException.class)
    public void testGetURLWithNoName() throws WebRequestException
    {
        request.setApiKey(TEST_API_KEY);
        request.setSeriesName("");
        request.getURL();
    }

    @Test
    public void testGetURL() throws WebRequestException, UnsupportedEncodingException
    {
        request.setApiKey(TEST_API_KEY);
        request.setSeriesName(TEST_SERIES_NAME);

        String result = request.getURL();

        assertTrue(result.indexOf("&query=" + URLEncoder.encode(TEST_SERIES_NAME, StandardCharsets.UTF_8.name())) != -1);
        assertTrue(result.indexOf("&field_list=name,start_year,publisher,id,image,count_of_issues") != -1);
        assertTrue(result.indexOf("&resources=volume") != -1);
    }
}
