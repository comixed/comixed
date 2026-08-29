/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.service.library;

import static junit.framework.TestCase.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.library.OrganizingComic;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.comixedproject.repositories.library.OrganizingComicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OrganizingComicServiceTest {
  private static final int TEST_MAX_COMICS = 23;
  private static final long TEST_COMIC_DETAIL_ID = 129L;
  private static final long TEST_COMIC_BOOK_ID = 320L;
  private static final String TEST_UPDATED_FILENAME =
      "/Users/comixed_reader/Documents/comics/library/example.cbz";
  private static final long TEST_COMIC_COUNT = 27394L;

  @InjectMocks private OrganizingComicService service;
  @Mock private OrganizingComicRepository organizingComicRepository;
  @Mock private ComicBookRepository comicBookRepository;
  @Mock private ComicDetailRepository comicDetailRepository;
  @Mock private OrganizingComic comic;

  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;

  private List<OrganizingComic> organizingComicList = new ArrayList<>();

  @BeforeEach
  public void setUp() {
    when(organizingComicRepository.loadComics(pageRequestArgumentCaptor.capture()))
        .thenReturn(organizingComicList);
    when(comic.getComicBookId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(comic.getComicDetailId()).thenReturn(TEST_COMIC_DETAIL_ID);
    when(comic.getUpdatedFilename()).thenReturn(TEST_UPDATED_FILENAME);
  }

  @Test
  void loadComics() {
    final List<OrganizingComic> result = service.loadComics(TEST_MAX_COMICS);

    assertNotNull(result);
    assertSame(organizingComicList, result);

    final PageRequest pageRequest = pageRequestArgumentCaptor.getValue();
    assertEquals(0, pageRequest.getPageNumber());
    assertEquals(TEST_MAX_COMICS, pageRequest.getPageSize());

    verify(organizingComicRepository, times(1)).loadComics(pageRequest);
  }

  @Test
  void saveComic() {
    service.saveComic(comic);

    verify(comicDetailRepository, times(1))
        .updateFilename(TEST_COMIC_DETAIL_ID, TEST_UPDATED_FILENAME);
    verify(comicDetailRepository, times(1)).clearOrganizingFlag(TEST_COMIC_BOOK_ID);
  }

  @Test
  void saveComic_filenameNotUpdated() {
    when(comic.getUpdatedFilename()).thenReturn(null);

    service.saveComic(comic);

    verify(comicDetailRepository, never()).updateFilename(anyLong(), anyString());
    verify(comicDetailRepository, times(1)).clearOrganizingFlag(TEST_COMIC_BOOK_ID);
  }

  @Test
  void loadComicCount() {
    when(organizingComicRepository.count()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.loadComicCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(organizingComicRepository, times(1)).count();
  }
}
