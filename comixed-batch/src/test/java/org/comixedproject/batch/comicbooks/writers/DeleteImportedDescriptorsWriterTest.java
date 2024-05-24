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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.batch.comicbooks.writers;

import java.util.ArrayList;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.item.Chunk;

@RunWith(MockitoJUnitRunner.class)
public class DeleteImportedDescriptorsWriterTest {
  @InjectMocks private DeleteImportedDescriptorsWriter writer;
  @Mock private ComicFileService comicFileService;
  @Mock private ComicFileDescriptor comicFileDescriptor;

  private Chunk<ComicFileDescriptor> comicFileDescriptorList = new Chunk<>(new ArrayList<>());

  @Test
  public void testWrite() {
    for (int index = 0; index < 25; index++) comicFileDescriptorList.add(comicFileDescriptor);

    writer.write(comicFileDescriptorList);

    Mockito.verify(comicFileService, Mockito.times(comicFileDescriptorList.size()))
        .delete(comicFileDescriptor);
  }
}
