/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.rest.admin;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.admin.ConfigurationOption;
import org.comixedproject.model.net.admin.SaveConfigurationOptionsRequest;
import org.comixedproject.model.net.admin.SaveConfigurationOptionsResponse;
import org.comixedproject.service.admin.ConfigurationOptionException;
import org.comixedproject.service.admin.ConfigurationService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ConfigurationControllerTest {
  @InjectMocks private ConfigurationController controller;
  @Mock private ConfigurationService configurationService;
  @Mock private List<ConfigurationOption> optionList;
  @Mock private List<ConfigurationOption> savedOptionList;

  @Test
  public void testGetAll() {
    Mockito.when(configurationService.getAll()).thenReturn(optionList);

    final List<ConfigurationOption> result = controller.getAll();

    assertNotNull(result);
    assertSame(optionList, result);

    Mockito.verify(configurationService, Mockito.times(1)).getAll();
  }

  @Test(expected = ConfigurationOptionException.class)
  public void testSaveOptionsServiceException() throws ConfigurationOptionException {
    Mockito.when(configurationService.saveOptions(Mockito.anyList()))
        .thenThrow(ConfigurationOptionException.class);

    try {
      controller.saveOptions(new SaveConfigurationOptionsRequest(optionList));
    } finally {
      Mockito.verify(configurationService, Mockito.times(1)).saveOptions(optionList);
    }
  }

  @Test
  public void testSaveOptions() throws ConfigurationOptionException {
    Mockito.when(configurationService.saveOptions(Mockito.anyList())).thenReturn(savedOptionList);

    final SaveConfigurationOptionsResponse result =
        controller.saveOptions(new SaveConfigurationOptionsRequest(optionList));

    assertNotNull(result);
    assertSame(savedOptionList, result.getOptions());

    Mockito.verify(configurationService, Mockito.times(1)).saveOptions(optionList);
  }
}
