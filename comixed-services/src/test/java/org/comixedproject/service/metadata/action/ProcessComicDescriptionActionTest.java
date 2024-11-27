/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
 * aLong with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.metadata.action;

import static org.junit.Assert.*;

import org.comixedproject.service.admin.ConfigurationService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ProcessComicDescriptionActionTest {
  private static final String TEST_TEXT = "This is the actual text we want!";
  private static final String TEST_TEXT_WITH_HTML =
      String.format("<html><head></head><body>%s</body></html>", TEST_TEXT);
  @InjectMocks private ProcessComicDescriptionAction action;
  @Mock private ConfigurationService configurationService;

  @Test
  public void testExecute_stripHtmlFeatureDisabled() {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_STRIP_HTML_FROM_METADATA))
        .thenReturn(false);

    final String result = action.execute(TEST_TEXT_WITH_HTML);

    assertEquals(TEST_TEXT_WITH_HTML, result);
  }

  @Test
  public void testExecute_stripHtmlFeatureEnabled() {
    Mockito.when(
            configurationService.isFeatureEnabled(
                ConfigurationService.CFG_STRIP_HTML_FROM_METADATA))
        .thenReturn(true);

    final String result = action.execute(TEST_TEXT_WITH_HTML);

    assertEquals(TEST_TEXT, result);
  }
}
