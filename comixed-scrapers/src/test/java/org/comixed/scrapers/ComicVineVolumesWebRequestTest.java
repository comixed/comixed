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

import static org.junit.Assert.assertNotEquals;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineVolumesWebRequestTest extends BaseWebRequestTest {
  private static final String TEST_API_KEY = "12345";
  private static final String TEST_EXPECTED_FILTER = "filter=name:Batman";

  @InjectMocks private ComicVineVolumesWebRequest request;

  @Test
  public void testEnsureSetup() {
    Assert.assertEquals("volumes", request.endpoint);
  }

  @Test
  public void testGetURLWithFilters() throws WebRequestException {
    request.setApiKey(TEST_API_KEY);
    request.addFilter("name", "Batman");

    String result = request.getURL();

    assertNotEquals(-1, result.indexOf(TEST_EXPECTED_FILTER));
  }
}
