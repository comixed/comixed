/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.rest.library;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import org.comixedproject.model.net.metadata.GetIssueCountResponse;
import org.comixedproject.service.library.IssueService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class IssueControllerTest {
  private static final String TEST_SERIES = "The series";
  private static final String TEST_VOLUME = "2022";
  private static final Long TEST_COUNT = 129L;

  @InjectMocks private IssueController controller;
  @Mock private IssueService issueService;

  @Test
  public void testGetCountForSeriesAndVolume() {
    Mockito.when(issueService.getCountForSeriesAndVolume(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_COUNT);

    final GetIssueCountResponse result = controller.getIssueCount(TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertEquals(TEST_COUNT, result.getCount());

    Mockito.verify(issueService, Mockito.times(1))
        .getCountForSeriesAndVolume(TEST_SERIES, TEST_VOLUME);
  }
}
