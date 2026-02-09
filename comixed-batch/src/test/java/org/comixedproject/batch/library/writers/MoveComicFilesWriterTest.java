/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.batch.library.writers;

import java.util.ArrayList;
import org.comixedproject.model.library.OrganizingComic;
import org.comixedproject.service.library.OrganizingComicService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.infrastructure.item.Chunk;

@ExtendWith(MockitoExtension.class)
class MoveComicFilesWriterTest {
  @InjectMocks private MoveComicFilesWriter writer;
  @Mock private OrganizingComicService organizingComicService;
  @Mock private OrganizingComic organizingComic;

  private Chunk<OrganizingComic> organizingComics = new Chunk<>(new ArrayList<>());

  @Test
  void write() {
    for (int index = 0; index < 25; index++) organizingComics.add(organizingComic);

    writer.write(organizingComics);

    Mockito.verify(organizingComicService, Mockito.times(organizingComics.size()))
        .saveComic(organizingComic);
  }
}
