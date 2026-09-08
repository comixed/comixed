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
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicpages.DeletedPage;
import org.comixedproject.model.comicpages.DeletedPageAndComic;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.library.DisplayableComicService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DeletedPageServiceTest {
  private static final String TEST_PAGE_HASH = "OICU812";
  private static final Long TEST_COMIC_ID = 41706L;

  @InjectMocks private DeletedPageService service;
  @Mock private ComicPageRepository comicPageRepository;
  @Mock private DeletedPageAndComic deletedPage;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private DisplayableComic comic;

  private List<DeletedPageAndComic> deletedPageList = new ArrayList<>();

  @Test
  void loadAll_comicPageException() throws ComicBookException {
    deletedPageList.add(deletedPage);
    when(comicPageRepository.loadAllDeletedPages()).thenReturn(deletedPageList);
    when(deletedPage.getHash()).thenReturn(TEST_PAGE_HASH);
    when(deletedPage.getComicId()).thenReturn(TEST_COMIC_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenThrow(ComicBookException.class);

    assertThrows(ComicPageException.class, () -> service.loadAll());

    verify(comicPageRepository).loadAllDeletedPages();
    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
  }

  @Test
  void loadAll() throws ComicPageException, ComicBookException {
    deletedPageList.add(deletedPage);
    when(comicPageRepository.loadAllDeletedPages()).thenReturn(deletedPageList);
    when(deletedPage.getHash()).thenReturn(TEST_PAGE_HASH);
    when(deletedPage.getComicId()).thenReturn(TEST_COMIC_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(comic);

    final List<DeletedPage> result = service.loadAll();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.get(0).getComics().contains(comic));

    verify(comicPageRepository).loadAllDeletedPages();
    verify(displayableComicService, times(deletedPageList.size())).getForComicBookId(TEST_COMIC_ID);
  }
}
