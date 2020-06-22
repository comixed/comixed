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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.scrapers;

import static org.junit.Assert.*;

import java.io.UnsupportedEncodingException;
import org.comixed.utils.Utils;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineQueryWebRequestTest {
  private static final String TEST_SERIES_NAME = "A really great comic";
  private static final String TEST_API_KEY = "12345";
  private static final String TEST_ENCODED_URL = "Encoded URL";

  @InjectMocks private ComicVineQueryWebRequest request;
  @Mock private Utils utils;

  @Test
  public void testSetSeriesName() throws WebRequestException, UnsupportedEncodingException {
    Mockito.when(utils.encodeURL(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_ENCODED_URL);

    request.setSeriesName(TEST_SERIES_NAME);

    assertTrue(request.parameterSet.containsKey(ComicVineQueryWebRequest.SERIES_NAME_KEY));
    Assert.assertEquals(
        TEST_ENCODED_URL, request.parameterSet.get(ComicVineQueryWebRequest.SERIES_NAME_KEY));
  }

  @Test
  public void testSetSeriesNameWithEmptyString() throws WebRequestException {
    request.setSeriesName("");

    assertFalse(request.parameterSet.containsKey(ComicVineQueryWebRequest.SERIES_NAME_KEY));
  }

  @Test(expected = WebRequestException.class)
  public void testSetSeriesNameTwice() throws WebRequestException, UnsupportedEncodingException {
    request.setSeriesName(TEST_SERIES_NAME);
    request.setSeriesName(TEST_SERIES_NAME);
  }

  @Test(expected = WebRequestException.class)
  public void testGetURLWithNoApiKeySet() throws WebRequestException {
    request.getURL();
  }

  @Test(expected = WebRequestException.class)
  public void testGetURLWithNoName() throws WebRequestException {
    request.setApiKey(TEST_API_KEY);
    request.setSeriesName("");
    request.getURL();
  }

  @Test
  public void testGetURL() throws WebRequestException, UnsupportedEncodingException {
    Mockito.when(utils.encodeURL(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_ENCODED_URL);

    request.setApiKey(TEST_API_KEY);
    request.setSeriesName(TEST_SERIES_NAME);

    String result = request.getURL();

    assertNotEquals(-1, result.indexOf("&query=" + TEST_ENCODED_URL));
    assertTrue(
        result.indexOf("&field_list=name,start_year,publisher,id,image,count_of_issues") != -1);
    assertTrue(result.indexOf("&resources=volume") != -1);
  }
}
