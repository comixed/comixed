/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.service.plugin;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.comixedproject.model.net.plugin.PluginLanguage;
import org.comixedproject.plugins.PluginRuntimeProvider;
import org.comixedproject.plugins.PluginRuntimeRegistry;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PluginLanguageServiceTest {
  private static final String TEST_PLUGIN_RUNTIME_1 = "groovy";
  private static final String TEST_PLUGIN_RUNTIME_2 = "python";
  private static final String TEST_PLUGIN_RUNTIME_3 = "kotlin";

  @InjectMocks private PluginLanguageService service;
  @Mock private PluginRuntimeRegistry pluginRuntimeRegistry;
  @Mock private PluginRuntimeProvider pluginRuntime1;
  @Mock private PluginRuntimeProvider pluginRuntime2;
  @Mock private PluginRuntimeProvider pluginRuntime3;

  private List<PluginRuntimeProvider> pluginRuntimeList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(pluginRuntime1.getName()).thenReturn(TEST_PLUGIN_RUNTIME_1);
    pluginRuntimeList.add(pluginRuntime1);
    Mockito.when(pluginRuntime1.getName()).thenReturn(TEST_PLUGIN_RUNTIME_2);
    pluginRuntimeList.add(pluginRuntime2);
    Mockito.when(pluginRuntime1.getName()).thenReturn(TEST_PLUGIN_RUNTIME_3);
    pluginRuntimeList.add(pluginRuntime3);
  }

  @Test
  public void testGetPluginLanguageList() {
    Mockito.when(pluginRuntimeRegistry.getPluginRuntimeList()).thenReturn(pluginRuntimeList);

    final List<PluginLanguage> result = service.getPluginLanguageList();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(pluginRuntimeList.size(), result.size());
    assertTrue(
        result.stream()
            .map(PluginLanguage::getName)
            .allMatch(
                name ->
                    pluginRuntimeList.stream()
                        .map(PluginRuntimeProvider::getName)
                        .collect(Collectors.toList())
                        .contains(name)));

    Mockito.verify(pluginRuntimeRegistry, Mockito.times(1)).getPluginRuntimeList();
  }
}
