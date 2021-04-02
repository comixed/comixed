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

package org.comixedproject.plugins.interpreters;

import static junit.framework.TestCase.*;

import java.util.Map;
import org.comixedproject.plugins.model.PluginInterpreterEntry;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.ApplicationContext;

@RunWith(MockitoJUnitRunner.class)
public class PluginInterpreterLoaderTest {
  private static final String TEST_LANGUAGE = "language";
  private static final String TEST_INTERPRETER_BEAN = "languageInterpreterBean";

  @InjectMocks private PluginInterpreterLoader pluginInterpreterLoader;
  @Mock private ApplicationContext context;
  @Mock private PluginInterpreterEntry pluginInterpreter;
  @Mock private Map<String, String> interpreters;
  @Mock private PluginInterpreter languageBean;

  @Before
  public void setUp() {
    pluginInterpreterLoader.interpreters = interpreters;
    pluginInterpreterLoader.getRuntime().add(pluginInterpreter);
    Mockito.when(pluginInterpreter.getLanguage()).thenReturn(TEST_LANGUAGE);
    Mockito.when(pluginInterpreter.getInterpreter()).thenReturn(TEST_INTERPRETER_BEAN);
    Mockito.when(context.isPrototype(Mockito.anyString())).thenReturn(true);
  }

  @Test
  public void testAfterPropertiesSetEntryIsINvalid() throws Exception {
    Mockito.when(pluginInterpreter.isValid()).thenReturn(false);

    pluginInterpreterLoader.afterPropertiesSet();

    Mockito.verify(interpreters, Mockito.times(1)).clear();
    Mockito.verify(interpreters, Mockito.never()).put(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testAfterPropertiesSetAlreadyHasLanguage() throws Exception {
    Mockito.when(pluginInterpreter.isValid()).thenReturn(true);
    Mockito.when(interpreters.containsKey(Mockito.anyString())).thenReturn(true);

    pluginInterpreterLoader.afterPropertiesSet();

    Mockito.verify(interpreters, Mockito.times(1)).clear();
    Mockito.verify(interpreters, Mockito.times(1)).containsKey(TEST_LANGUAGE);
    Mockito.verify(interpreters, Mockito.never()).put(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testAfterPropertiesSetNoSuchInterpreter() throws Exception {
    Mockito.when(pluginInterpreter.isValid()).thenReturn(true);
    Mockito.when(pluginInterpreter.getLanguage()).thenReturn(TEST_LANGUAGE);
    Mockito.when(interpreters.containsKey(Mockito.anyString())).thenReturn(false);
    Mockito.when(context.containsBean(Mockito.anyString())).thenReturn(false);

    pluginInterpreterLoader.afterPropertiesSet();

    Mockito.verify(interpreters, Mockito.times(1)).clear();
    Mockito.verify(interpreters, Mockito.times(1)).containsKey(TEST_LANGUAGE);
    Mockito.verify(context, Mockito.times(1)).containsBean(TEST_INTERPRETER_BEAN);
    Mockito.verify(interpreters, Mockito.never()).put(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testAfterPropertiesSetInterpreterIsNotAPrototype() throws Exception {
    Mockito.when(pluginInterpreter.isValid()).thenReturn(true);
    Mockito.when(pluginInterpreter.getLanguage()).thenReturn(TEST_LANGUAGE);
    Mockito.when(interpreters.containsKey(Mockito.anyString())).thenReturn(false);
    Mockito.when(context.containsBean(Mockito.anyString())).thenReturn(true);
    Mockito.when(context.isPrototype(Mockito.anyString())).thenReturn(false);

    pluginInterpreterLoader.afterPropertiesSet();

    Mockito.verify(interpreters, Mockito.times(1)).clear();
    Mockito.verify(interpreters, Mockito.times(1)).containsKey(TEST_LANGUAGE);
    Mockito.verify(context, Mockito.times(1)).containsBean(TEST_INTERPRETER_BEAN);
    Mockito.verify(context, Mockito.times(1)).isPrototype(TEST_INTERPRETER_BEAN);
    Mockito.verify(interpreters, Mockito.never()).put(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    Mockito.when(pluginInterpreter.isValid()).thenReturn(true);
    Mockito.when(pluginInterpreter.getLanguage()).thenReturn(TEST_LANGUAGE);
    Mockito.when(interpreters.containsKey(Mockito.anyString())).thenReturn(false);
    Mockito.when(context.containsBean(Mockito.anyString())).thenReturn(true);
    Mockito.when(context.isPrototype(Mockito.anyString())).thenReturn(true);

    pluginInterpreterLoader.afterPropertiesSet();

    Mockito.verify(interpreters, Mockito.times(1)).clear();
    Mockito.verify(interpreters, Mockito.times(1)).containsKey(TEST_LANGUAGE);
    Mockito.verify(context, Mockito.times(1)).containsBean(TEST_INTERPRETER_BEAN);
    Mockito.verify(context, Mockito.times(1)).isPrototype(TEST_INTERPRETER_BEAN);
    Mockito.verify(interpreters, Mockito.times(1)).put(TEST_LANGUAGE, TEST_INTERPRETER_BEAN);
  }

  @Test
  public void hasLanguageDoesNot() {
    Mockito.when(interpreters.containsKey(Mockito.anyString())).thenReturn(false);

    final boolean result = pluginInterpreterLoader.hasLanguage(TEST_LANGUAGE);

    assertFalse(result);

    Mockito.verify(interpreters, Mockito.times(1)).containsKey(TEST_LANGUAGE);
  }

  @Test
  public void testHasLanguage() {
    Mockito.when(interpreters.containsKey(Mockito.anyString())).thenReturn(true);

    final boolean result = pluginInterpreterLoader.hasLanguage(TEST_LANGUAGE);

    assertTrue(result);

    Mockito.verify(interpreters, Mockito.times(1)).containsKey(TEST_LANGUAGE);
  }

  @Test
  public void testGetLanguage() {
    Mockito.when(context.getBean(Mockito.anyString())).thenReturn(languageBean);

    final PluginInterpreter result = pluginInterpreterLoader.getLanguage(TEST_LANGUAGE);

    assertNotNull(result);
    assertSame(languageBean, result);

    Mockito.verify(context, Mockito.times(1)).getBean(TEST_LANGUAGE);
  }
}
