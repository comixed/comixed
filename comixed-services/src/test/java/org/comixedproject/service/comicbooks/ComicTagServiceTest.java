/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project.
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

package org.comixedproject.service.comicbooks;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.repositories.comicbooks.ComicTagRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComicTagServiceTest {
  private static final long TEST_COMIC_BOOK_ID = 717L;

  @InjectMocks private ComicTagService service;
  @Mock private ComicTagRepository comicTagRepository;

  private List<ComicTag> comicTagList = new ArrayList<>();

  @Test
  void getTagsForComicBook() {
    Mockito.when(comicTagRepository.getForComicBook(Mockito.anyLong())).thenReturn(comicTagList);

    final List<ComicTag> result = service.getTagsForComicBook(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(comicTagList, result);

    Mockito.verify(comicTagRepository, Mockito.times(1)).getForComicBook(TEST_COMIC_BOOK_ID);
  }
}
