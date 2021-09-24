/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Page;
import org.comixedproject.repositories.comicbooks.PageRepository;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageServiceTest {
  private static final long TEST_PAGE_ID = 129;
  private static final long TEST_COMIC_ID = 1002L;
  private static final int TEST_PAGE_INDEX = 7;
  private static final int TEST_DELETED_PAGE_COUNT = 17;
  private static final String TEST_PAGE_TYPE_NAME = "front-cover";
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF";

  @InjectMocks private PageService pageService;
  @Mock private PageRepository pageRepository;
  @Mock private ComicService comicService;
  @Mock private Page page;
  @Mock private Page savedPage;
  @Mock private Comic comic;

  private List<Page> pageList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(page.getComic()).thenReturn(comic);
  }

  @Test(expected = ComicException.class)
  public void testGetPageInComicByIndexForMissingComic() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      pageService.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetPageInComicByIndexOutOfBounds() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX - 1);

    final Page result = pageService.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNull(result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
  }

  @Test
  public void testGetImageInComicByIndex() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX + 1);
    Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);

    Page result = pageService.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
    Mockito.verify(comic, Mockito.times(1)).getPage(TEST_PAGE_INDEX);
  }

  @Test
  public void testDeletePageInvalidId() {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    assertNull(pageService.deletePage(TEST_PAGE_ID));

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testDeletePageAlreadyMarkedAsDeleted() {
    Mockito.when(pageRepository.findById(TEST_PAGE_ID)).thenReturn(Optional.of(page));
    Mockito.when(page.isDeleted()).thenReturn(true);
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.deletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).isDeleted();
  }

  @Test
  public void testDeletePage() {
    Mockito.when(pageRepository.findById(TEST_PAGE_ID)).thenReturn(Optional.of(page));
    Mockito.when(page.isDeleted()).thenReturn(false);
    Mockito.doNothing().when(page).setDeleted(Mockito.anyBoolean());
    Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.deletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).isDeleted();
    Mockito.verify(page, Mockito.times(1)).setDeleted(true);
    Mockito.verify(pageRepository, Mockito.times(1)).save(page);
  }

  @Test
  public void testUndeletePageForNonexistentPage() {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    assertNull(pageService.undeletePage(TEST_PAGE_ID));

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testUndeletePageForUnmarkedPage() {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));
    Mockito.when(page.isDeleted()).thenReturn(false);
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.undeletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).isDeleted();
  }

  @Test
  public void testUndeletePage() {
    Mockito.when(pageRepository.findById(TEST_PAGE_ID)).thenReturn(Optional.of(page));
    Mockito.when(page.isDeleted()).thenReturn(true);
    Mockito.doNothing().when(page).setDeleted(Mockito.anyBoolean());
    Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.undeletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).isDeleted();
    Mockito.verify(page, Mockito.times(1)).setDeleted(false);
    Mockito.verify(pageRepository, Mockito.times(1)).save(page);
  }

  @Test
  public void testGetPageByIdWithInvalidId() {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    assertNull(pageService.getForId(TEST_PAGE_ID));

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testGetPageById() {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));

    final Page result = pageService.getForId(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testGetAllPagesForComicWithIndexNonexistentComic() {
    Mockito.when(pageRepository.findAllByComicId(Mockito.anyLong()))
        .thenReturn(new ArrayList<Page>());

    final List<Page> result = pageService.getAllPagesForComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(pageRepository, Mockito.times(1)).findAllByComicId(TEST_COMIC_ID);
  }

  @Test
  public void testAllGetPagesForComic() {
    Mockito.when(pageRepository.findAllByComicId(Mockito.anyLong())).thenReturn(pageList);

    List<Page> result = pageService.getAllPagesForComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(pageList, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findAllByComicId(TEST_COMIC_ID);
  }

  @Test
  public void testDeletePagesByHash() {
    Mockito.when(
            pageRepository.updateDeleteOnAllWithHash(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(TEST_DELETED_PAGE_COUNT);

    int result = pageService.deleteAllWithHash(TEST_PAGE_HASH);

    Assert.assertEquals(TEST_DELETED_PAGE_COUNT, result);

    Mockito.verify(pageRepository, Mockito.times(1))
        .updateDeleteOnAllWithHash(TEST_PAGE_HASH, true);
  }

  @Test
  public void testUndeletePagesByHash() {
    Mockito.when(
            pageRepository.updateDeleteOnAllWithHash(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(TEST_DELETED_PAGE_COUNT);

    int result = pageService.undeleteAllWithHash(TEST_PAGE_HASH);

    Assert.assertEquals(TEST_DELETED_PAGE_COUNT, result);

    Mockito.verify(pageRepository, Mockito.times(1))
        .updateDeleteOnAllWithHash(TEST_PAGE_HASH, false);
  }

  @Test
  public void testSetDeletedStateMark() {
    List<Page> pages = new ArrayList<>();
    pages.add(page);

    Mockito.when(pageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pages);
    Mockito.doNothing().when(page).setDeleted(Mockito.anyBoolean());
    Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

    List<String> hashes = new ArrayList<>();
    hashes.add(TEST_PAGE_HASH);

    pageService.setDeletedState(hashes, true);

    Mockito.verify(pageRepository, Mockito.times(1)).getPagesWithHash(TEST_PAGE_HASH);
    Mockito.verify(page, Mockito.times(1)).setDeleted(true);
    Mockito.verify(pageRepository, Mockito.times(1)).save(page);
  }

  @Test
  public void testSetDeletedStateUnmark() {
    List<Page> pages = new ArrayList<>();
    pages.add(page);

    Mockito.when(pageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pages);
    Mockito.doNothing().when(page).setDeleted(Mockito.anyBoolean());
    Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

    List<String> hashes = new ArrayList<>();
    hashes.add(TEST_PAGE_HASH);

    pageService.setDeletedState(hashes, false);

    Mockito.verify(pageRepository, Mockito.times(1)).getPagesWithHash(TEST_PAGE_HASH);
    Mockito.verify(page, Mockito.times(1)).setDeleted(false);
    Mockito.verify(pageRepository, Mockito.times(1)).save(page);
  }

  @Test
  public void testSave() {
    Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(savedPage);

    final Page result = pageService.save(page);

    assertNotNull(result);
    assertSame(savedPage, result);

    Mockito.verify(pageRepository, Mockito.times(1)).save(page);
  }
}
