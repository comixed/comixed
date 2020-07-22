package org.comixedproject.plugins.model;

import static junit.framework.TestCase.assertEquals;

import java.util.HashMap;
import java.util.Map;
import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.interpreters.PluginInterpreter;
import org.comixedproject.plugins.interpreters.PluginInterpreterLoader;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PluginTest {
  @InjectMocks private Plugin plugin;
  @Mock private PluginInterpreterLoader interpreterLoader;
  @Mock private PluginInterpreter pluginInterpreter;

  private static final String TEST_PLUGIN_NAME = "test-plugin";
  private static final String TEST_PLUGIN_LANGUAGE = "python";
  private static final String TEST_PLUGIN_VERSION = "1.2.3";
  private static final String TEST_AUTHOR_NAME = "Jim Lahey";
  private static final String TEST_DESCRIPTION = "My awesome testing plugin";

  private static final Map<String, byte[]> TEST_PLUGIN_ENTRIES = new HashMap<>();

  static {
    TEST_PLUGIN_ENTRIES.put(
        Plugin.MANIFEST_FILENAME,
        ("# this is a test manifest\n"
                + (Plugin.PLUGIN_LANGUAGE + ":" + TEST_PLUGIN_LANGUAGE + "\n")
                + (Plugin.PLUGIN_NAME + ": " + TEST_PLUGIN_NAME + "\n")
                + (Plugin.PLUGIN_VERSION + ":" + TEST_PLUGIN_VERSION + "\n")
                + (Plugin.PLUGIN_AUTHOR + ":" + TEST_AUTHOR_NAME + "\n")
                + (Plugin.PLUGIN_DESCRIPTION + ":" + TEST_DESCRIPTION + "\n"))
            .getBytes());
  }

  @Test
  public void testSetEntries() throws PluginException {
    Mockito.when(interpreterLoader.hasLanguage(Mockito.anyString())).thenReturn(true);

    plugin.setEntries(TEST_PLUGIN_ENTRIES);

    assertEquals(TEST_PLUGIN_LANGUAGE, plugin.getLanguage());
    assertEquals(TEST_PLUGIN_NAME, plugin.getName());
    assertEquals(TEST_PLUGIN_VERSION, plugin.getVersion());
    assertEquals(TEST_AUTHOR_NAME, plugin.getAuthor());
    assertEquals(TEST_DESCRIPTION, plugin.getDescription());

    Mockito.verify(interpreterLoader, Mockito.times(1)).hasLanguage(TEST_PLUGIN_LANGUAGE);
  }
}
