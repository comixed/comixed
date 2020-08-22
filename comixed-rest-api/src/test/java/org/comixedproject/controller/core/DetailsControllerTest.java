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

package org.comixedproject.controller.core;

import static junit.framework.TestCase.*;

import java.text.ParseException;
import org.comixedproject.model.core.BuildDetails;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.service.core.DetailsService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class DetailsControllerTest {
  private static final String TEST_STACKTRACE = "The error message";

  @InjectMocks private DetailsController detailsController;
  @Mock private DetailsService detailsService;
  @Mock private BuildDetails buildDetails;
  @Mock private ParseException parseException;

  @Test
  public void testGetBuildDetailsParsingException() throws ParseException {
    Mockito.when(detailsService.getBuildDetails()).thenThrow(parseException);
    Mockito.when(parseException.getMessage()).thenReturn(TEST_STACKTRACE);

    final ApiResponse<BuildDetails> result = detailsController.getBuildDetails();

    assertNotNull(result);
    assertFalse(result.isSuccess());
    assertEquals(TEST_STACKTRACE, result.getError());

    Mockito.verify(detailsService, Mockito.times(1)).getBuildDetails();
  }

  @Test
  public void testGetBuildDetails() throws ParseException {
    Mockito.when(detailsService.getBuildDetails()).thenReturn(buildDetails);

    final ApiResponse<BuildDetails> result = detailsController.getBuildDetails();

    assertNotNull(result);
    assertTrue(result.isSuccess());
    assertSame(buildDetails, result.getResult());

    Mockito.verify(detailsService, Mockito.times(1)).getBuildDetails();
  }
}
