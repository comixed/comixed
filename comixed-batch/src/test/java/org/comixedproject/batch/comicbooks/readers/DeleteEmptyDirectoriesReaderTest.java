/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.batch.comicbooks.readers;

import static junit.framework.TestCase.*;

import java.io.File;
import java.util.ArrayList;
import org.comixedproject.service.admin.ConfigurationService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DeleteEmptyDirectoriesReaderTest {
  private static final String TEST_ROOT_DIRECTORY = "src/test";

  @InjectMocks private DeleteEmptyDirectoriesReader reader;
  @Mock private ConfigurationService configurationService;

  @Test
  public void testReadNoDirectoryDefined() throws Exception {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString())).thenReturn("");

    final File result = reader.read();

    assertNull(result);

    Mockito.verify(configurationService, Mockito.times(1))
        .getOptionValue(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY);
  }

  @Test
  public void testReadConfigurationDisabled() throws Exception {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString()))
        .thenReturn(TEST_ROOT_DIRECTORY);
    Mockito.when(configurationService.getOptionValue(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(Boolean.FALSE.toString());

    final File result = reader.read();

    assertNull(result);

    Mockito.verify(configurationService, Mockito.times(1))
        .getOptionValue(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY);
    Mockito.verify(configurationService, Mockito.times(1))
        .getOptionValue(
            ConfigurationService.CFG_LIBRARY_DELETE_EMPTY_DIRECTORIES, Boolean.FALSE.toString());
  }

  @Test
  public void testReadOptionEnabled() throws Exception {
    Mockito.when(configurationService.getOptionValue(Mockito.anyString()))
        .thenReturn(TEST_ROOT_DIRECTORY);
    Mockito.when(configurationService.getOptionValue(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(Boolean.TRUE.toString());

    reader.directories = null;

    final File result = reader.read();

    assertNotNull(result);

    assertNotNull(reader.directories);
    assertFalse(reader.directories.isEmpty());
    assertTrue(reader.directories.stream().allMatch(directory -> directory.isDirectory()));

    Mockito.verify(configurationService, Mockito.times(1))
        .getOptionValue(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY);
    Mockito.verify(configurationService, Mockito.times(1))
        .getOptionValue(
            ConfigurationService.CFG_LIBRARY_DELETE_EMPTY_DIRECTORIES, Boolean.FALSE.toString());
  }

  @Test
  public void testReadNoMoreEntries() throws Exception {
    reader.directories = new ArrayList<>();

    final File result = reader.read();

    assertNull(result);
    assertNull(reader.directories);
  }
}
