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

package org.comixedproject.service.admin;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.admin.ConfigurationOption;
import org.comixedproject.repositories.admin.ConfigurationRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ConfigurationServiceTest {
  private static final String TEST_OPTION_NAME = "option.name";
  private static final String TEST_OPTION_VALUE = "option-value";
  private static final String TEST_DEFAULT_OPTION_VALUE = "default-option-value";

  @InjectMocks private ConfigurationService service;
  @Mock private ConfigurationRepository configurationRepository;
  @Mock private ConfigurationOption option;
  @Mock private ConfigurationOption existingOption;
  @Mock private ConfigurationOption savedOption;

  @Captor private ArgumentCaptor<ConfigurationOption> configurationOptionArgumentCaptor;

  private List<ConfigurationOption> optionList = new ArrayList<>();

  @Before
  public void setUp() {
    optionList.add(option);
    Mockito.when(option.getName()).thenReturn(TEST_OPTION_NAME);
    Mockito.when(option.getValue()).thenReturn(TEST_OPTION_VALUE);
  }

  @Test
  public void testGetAll() {
    Mockito.when(configurationRepository.getAll()).thenReturn(optionList);

    final List<ConfigurationOption> result = service.getAll();

    assertNotNull(result);
    assertSame(optionList, result);

    Mockito.verify(configurationRepository, Mockito.times(1)).getAll();
  }

  @Test
  public void testSaveConfigurationOptionsEntryNotFound() throws ConfigurationOptionException {
    Mockito.when(configurationRepository.findByName(Mockito.anyString())).thenReturn(null);
    Mockito.when(configurationRepository.save(configurationOptionArgumentCaptor.capture()))
        .thenReturn(existingOption);

    final List<ConfigurationOption> result = service.saveOptions(optionList);

    assertNotNull(result.isEmpty());

    final ConfigurationOption record = configurationOptionArgumentCaptor.getValue();

    assertEquals(TEST_OPTION_NAME, record.getName());
    assertEquals(TEST_OPTION_VALUE, record.getValue());

    Mockito.verify(configurationRepository, Mockito.times(optionList.size()))
        .findByName(TEST_OPTION_NAME);
    Mockito.verify(configurationRepository, Mockito.times(optionList.size())).save(record);
  }

  @Test
  public void testSaveConfigurationOptions() throws ConfigurationOptionException {
    Mockito.when(configurationRepository.findByName(Mockito.anyString()))
        .thenReturn(existingOption);
    Mockito.when(configurationRepository.save(Mockito.any(ConfigurationOption.class)))
        .thenReturn(savedOption);
    Mockito.when(configurationRepository.getAll()).thenReturn(optionList);

    final List<ConfigurationOption> result = service.saveOptions(optionList);

    assertNotNull(result);
    assertSame(optionList, result);

    Mockito.verify(configurationRepository, Mockito.times(optionList.size()))
        .findByName(TEST_OPTION_NAME);
    Mockito.verify(existingOption, Mockito.times(optionList.size())).setValue(TEST_OPTION_VALUE);
    Mockito.verify(configurationRepository, Mockito.times(optionList.size())).save(existingOption);
  }

  @Test
  public void testGetOptionValueNotFound() {
    Mockito.when(configurationRepository.findByName(Mockito.anyString())).thenReturn(null);

    final String result = service.getOptionValue(TEST_OPTION_NAME);

    assertNull(result);

    Mockito.verify(configurationRepository, Mockito.times(1)).findByName(TEST_OPTION_NAME);
  }

  @Test
  public void testGetOptionValue() {
    Mockito.when(configurationRepository.findByName(Mockito.anyString())).thenReturn(option);

    final String result = service.getOptionValue(TEST_OPTION_NAME);

    assertNotNull(result);
    assertEquals(TEST_OPTION_VALUE, result);

    Mockito.verify(configurationRepository, Mockito.times(1)).findByName(TEST_OPTION_NAME);
  }

  @Test
  public void testGetOptionValueWithDefaultNotFound() {
    Mockito.when(configurationRepository.findByName(Mockito.anyString())).thenReturn(null);

    final String result = service.getOptionValue(TEST_OPTION_NAME, TEST_DEFAULT_OPTION_VALUE);

    assertNotNull(result);
    assertEquals(TEST_DEFAULT_OPTION_VALUE, result);

    Mockito.verify(configurationRepository, Mockito.times(1)).findByName(TEST_OPTION_NAME);
  }

  @Test
  public void testGetOptionValueWithDefault() {
    Mockito.when(configurationRepository.findByName(Mockito.anyString())).thenReturn(option);

    final String result = service.getOptionValue(TEST_OPTION_NAME, TEST_DEFAULT_OPTION_VALUE);

    assertNotNull(result);
    assertEquals(TEST_OPTION_VALUE, result);

    Mockito.verify(configurationRepository, Mockito.times(1)).findByName(TEST_OPTION_NAME);
  }
}
