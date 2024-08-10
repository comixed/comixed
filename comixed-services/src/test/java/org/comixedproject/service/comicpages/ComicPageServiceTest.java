/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.service.comicpages;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.util.*;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.comicpages.ComicPageEvent;
import org.comixedproject.state.comicpages.ComicPageStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicPageServiceTest {
  private static final long TEST_PAGE_ID = 129L;
  private static final long TEST_COMIC_ID = 1002L;
  private static final int TEST_PAGE_INDEX = 7;
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF";
  private static final long TEST_MAX_ENTRIES = 10L;
  private static final String TEST_PAGE_FILENAME = "src/test/resources/example.jpg";
  private static final int TEST_BATCH_SIZE = 129;
  private static final String TEST_COMIC_FILENAME = "example-comic.cbz";

  @InjectMocks private ComicPageService service;
  @Mock private ComicPageRepository comicPageRepository;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicPageStateHandler comicPageStateHandler;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private ComicPage page;
  @Mock private ComicPage savedPage;
  @Mock private ComicPage pageRecord;
  @Mock private ComicBook comicBook;

  @Captor private ArgumentCaptor<Pageable> argumentCaptorPageable;

  private List<ComicPage> pageList = new ArrayList<>();
  private List<Long> idList = new ArrayList<>();
  private byte[] pageContent;
  private Set<String> hashSet = new HashSet<>();
  private List<String> hashList = new ArrayList<>();

  @Before
  public void setUp() throws IOException {
    pageContent = FileUtils.readFileToByteArray(new File(TEST_PAGE_FILENAME));
  }

  @Test
  public void testGetOneForHash() {
    pageList.add(page);

    Mockito.when(comicPageRepository.findByHash(Mockito.anyString())).thenReturn(pageList);

    final ComicPage result = service.getOneForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testGetOneForHash_noneFound() {
    Mockito.when(comicPageRepository.findByHash(Mockito.anyString()))
        .thenReturn(Collections.emptyList());

    final ComicPage result = service.getOneForHash(TEST_PAGE_HASH);

    assertNull(result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test(expected = ComicBookException.class)
  public void testGetPageInComicByIndex_noSuchComic() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetPageInComicByIndex_indexOutOfBounds() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.getPageCount()).thenReturn(TEST_PAGE_INDEX - 1);

    final ComicPage result = service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBook, Mockito.atLeast(1)).getPageCount();
  }

  @Test
  public void testGetImageInComicByIndex() throws ComicBookException {
    final List<ComicPage> pages = new ArrayList<>();
    for (int index = 0; index < TEST_PAGE_INDEX * 2; index++) {
      pages.add(page);
    }

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.getPageCount()).thenReturn(TEST_PAGE_INDEX + 1);
    Mockito.when(comicBook.getPages()).thenReturn(pages);

    ComicPage result = service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBook, Mockito.atLeast(1)).getPageCount();
    Mockito.verify(comicBook, Mockito.times(1)).getPages();
  }

  @Test(expected = ComicPageException.class)
  public void testGetPageById_noSuchPage() throws ComicPageException {
    Mockito.when(comicPageRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      service.getForId(TEST_PAGE_ID);
    } finally {
      Mockito.verify(comicPageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    }
  }

  @Test
  public void testGetPageById() throws ComicPageException {
    Mockito.when(comicPageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));

    final ComicPage result = service.getForId(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testSave() throws ComicPageException {
    Mockito.when(page.getId()).thenReturn(TEST_PAGE_ID);
    Mockito.when(comicPageRepository.saveAndFlush(Mockito.any(ComicPage.class)))
        .thenReturn(pageRecord);

    final ComicPage result = service.save(page);

    assertNotNull(result);
    assertSame(pageRecord, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).saveAndFlush(page);
  }

  @Test
  public void testGetUnamrkedWithHash_forDeletion() {
    Mockito.when(
            comicPageRepository.findByHashAndPageState(
                Mockito.anyString(), Mockito.any(ComicPageState.class)))
        .thenReturn(pageList);

    final List<ComicPage> result = service.getUnmarkedWithHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(pageList, result);

    Mockito.verify(comicPageRepository, Mockito.times(1))
        .findByHashAndPageState(TEST_PAGE_HASH, ComicPageState.STABLE);
  }

  @Test
  public void testGetMarkedWithHash_forDeletion() {
    Mockito.when(
            comicPageRepository.findByHashAndPageState(
                Mockito.anyString(), Mockito.any(ComicPageState.class)))
        .thenReturn(pageList);

    final List<ComicPage> result = service.getMarkedWithHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(pageList, result);

    Mockito.verify(comicPageRepository, Mockito.times(1))
        .findByHashAndPageState(TEST_PAGE_HASH, ComicPageState.DELETED);
  }

  @Test
  public void testUpdatePageDeletion_forDeletion() {
    idList.add(TEST_PAGE_ID);

    Mockito.when(comicPageRepository.getById(Mockito.anyLong())).thenReturn(page);

    service.updatePageDeletion(idList, true);

    Mockito.verify(comicPageStateHandler, Mockito.times(idList.size()))
        .fireEvent(page, ComicPageEvent.markForDeletion);
  }

  @Test
  public void testUpdatePageDeletion_notForDeletion() {
    idList.add(TEST_PAGE_ID);

    Mockito.when(comicPageRepository.getById(Mockito.anyLong())).thenReturn(page);

    service.updatePageDeletion(idList, false);

    Mockito.verify(comicPageStateHandler, Mockito.times(idList.size()))
        .fireEvent(page, ComicPageEvent.unmarkForDeletion);
  }

  @Test
  public void testLoadPagesNeedingCacheEntries() {
    Mockito.when(comicPageRepository.findPagesNeedingCacheEntries(argumentCaptorPageable.capture()))
        .thenReturn(pageList);

    final List<ComicPage> result = service.loadPagesNeedingCacheEntries((int) TEST_MAX_ENTRIES);

    assertNotNull(result);
    assertSame(pageList, result);

    final Pageable pageable = argumentCaptorPageable.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_MAX_ENTRIES, pageable.getPageSize());
    assertEquals(0, pageable.getPageNumber());

    Mockito.verify(comicPageRepository, Mockito.times(1)).findPagesNeedingCacheEntries(pageable);
  }

  @Test
  public void testMarkPagesAsHavingCacheEntry() {
    service.markPagesAsHavingCacheEntry(TEST_PAGE_HASH);

    Mockito.verify(comicPageRepository, Mockito.times(1))
        .markPagesAsAddedToImageCache(TEST_PAGE_HASH);
  }

  @Test
  public void testFindAllCoverPageHashes() {
    Mockito.when(comicPageRepository.findAllCoverPageHashes()).thenReturn(hashSet);

    final Set<String> result = service.findAllCoverPageHashes();

    assertNotNull(result);
    assertSame(hashSet, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).findAllCoverPageHashes();
  }

  @Test
  public void testMarkCoverPagesToHaveCacheEntryCreated() {
    service.markCoverPagesToHaveCacheEntryCreated(TEST_PAGE_HASH);

    Mockito.verify(comicPageRepository, Mockito.times(1))
        .markCoverPagesToHaveCacheEntryCreated(TEST_PAGE_HASH);
  }

  @Test
  public void testUpdatePageContent_NoImageContent() {
    final byte[] content = "Invalid image content".getBytes();
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PAGE_HASH);
    Mockito.when(comicPageRepository.save(Mockito.any(ComicPage.class))).thenReturn(savedPage);

    final ComicPage result = service.updatePageContent(page, content);

    assertNotNull(result);
    assertSame(savedPage, result);

    Mockito.verify(genericUtilitiesAdaptor, Mockito.times(1)).createHash(content);
    Mockito.verify(page, Mockito.times(1)).setHash(TEST_PAGE_HASH);
    Mockito.verify(comicPageRepository, Mockito.times(1)).save(page);
  }

  @Test
  public void testUpdatePageContent() {
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PAGE_HASH);
    Mockito.when(comicPageRepository.save(Mockito.any(ComicPage.class))).thenReturn(savedPage);

    final ComicPage result = service.updatePageContent(page, pageContent);

    assertNotNull(result);
    assertSame(savedPage, result);

    Mockito.verify(genericUtilitiesAdaptor, Mockito.times(1)).createHash(pageContent);
    Mockito.verify(page, Mockito.times(1)).setHash(TEST_PAGE_HASH);
    Mockito.verify(comicPageRepository, Mockito.times(1)).save(page);
  }

  @Test
  public void testHasPagesWithoutHash_recordsFound() {
    Mockito.when(comicPageRepository.getPagesWithoutHashesCount()).thenReturn(TEST_MAX_ENTRIES);

    assertTrue(service.hasPagesWithoutHash());

    Mockito.verify(comicPageRepository, Mockito.times(1)).getPagesWithoutHashesCount();
  }

  @Test
  public void testHasPagesWithoutHash_noRecordsFound() {
    Mockito.when(comicPageRepository.getPagesWithoutHashesCount()).thenReturn(0L);

    assertFalse(service.hasPagesWithoutHash());

    Mockito.verify(comicPageRepository, Mockito.times(1)).getPagesWithoutHashesCount();
  }

  @Test
  public void testGetPagesWithoutHashesCount() {
    Mockito.when(comicPageRepository.getPagesWithoutHashesCount()).thenReturn(TEST_MAX_ENTRIES);

    final long result = service.getPagesWithoutHashCount();

    assertEquals(TEST_MAX_ENTRIES, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).getPagesWithoutHashesCount();
  }

  @Test
  public void testGetCount() {
    Mockito.when(comicPageRepository.count()).thenReturn(TEST_MAX_ENTRIES);

    final long result = service.getCount();

    assertEquals(TEST_MAX_ENTRIES, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).count();
  }

  @Test
  public void testGetUnmarkedWithBlockedHash() {
    Mockito.when(comicPageRepository.getUnmarkedWithBlockedHash(argumentCaptorPageable.capture()))
        .thenReturn(pageList);

    final List<ComicPage> result = service.getUnmarkedWithBlockedHash(TEST_BATCH_SIZE);

    assertNotNull(result);
    assertSame(pageList, result);

    final Pageable pageable = argumentCaptorPageable.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_BATCH_SIZE, pageable.getPageSize());

    Mockito.verify(comicPageRepository, Mockito.times(1)).getUnmarkedWithBlockedHash(pageable);
  }

  @Test
  public void testGetUnmarkedWithBlockedHashCount() {
    Mockito.when(comicPageRepository.getUnmarkedWithBlockedHashCount())
        .thenReturn(TEST_MAX_ENTRIES);

    final long result = service.getUnmarkedWithBlockedHashCount();

    assertEquals(TEST_MAX_ENTRIES, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).getUnmarkedWithBlockedHashCount();
  }

  @Test
  public void testMarkPagesWithHashForDeletion() {
    pageList.add(page);
    hashList.add(TEST_PAGE_HASH);

    Mockito.when(comicPageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pageList);

    service.markPagesWithHashForDeletion(hashList);

    Mockito.verify(comicPageStateHandler, Mockito.times(1))
        .fireEvent(page, ComicPageEvent.markForDeletion);
  }

  @Test
  public void testUnmarkPagesWithHashForDeletion() {
    pageList.add(page);
    hashList.add(TEST_PAGE_HASH);

    Mockito.when(comicPageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pageList);

    service.unmarkPagesWithHashForDeletion(hashList);

    Mockito.verify(comicPageStateHandler, Mockito.times(1))
        .fireEvent(page, ComicPageEvent.unmarkForDeletion);
  }

  @Test(expected = ComicPageException.class)
  public void testGetPageIdForComicBookCover_noComicBookFound() throws ComicPageException {
    Mockito.when(comicPageRepository.getPageIdForComicBookCover(Mockito.anyLong()))
        .thenReturn(null);

    try {
      service.getPageIdForComicBookCover(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicPageRepository, Mockito.times(1))
          .getPageIdForComicBookCover(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetPageIdForComicBookCover() throws ComicPageException {
    Mockito.when(comicPageRepository.getPageIdForComicBookCover(Mockito.anyLong()))
        .thenReturn(TEST_PAGE_ID);

    final Long result = service.getPageIdForComicBookCover(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_ID, result.longValue());

    Mockito.verify(comicPageRepository, Mockito.times(1)).getPageIdForComicBookCover(TEST_COMIC_ID);
  }

  @Test(expected = ComicPageException.class)
  public void testGetComicFilenameForPage_noComicBookFound() throws ComicPageException {
    Mockito.when(comicPageRepository.getComicFilenameForPage(Mockito.anyLong())).thenReturn(null);

    try {
      service.getComicFilenameForPage(TEST_PAGE_ID);
    } finally {
      Mockito.verify(comicPageRepository, Mockito.times(1)).getComicFilenameForPage(TEST_PAGE_ID);
    }
  }

  @Test
  public void testGetComicFilenameForPage() throws ComicPageException {
    Mockito.when(comicPageRepository.getComicFilenameForPage(Mockito.anyLong()))
        .thenReturn(TEST_COMIC_FILENAME);

    final String result = service.getComicFilenameForPage(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_COMIC_FILENAME, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).getComicFilenameForPage(TEST_PAGE_ID);
  }

  @Test(expected = ComicPageException.class)
  public void testGetPageFilename_pageNotFound() throws ComicPageException {
    Mockito.when(comicPageRepository.getPageFilename(Mockito.anyLong())).thenReturn(null);

    try {
      service.getPageFilename(TEST_PAGE_ID);
    } finally {
      Mockito.verify(comicPageRepository, Mockito.times(1)).getPageFilename(TEST_PAGE_ID);
    }
  }

  @Test
  public void testGetPageFilename() throws ComicPageException {
    Mockito.when(comicPageRepository.getPageFilename(Mockito.anyLong()))
        .thenReturn(TEST_PAGE_FILENAME);

    final String result = service.getPageFilename(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_FILENAME, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).getPageFilename(TEST_PAGE_ID);
  }

  @Test(expected = ComicPageException.class)
  public void testGetHashForPage_noSuchPage() throws ComicPageException {
    Mockito.when(comicPageRepository.getHashForPage(Mockito.anyLong())).thenReturn(null);

    try {
      service.getHashForPage(TEST_PAGE_ID);
    } finally {
      Mockito.verify(comicPageRepository, Mockito.times(1)).getHashForPage(TEST_PAGE_ID);
    }
  }

  @Test
  public void testGetHashForPage() throws ComicPageException {
    Mockito.when(comicPageRepository.getHashForPage(Mockito.anyLong())).thenReturn(TEST_PAGE_HASH);

    final String result = service.getHashForPage(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, result);

    Mockito.verify(comicPageRepository, Mockito.times(1)).getHashForPage(TEST_PAGE_ID);
  }
}
