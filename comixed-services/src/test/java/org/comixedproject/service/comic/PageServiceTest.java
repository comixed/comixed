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

package org.comixedproject.service.comic;

import static junit.framework.TestCase.assertEquals;
import static org.junit.Assert.*;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.comic.PageType;
import org.comixedproject.model.library.BlockedPageHash;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.comic.PageRepository;
import org.comixedproject.repositories.comic.PageTypeRepository;
import org.comixedproject.repositories.library.BlockedPageHashRepository;
import org.comixedproject.utils.FileTypeIdentifier;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageServiceTest {
  private static final long TEST_PAGE_TYPE_ID = 717;
  private static final long TEST_PAGE_ID = 129;
  private static final String BLOCKED_PAGE_HASH_VALUE = "0123456789ABCDEF";
  private static final List<String> BLOCKED_HASH_LIST = new ArrayList<>();
  private static final List<Page> TEST_DUPLICATE_PAGES = new ArrayList<>();
  private static final long TEST_COMIC_ID = 1002L;
  private static final int TEST_PAGE_INDEX = 7;
  private static final int TEST_DELETED_PAGE_COUNT = 17;
  private static final String TEST_PAGE_HASH = "12345";
  private static final String TEST_PAGE_TYPE_NAME = "front-cover";

  static {
    BLOCKED_HASH_LIST.add("12345");
    BLOCKED_HASH_LIST.add("23456");
    BLOCKED_HASH_LIST.add("34567");
  }

  @InjectMocks private PageService pageService;
  @Mock private PageRepository pageRepository;
  @Mock private PageTypeRepository pageTypeRepository;
  @Mock private BlockedPageHashRepository blockedPageHashRepository;
  @Mock private ComicRepository comicRepository;
  @Mock private ComicService comicService;
  @Mock private PageType pageType;
  @Mock private Page page;
  @Mock private Page savedPage;
  @Mock private BlockedPageHash blockedPageHash;
  @Captor private ArgumentCaptor<BlockedPageHash> blockedPageHashCaptor;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<InputStream> inputStreamCaptor;
  @Mock private FileTypeIdentifier fileTypeIdentifier;
  @Mock private List<Page> pageList;
  @Mock private List<PageType> pageTypeList;

  private String[] blockedPageHashList = new String[] {BLOCKED_PAGE_HASH_VALUE};

  @Test(expected = PageException.class)
  public void testSetPageTypeForNonexistentPage() throws PageException {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      pageService.updateTypeForPage(TEST_PAGE_ID, TEST_PAGE_TYPE_NAME);
    } finally {
      Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    }
  }

  @Test(expected = PageException.class)
  public void testSetPageTypeWithNonexistentType() throws PageException {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));
    Mockito.when(pageTypeRepository.findByName(Mockito.anyString())).thenReturn(null);

    try {
      pageService.updateTypeForPage(TEST_PAGE_ID, TEST_PAGE_TYPE_NAME);
    } finally {
      Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
      Mockito.verify(pageTypeRepository, Mockito.times(1)).findByName(TEST_PAGE_TYPE_NAME);
    }
  }

  @Test
  public void testSetPageType() throws PageException {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));
    Mockito.when(pageTypeRepository.findByName(Mockito.anyString())).thenReturn(pageType);
    Mockito.doNothing().when(page).setPageType(pageType);
    Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

    final Page result = pageService.updateTypeForPage(TEST_PAGE_ID, TEST_PAGE_TYPE_NAME);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(pageTypeRepository, Mockito.times(1)).findByName(TEST_PAGE_TYPE_NAME);
    Mockito.verify(page, Mockito.times(1)).setPageType(pageType);
    Mockito.verify(pageRepository, Mockito.times(1)).save(page);
  }

  @Test
  public void testAddBlockedPageHash() throws PageException {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageHashRepository.save(blockedPageHashCaptor.capture()))
        .thenReturn(blockedPageHash);
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.addBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);
    assertNotNull(result);
    assertSame(comic, result);
    assertEquals(TEST_PAGE_HASH, blockedPageHashCaptor.getValue().getHash());

    Mockito.verify(blockedPageHashRepository, Mockito.times(1))
        .save(blockedPageHashCaptor.getValue());
    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).getComic();
  }

  @Test
  public void testAddBlockedPageHashForExistingHash() throws PageException {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageHash);
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.addBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);
    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).getComic();
  }

  @Test
  public void testRemoveBlockedPageHash() throws PageException {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageHash);
    Mockito.doNothing().when(blockedPageHashRepository).delete(Mockito.any(BlockedPageHash.class));
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.removeBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);
    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).delete(blockedPageHash);
    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).getComic();
  }

  @Test
  public void testRemoveNonexistingBlockedPageHash() throws PageException {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));
    Mockito.when(page.getComic()).thenReturn(comic);

    final Comic result = pageService.removeBlockedPageHash(TEST_PAGE_ID, TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    Mockito.verify(page, Mockito.times(1)).getComic();
  }

  @Test
  public void testGetBlockedPageHashes() {
    Mockito.when(blockedPageHashRepository.getAllHashes()).thenReturn(BLOCKED_HASH_LIST);

    List<String> result = pageService.getAllBlockedPageHashes();

    assertSame(BLOCKED_HASH_LIST, result);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).getAllHashes();
  }

  @Test
  public void testGetDuplicatePages() {
    Mockito.when(pageRepository.getDuplicatePages()).thenReturn(TEST_DUPLICATE_PAGES);

    List<DuplicatePage> result = pageService.getDuplicatePages();

    assertNotNull(result);
    //        assertFalse(result.isEmpty());

    Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePages();
  }

  @Test
  public void testGetPageInComicByIndexForMissingComic() {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    Page result = pageService.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNull(result);

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
  }

  @Test
  public void testGetPageInComicByIndexOutOfBounds() {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(comic));
    Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX - 1);

    Page result = pageService.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNull(result);

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
  }

  @Test
  public void testGetImageInComicByIndex() {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(comic));
    Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX + 1);
    Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);

    Page result = pageService.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
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

    assertNull(pageService.findById(TEST_PAGE_ID));

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testGetPageById() {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));

    final Page result = pageService.findById(TEST_PAGE_ID);

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
  public void testGetPageTypes() {
    Mockito.when(pageTypeRepository.findPageTypes()).thenReturn(pageTypeList);

    assertSame(pageTypeList, pageService.getPageTypes());

    Mockito.verify(pageTypeRepository, Mockito.times(1)).findPageTypes();
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
  public void testSetBlockingStateToTrueNotAlreadyBlocked() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageHashRepository.save(blockedPageHashCaptor.capture()))
        .thenReturn(blockedPageHash);
    Mockito.when(pageRepository.getDuplicatePages()).thenReturn(TEST_DUPLICATE_PAGES);

    List<String> hashes = new ArrayList<>();
    hashes.add(TEST_PAGE_HASH);

    final List<DuplicatePage> result = pageService.setBlockingState(hashes, true);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, blockedPageHashCaptor.getValue().getHash());

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.times(1))
        .save(blockedPageHashCaptor.getValue());
    Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePages();
  }

  @Test
  public void testSetBlockingStateToTrueAlreadyBlocked() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageHash);
    Mockito.when(pageRepository.getDuplicatePages()).thenReturn(TEST_DUPLICATE_PAGES);

    List<String> hashes = new ArrayList<>();
    hashes.add(TEST_PAGE_HASH);

    final List<DuplicatePage> result = pageService.setBlockingState(hashes, true);

    assertNotNull(result);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePages();
  }

  @Test
  public void testSetBlockingStateToFalseNotAlreadyBlocked() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(pageRepository.getDuplicatePages()).thenReturn(TEST_DUPLICATE_PAGES);

    List<String> hashes = new ArrayList<>();
    hashes.add(TEST_PAGE_HASH);

    final List<DuplicatePage> result = pageService.setBlockingState(hashes, false);

    assertNotNull(result);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePages();
  }

  @Test
  public void testSetBlockingStateToFalseAlreadyBlocked() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageHash);
    Mockito.doNothing().when(blockedPageHashRepository).delete(Mockito.any());
    Mockito.when(pageRepository.getDuplicatePages()).thenReturn(TEST_DUPLICATE_PAGES);

    List<String> hashes = new ArrayList<>();
    hashes.add(TEST_PAGE_HASH);

    final List<DuplicatePage> result = pageService.setBlockingState(hashes, false);

    assertNotNull(result);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).delete(blockedPageHash);
    Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePages();
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
