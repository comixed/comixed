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

import static junit.framework.TestCase.*;
import static org.junit.Assert.assertThrows;

import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.admin.ConfigurationOption;
import org.comixedproject.model.net.admin.FeatureEnabledResponse;
import org.comixedproject.model.net.admin.SaveConfigurationOptionsRequest;
import org.comixedproject.model.net.admin.SaveConfigurationOptionsResponse;
import org.comixedproject.service.admin.ConfigurationOptionException;
import org.comixedproject.service.admin.ConfigurationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ConfigurationControllerTest {
  private static final Boolean TEST_FEATURE_ENABLED = RandomUtils.nextBoolean();
  private static final String TEST_FEATURE_NAME = "test.feature-name";

  @InjectMocks private ConfigurationController controller;
  @Mock private ConfigurationService configurationService;
  @Mock private List<ConfigurationOption> optionList;
  @Mock private List<ConfigurationOption> savedOptionList;

  @Test
  void getAll() {
    Mockito.when(configurationService.getAll()).thenReturn(optionList);

    final List<ConfigurationOption> result = controller.getAll();

    assertNotNull(result);
    assertSame(optionList, result);

    Mockito.verify(configurationService, Mockito.times(1)).getAll();
  }

  @Test
  void saveOptionsServiceException() throws ConfigurationOptionException {
    Mockito.when(configurationService.saveOptions(Mockito.anyList()))
        .thenThrow(ConfigurationOptionException.class);

    assertThrows(
        ConfigurationOptionException.class,
        () -> controller.saveOptions(new SaveConfigurationOptionsRequest(optionList)));
  }

  @Test
  void saveOptions() throws ConfigurationOptionException {
    Mockito.when(configurationService.saveOptions(Mockito.anyList())).thenReturn(savedOptionList);

    final SaveConfigurationOptionsResponse result =
        controller.saveOptions(new SaveConfigurationOptionsRequest(optionList));

    assertNotNull(result);
    assertSame(savedOptionList, result.getOptions());

    Mockito.verify(configurationService, Mockito.times(1)).saveOptions(optionList);
  }

  @Test
  void getFeatureEnabled() {
    Mockito.when(configurationService.isFeatureEnabled(Mockito.anyString()))
        .thenReturn(TEST_FEATURE_ENABLED);

    final FeatureEnabledResponse result = controller.getFeatureEnabled(TEST_FEATURE_NAME);

    assertNotNull(result);
    assertEquals(TEST_FEATURE_ENABLED, result.getEnabled());

    Mockito.verify(configurationService, Mockito.times(1)).isFeatureEnabled(TEST_FEATURE_NAME);
  }
}
