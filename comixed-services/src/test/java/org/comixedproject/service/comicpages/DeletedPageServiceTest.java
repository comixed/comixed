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

package org.comixedproject.service.comicpages;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static org.mockito.Mockito.mock;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.DeletedPage;
import org.comixedproject.model.comicpages.DeletedPageAndComic;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DeletedPageServiceTest {
  @InjectMocks private DeletedPageService service;
  @Mock private ComicPageRepository comicPageRepository;

  private List<DeletedPageAndComic> deletedPageList = new ArrayList<>();

  @BeforeEach
  public void setUp() {
    for (int index = 0; index < 100; index++) {
      final DeletedPageAndComic deletedPageAndComic = mock(DeletedPageAndComic.class);
      Mockito.when(deletedPageAndComic.getHash()).thenReturn(String.valueOf(index % 7));
      final ComicBook comicBook = mock(ComicBook.class);
      Mockito.when(comicBook.getId()).thenReturn((long) index);
      final ComicDetail comicDetail = mock(ComicDetail.class);
      Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
      Mockito.when(deletedPageAndComic.getComicBook()).thenReturn(comicBook);
      deletedPageList.add(deletedPageAndComic);
    }
  }

  @Test
  void loadAll() {
    Mockito.when(comicPageRepository.loadAllDeletedPages()).thenReturn(deletedPageList);

    final List<DeletedPage> result = service.loadAll();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertFalse(result.stream().anyMatch(deletedPage -> deletedPage.getComics().isEmpty()));

    Mockito.verify(comicPageRepository, Mockito.times(1)).loadAllDeletedPages();
  }
}
