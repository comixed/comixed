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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.IOException;
import java.util.*;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageType;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.comicbooks.ComicBookStateAdaptor;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicPageServiceTest {
  private static final long TEST_PAGE_ID = 129L;
  private static final long TEST_COMIC_ID = 1002L;
  private static final int TEST_PAGE_INDEX = 7;
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF";
  private static final long TEST_MAX_ENTRIES = 10L;
  private static final String TEST_PAGE_FILENAME = "src/test/resources/example.jpg";
  private static final int TEST_BATCH_SIZE = 129;
  private static final String TEST_COMIC_FILENAME = "example-comic.cbz";
  private static final long TEST_PAGE_COUNT = 273L;

  @InjectMocks private ComicPageService service;
  @Mock private ComicPageRepository comicPageRepository;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBookStateAdaptor comicBookStateAdaptor;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private ComicPage page;
  @Mock private ComicPage savedPage;
  @Mock private ComicPage pageRecord;
  @Mock private ComicBook comicBook;
  @Mock private List<String> duplicateHashList;

  @Captor private ArgumentCaptor<Pageable> argumentCaptorPageable;

  private List<ComicPage> pageList = new ArrayList<>();
  private List<Long> idList = new ArrayList<>();
  private byte[] pageContent;
  private Set<String> hashSet = new HashSet<>();
  private List<String> hashList = new ArrayList<>();

  @BeforeEach
  void setUp() throws IOException {
    when(page.getComicBook()).thenReturn(comicBook);
    pageContent = FileUtils.readFileToByteArray(new File(TEST_PAGE_FILENAME));
  }

  @Test
  void getOneForHash() {
    pageList.add(page);

    when(comicPageRepository.findByHash(Mockito.anyString())).thenReturn(pageList);

    final ComicPage result = service.getOneForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(page, result);

    verify(comicPageRepository).findByHash(TEST_PAGE_HASH);
  }

  @Test
  void getOneForHash_noneFound() {
    when(comicPageRepository.findByHash(Mockito.anyString())).thenReturn(Collections.emptyList());

    final ComicPage result = service.getOneForHash(TEST_PAGE_HASH);

    assertNull(result);

    verify(comicPageRepository).findByHash(TEST_PAGE_HASH);
  }

  @Test
  void getPageInComicByIndex_noSuchComic() throws ComicBookException {
    when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    assertThrows(
        ComicBookException.class,
        () -> service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX));
  }

  @Test
  void getPageInComicByIndex_indexOutOfBounds() throws ComicBookException {
    when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    when(comicBook.getPageCount()).thenReturn(TEST_PAGE_INDEX - 1);

    final ComicPage result = service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNull(result);

    verify(comicBookService).getComic(TEST_COMIC_ID);
    verify(comicBook, Mockito.atLeast(1)).getPageCount();
  }

  @Test
  void getPageInComicByIndex() throws ComicBookException {
    final List<ComicPage> pages = new ArrayList<>();
    for (int index = 0; index < TEST_PAGE_INDEX * 2; index++) {
      pages.add(page);
    }

    when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    when(comicBook.getPageCount()).thenReturn(TEST_PAGE_INDEX + 1);
    when(comicBook.getPages()).thenReturn(pages);

    ComicPage result = service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(page, result);

    verify(comicBookService).getComic(TEST_COMIC_ID);
    verify(comicBook, Mockito.atLeast(1)).getPageCount();
    verify(comicBook).getPages();
  }

  @Test
  void getForId_noSuchPage() {
    when(comicPageRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    assertThrows(ComicPageException.class, () -> service.getForId(TEST_PAGE_ID));
  }

  @Test
  void getForId() throws ComicPageException {
    when(comicPageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));

    final ComicPage result = service.getForId(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(page, result);

    verify(comicPageRepository).findById(TEST_PAGE_ID);
  }

  @Test
  void save() throws ComicPageException {
    when(page.getComicPageId()).thenReturn(TEST_PAGE_ID);
    when(comicPageRepository.saveAndFlush(Mockito.any(ComicPage.class))).thenReturn(pageRecord);

    final ComicPage result = service.save(page);

    assertNotNull(result);
    assertSame(pageRecord, result);

    verify(comicPageRepository).saveAndFlush(page);
  }

  @Test
  void getUnmarkedWithHash_forDeletion() {
    when(comicPageRepository.getNotDeletedWithHash(Mockito.anyString())).thenReturn(pageList);

    final List<ComicPage> result = service.getUnmarkedWithHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(pageList, result);

    verify(comicPageRepository).getNotDeletedWithHash(TEST_PAGE_HASH);
  }

  @Test
  void getMarkedWithHash_forDeletion() {
    when(comicPageRepository.getDeletedWithHash(Mockito.anyString())).thenReturn(pageList);

    final List<ComicPage> result = service.getMarkedWithHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(pageList, result);

    verify(comicPageRepository).getDeletedWithHash(TEST_PAGE_HASH);
  }

  @Test
  void updatePageDeletion_forDeletion() {
    idList.add(TEST_PAGE_ID);

    when(comicPageRepository.getById(Mockito.anyLong())).thenReturn(page);

    service.updatePageDeletion(idList, true);

    verify(page).setPageType(ComicPageType.DELETED);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicPageMarkedForRemoval);
  }

  @Test
  void updatePageDeletion_notForDeletion() {
    idList.add(TEST_PAGE_ID);

    when(comicPageRepository.getById(Mockito.anyLong())).thenReturn(page);

    service.updatePageDeletion(idList, false);

    verify(page).setPageType(ComicPageType.STORY);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicPageUnmarkedForRemoval);
  }

  @Test
  void loadPagesNeedingCacheEntries() {
    when(comicPageRepository.findPagesNeedingCacheEntries(argumentCaptorPageable.capture()))
        .thenReturn(pageList);

    final List<ComicPage> result = service.loadPagesNeedingCacheEntries((int) TEST_MAX_ENTRIES);

    assertNotNull(result);
    assertSame(pageList, result);

    final Pageable pageable = argumentCaptorPageable.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_MAX_ENTRIES, pageable.getPageSize());
    assertEquals(0, pageable.getPageNumber());

    verify(comicPageRepository).findPagesNeedingCacheEntries(pageable);
  }

  @Test
  void loadPagesNeedingCacheEntriesCount() {
    when(comicPageRepository.findPagesNeedingCacheEntriesCount()).thenReturn(TEST_PAGE_COUNT);

    final long result = service.findPagesNeedingCacheEntriesCount();

    assertEquals(TEST_PAGE_COUNT, result);

    verify(comicPageRepository).findPagesNeedingCacheEntriesCount();
  }

  @Test
  void markPagesAsHavingCacheEntry() {
    service.markPagesAsHavingCacheEntry(TEST_PAGE_HASH);

    verify(comicPageRepository).markPagesAsAddedToImageCache(TEST_PAGE_HASH);
  }

  @Test
  void findAllCoverPageHashes() {
    when(comicPageRepository.findAllCoverPageHashes()).thenReturn(hashSet);

    final Set<String> result = service.findAllCoverPageHashes();

    assertNotNull(result);
    assertSame(hashSet, result);

    verify(comicPageRepository).findAllCoverPageHashes();
  }

  @Test
  void markCoverPagesToHaveCacheEntryCreated() {
    service.markCoverPagesToHaveCacheEntryCreated(TEST_PAGE_HASH);

    verify(comicPageRepository).markCoverPagesToHaveCacheEntryCreated(TEST_PAGE_HASH);
  }

  @Test
  void updatePageContent_noImageContent() {
    final byte[] content = "Invalid image content".getBytes();
    when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PAGE_HASH);
    when(comicPageRepository.save(Mockito.any(ComicPage.class))).thenReturn(savedPage);

    final ComicPage result = service.updatePageContent(page, content);

    assertNotNull(result);
    assertSame(savedPage, result);

    verify(genericUtilitiesAdaptor).createHash(content);
    verify(page).setHash(TEST_PAGE_HASH);
    verify(comicPageRepository).save(page);
  }

  @Test
  void updatePageContent() {
    when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PAGE_HASH);
    when(comicPageRepository.save(Mockito.any(ComicPage.class))).thenReturn(savedPage);

    final ComicPage result = service.updatePageContent(page, pageContent);

    assertNotNull(result);
    assertSame(savedPage, result);

    verify(genericUtilitiesAdaptor).createHash(pageContent);
    verify(page).setHash(TEST_PAGE_HASH);
    verify(comicPageRepository).save(page);
  }

  @Test
  void getCount() {
    when(comicPageRepository.count()).thenReturn(TEST_MAX_ENTRIES);

    final long result = service.getCount();

    assertEquals(TEST_MAX_ENTRIES, result);

    verify(comicPageRepository).count();
  }

  @Test
  void getUnmarkedWithBlockedHash() {
    when(comicPageRepository.getUnmarkedWithBlockedHash(argumentCaptorPageable.capture()))
        .thenReturn(pageList);

    final List<ComicPage> result = service.getUnmarkedWithBlockedHash(TEST_BATCH_SIZE);

    assertNotNull(result);
    assertSame(pageList, result);

    final Pageable pageable = argumentCaptorPageable.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_BATCH_SIZE, pageable.getPageSize());

    verify(comicPageRepository).getUnmarkedWithBlockedHash(pageable);
  }

  @Test
  void getUnmarkedWithBlockedHashCount() {
    when(comicPageRepository.getUnmarkedWithBlockedHashCount()).thenReturn(TEST_MAX_ENTRIES);

    final long result = service.getUnmarkedWithBlockedHashCount();

    assertEquals(TEST_MAX_ENTRIES, result);

    verify(comicPageRepository).getUnmarkedWithBlockedHashCount();
  }

  @Test
  void markPagesWithHashForDeletion() {
    pageList.add(page);
    hashList.add(TEST_PAGE_HASH);

    when(comicPageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pageList);

    service.markPagesWithHashForDeletion(hashList);

    verify(page).setPageType(ComicPageType.DELETED);
    verify(comicPageRepository).saveAndFlush(page);
  }

  @Test
  void unmarkPagesWithHashForDeletion() {
    pageList.add(page);
    hashList.add(TEST_PAGE_HASH);

    when(comicPageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pageList);

    service.unmarkPagesWithHashForDeletion(hashList);

    verify(page).setPageType(ComicPageType.STORY);
    verify(comicPageRepository).saveAndFlush(page);
  }

  @Test
  void getPageIdForComicBookCover_noComicBookFound() {
    when(comicPageRepository.getPageIdForComicBookCover(Mockito.anyLong())).thenReturn(null);

    final Long result = service.getPageIdForComicBookCover(TEST_COMIC_ID);

    assertNull(result);

    verify(comicPageRepository).getPageIdForComicBookCover(TEST_COMIC_ID);
  }

  @Test
  void getPageIdForComicBookCover() {
    when(comicPageRepository.getPageIdForComicBookCover(Mockito.anyLong()))
        .thenReturn(TEST_PAGE_ID);

    final Long result = service.getPageIdForComicBookCover(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_ID, result.longValue());

    verify(comicPageRepository).getPageIdForComicBookCover(TEST_COMIC_ID);
  }

  @Test
  void getComicFilenameForPage_noComicBookFound() {
    when(comicPageRepository.getComicFilenameForPage(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicPageException.class, () -> service.getComicFilenameForPage(TEST_PAGE_ID));
  }

  @Test
  void getComicFilenameForPage() throws ComicPageException {
    when(comicPageRepository.getComicFilenameForPage(Mockito.anyLong()))
        .thenReturn(TEST_COMIC_FILENAME);

    final String result = service.getComicFilenameForPage(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_COMIC_FILENAME, result);

    verify(comicPageRepository).getComicFilenameForPage(TEST_PAGE_ID);
  }

  @Test
  void getPageFilename_pageNotFound() {
    when(comicPageRepository.getPageFilename(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicPageException.class, () -> service.getPageFilename(TEST_PAGE_ID));
  }

  @Test
  void getPageFilename() throws ComicPageException {
    when(comicPageRepository.getPageFilename(Mockito.anyLong())).thenReturn(TEST_PAGE_FILENAME);

    final String result = service.getPageFilename(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_FILENAME, result);

    verify(comicPageRepository).getPageFilename(TEST_PAGE_ID);
  }

  @Test
  void getHashForPage_noSuchPage() {
    when(comicPageRepository.getHashForPage(Mockito.anyLong())).thenReturn(null);

    final String result = service.getHashForPage(TEST_PAGE_ID);

    assertNull(result);

    verify(comicPageRepository).getHashForPage(TEST_PAGE_ID);
  }

  @Test
  void getHashForPage() {
    when(comicPageRepository.getHashForPage(Mockito.anyLong())).thenReturn(TEST_PAGE_HASH);

    final String result = service.getHashForPage(TEST_PAGE_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, result);

    verify(comicPageRepository).getHashForPage(TEST_PAGE_ID);
  }

  @Test
  void getAllDuplicateHashes() {
    when(comicPageRepository.getAllDuplicateHashes()).thenReturn(duplicateHashList);

    final List<String> result = service.getAllDuplicateHashes();

    assertNotNull(result);
    assertSame(duplicateHashList, result);

    verify(comicPageRepository).getAllDuplicateHashes();
  }
}
