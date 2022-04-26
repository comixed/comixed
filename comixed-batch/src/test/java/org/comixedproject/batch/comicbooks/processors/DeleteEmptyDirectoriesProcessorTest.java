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

package org.comixedproject.batch.comicbooks.processors;

import java.io.File;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DeleteEmptyDirectoriesProcessorTest {
  @InjectMocks private DeleteEmptyDirectoriesProcessor processor;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private File directory;

  private File[] emptyFileList = new File[] {};
  private File[] fileList = new File[] {new File("foo"), new File("bar")};

  @Test
  public void testProcess() throws Exception {
    Mockito.when(directory.listFiles()).thenReturn(emptyFileList);

    processor.process(directory);

    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteDirectory(directory);
  }

  @Test
  public void testProcessNotEmpty() throws Exception {
    Mockito.when(directory.listFiles()).thenReturn(fileList);

    processor.process(directory);

    Mockito.verify(fileAdaptor, Mockito.never()).deleteDirectory(directory);
  }
}
