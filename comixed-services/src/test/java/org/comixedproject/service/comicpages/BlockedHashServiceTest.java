/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.service.comicpages;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static junit.framework.TestCase.assertTrue;
import static org.comixedproject.service.comicpages.BlockedHashService.PAGE_HASH_HEADER;
import static org.comixedproject.service.comicpages.BlockedHashService.PAGE_LABEL_HEADER;
import static org.comixedproject.service.comicpages.BlockedHashService.PAGE_SNAPSHOT_HEADER;
import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertThrows;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.csv.CsvRowDecoder;
import org.comixedproject.adaptors.csv.CsvRowEncoder;
import org.comixedproject.adaptors.encoders.DataEncoder;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicpages.PublishBlockedPageRemovalAction;
import org.comixedproject.messaging.comicpages.PublishBlockedPageUpdateAction;
import org.comixedproject.messaging.library.PublishDuplicatePageListUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.library.DuplicatePageUpdate;
import org.comixedproject.model.net.library.LoadDuplicatePageListResponse;
import org.comixedproject.repositories.comicpages.BlockedHashRepository;
import org.comixedproject.service.library.DuplicatePageException;
import org.comixedproject.service.library.DuplicatePageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BlockedHashServiceTest {
  private static final String TEST_PAGE_HASH = "The page hash";
  private static final String TEST_PAGE_LABEL = "The blocked page label";
  private static final String TEST_PAGE_THUMBNAIL = "The blocked page content encoded";
  private static final byte[] TEST_CSV_ROW = "The CSV file".getBytes();
  private static final List<String> TEST_DECODED_ROW = new ArrayList<>();
  private static final Integer TEST_PAGE_NUMBER = RandomUtils.nextInt(23);
  private static final byte[] TEST_PAGE_CONTENT = "This is the page content".getBytes();
  private static final String TEST_ENCODED_PAGE = "This is the encoded page.";
  private static final byte[] TEST_DECODED_PAGE = "This is the decoded page".getBytes();
  private static final long TEST_TOTAL_DUPLICATE_PAGES = 320L;

  @InjectMocks private BlockedHashService service;
  @Mock private DuplicatePageService duplicatePageService;
  @Mock private ComicPageService comicPageService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private BlockedHashRepository blockedHashRepository;
  @Mock private CsvAdaptor csvAdaptor;
  @Mock private PublishBlockedPageUpdateAction publishBlockedPageUpdateAction;
  @Mock private PublishBlockedPageRemovalAction publishBlockedPageRemovalAction;
  @Mock private PublishDuplicatePageListUpdateAction publishDuplicatePageListUpdateAction;
  @Mock private BlockedHash blockedHash;
  @Mock private BlockedHash blockedHashRecord;
  @Mock private BlockedHash savedBlockedHash;
  @Mock private List<BlockedHash> blockedHashList;
  @Mock private InputStream inputStream;
  @Mock private List<DuplicatePage> duplicatePageList;
  @Mock private ComicPage page;
  @Mock private ComicBook comicBook;
  @Mock private DataEncoder dataEncoder;
  @Mock private LoadDuplicatePageListResponse loadDuplicatePageListResponse;
  @Mock private DuplicatePageUpdate duplicatePageUpdate;
  @Mock private DuplicatePage savedDuplicatePage;

  @Captor private ArgumentCaptor<BlockedHash> blockedPageArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowEncoder> csvRowHandlerArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowDecoder> csvRowDecoderArgumentCaptor;
  @Captor private ArgumentCaptor<DuplicatePageUpdate> duplicatePageUpdateArgumentCaptor;

  private List<String> blockedPageHashList = new ArrayList<>();

  @BeforeEach
  public void setUp() throws AdaptorException, DuplicatePageException, PublishingException {
    Mockito.when(blockedHash.getLabel()).thenReturn(TEST_PAGE_LABEL);
    Mockito.when(blockedHash.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(blockedHash.getThumbnail()).thenReturn(TEST_PAGE_THUMBNAIL);
    TEST_DECODED_ROW.add(TEST_PAGE_LABEL);
    TEST_DECODED_ROW.add(TEST_PAGE_HASH);
    TEST_DECODED_ROW.add(TEST_PAGE_THUMBNAIL);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_NUMBER);
    Mockito.when(comicPageService.getOneForHash(Mockito.anyString())).thenReturn(page);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(dataEncoder.encode(Mockito.any(byte[].class))).thenReturn(TEST_ENCODED_PAGE);
    Mockito.when(dataEncoder.decode(Mockito.anyString())).thenReturn(TEST_DECODED_PAGE);
    Mockito.when(duplicatePageService.getForHash(Mockito.anyString()))
        .thenReturn(savedDuplicatePage);
    Mockito.when(duplicatePageService.getDuplicatePageCount())
        .thenReturn(TEST_TOTAL_DUPLICATE_PAGES);
    Mockito.doNothing()
        .when(publishDuplicatePageListUpdateAction)
        .publish(duplicatePageUpdateArgumentCaptor.capture());
  }

  @Test
  void getAll() {
    Mockito.when(blockedHashRepository.getAll()).thenReturn(blockedHashList);

    final List<BlockedHash> result = service.getAll();

    assertNotNull(result);
    assertSame(blockedHashList, result);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).getAll();
  }

  @Test
  void getByHash_noSuchHash() {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(null);

    assertThrows(BlockedHashException.class, () -> service.getByHash(TEST_PAGE_HASH));
  }

  @Test
  void getByHash() throws BlockedHashException {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);

    final BlockedHash result = service.getByHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(blockedHashRecord, result);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  void getHashes() {
    Mockito.when(blockedHashRepository.getHashes()).thenReturn(blockedPageHashList);

    final List<String> result = service.getHashes();

    assertNotNull(result);
    assertSame(blockedPageHashList, result);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).getHashes();
  }

  @Test
  void blockPages_entryAlreadyExists() {
    blockedPageHashList.add(TEST_PAGE_HASH);

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);

    service.blockPages(blockedPageHashList);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRepository, Mockito.times(1)).save(Mockito.any(BlockedHash.class));
  }

  @Test
  void blockPages_publishingException() throws PublishingException {
    blockedPageHashList.add(TEST_PAGE_HASH);

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedHashRepository.save(blockedPageArgumentCaptor.capture()))
        .thenReturn(blockedHashRecord);
    Mockito.doThrow(PublishingException.class)
        .when(publishBlockedPageUpdateAction)
        .publish(Mockito.any(BlockedHash.class));

    service.blockPages(blockedPageHashList);

    assertNotNull(blockedPageArgumentCaptor.getValue());
    assertEquals(TEST_PAGE_HASH, blockedPageArgumentCaptor.getValue().getHash());

    Mockito.verify(blockedHashRepository, Mockito.times(blockedPageHashList.size()))
        .findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRepository, Mockito.times(blockedPageHashList.size()))
        .save(blockedPageArgumentCaptor.getValue());
    Mockito.verify(publishBlockedPageUpdateAction, Mockito.times(blockedPageHashList.size()))
        .publish(blockedHashRecord);
    Mockito.verify(publishDuplicatePageListUpdateAction, Mockito.never()).publish(Mockito.any());
  }

  @Test
  void blockPages() throws PublishingException {
    blockedPageHashList.add(TEST_PAGE_HASH);

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedHashRepository.save(blockedPageArgumentCaptor.capture()))
        .thenReturn(blockedHashRecord);

    service.blockPages(blockedPageHashList);

    assertNotNull(blockedPageArgumentCaptor.getValue());
    assertEquals(TEST_PAGE_HASH, blockedPageArgumentCaptor.getValue().getHash());

    final DuplicatePageUpdate publishedDuplicatePageUpdate =
        duplicatePageUpdateArgumentCaptor.getValue();
    assertSame(savedDuplicatePage, publishedDuplicatePageUpdate.getPage());
    assertEquals(false, publishedDuplicatePageUpdate.isRemoved());
    assertEquals(TEST_TOTAL_DUPLICATE_PAGES, publishedDuplicatePageUpdate.getTotal());

    Mockito.verify(blockedHashRepository, Mockito.times(blockedPageHashList.size()))
        .findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRepository, Mockito.times(blockedPageHashList.size()))
        .save(blockedPageArgumentCaptor.getValue());
    Mockito.verify(publishDuplicatePageListUpdateAction, Mockito.times(blockedPageHashList.size()))
        .publish(publishedDuplicatePageUpdate);
  }

  @Test
  void updateBlockedPage_notBlocked() throws DuplicatePageException {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedHashRepository.save(blockedPageArgumentCaptor.capture()))
        .thenReturn(savedBlockedHash);

    final BlockedHash result = service.updateBlockedPage(TEST_PAGE_HASH, blockedHash);

    assertNotNull(result);
    assertSame(savedBlockedHash, result);

    final BlockedHash blockedPage = blockedPageArgumentCaptor.getValue();

    assertEquals(TEST_PAGE_HASH, blockedPage.getHash());

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRepository, Mockito.times(1)).save(blockedPage);
  }

  @Test
  void updateBlockedPage_publishingException() throws DuplicatePageException, PublishingException {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);
    Mockito.doThrow(PublishingException.class)
        .when(publishBlockedPageUpdateAction)
        .publish(Mockito.any(BlockedHash.class));
    Mockito.when(blockedHashRepository.save(Mockito.any(BlockedHash.class)))
        .thenReturn(savedBlockedHash);

    final BlockedHash result = service.updateBlockedPage(TEST_PAGE_HASH, blockedHash);

    assertNotNull(result);
    assertSame(savedBlockedHash, result);

    final DuplicatePageUpdate publishedDuplicatePageUpdate =
        duplicatePageUpdateArgumentCaptor.getValue();
    assertSame(savedDuplicatePage, publishedDuplicatePageUpdate.getPage());
    assertEquals(false, publishedDuplicatePageUpdate.isRemoved());
    assertEquals(TEST_TOTAL_DUPLICATE_PAGES, publishedDuplicatePageUpdate.getTotal());

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRepository, Mockito.times(1)).save(blockedHashRecord);
    Mockito.verify(publishBlockedPageUpdateAction, Mockito.times(1)).publish(savedBlockedHash);
    Mockito.verify(publishDuplicatePageListUpdateAction, Mockito.times(1))
        .publish(publishedDuplicatePageUpdate);
  }

  @Test
  void updateBlockedPage() throws DuplicatePageException, PublishingException {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);
    Mockito.when(blockedHashRepository.save(Mockito.any(BlockedHash.class)))
        .thenReturn(savedBlockedHash);

    final BlockedHash result = service.updateBlockedPage(TEST_PAGE_HASH, blockedHash);

    assertNotNull(result);
    assertSame(savedBlockedHash, result);

    final DuplicatePageUpdate publishedDuplicatePageUpdate =
        duplicatePageUpdateArgumentCaptor.getValue();
    assertSame(savedDuplicatePage, publishedDuplicatePageUpdate.getPage());
    assertEquals(false, publishedDuplicatePageUpdate.isRemoved());
    assertEquals(TEST_TOTAL_DUPLICATE_PAGES, publishedDuplicatePageUpdate.getTotal());

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRecord, Mockito.times(1)).setLabel(TEST_PAGE_LABEL);
    Mockito.verify(blockedHashRepository, Mockito.times(1)).save(blockedHashRecord);
    Mockito.verify(publishBlockedPageUpdateAction, Mockito.times(1)).publish(savedBlockedHash);
    Mockito.verify(publishDuplicatePageListUpdateAction, Mockito.times(1))
        .publish(publishedDuplicatePageUpdate);
  }

  @Test
  void unblockedPage_notBlocked() {
    blockedPageHashList.add(TEST_PAGE_HASH);

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(null);

    service.unblockPages(blockedPageHashList);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRepository, Mockito.never()).save(Mockito.any());
  }

  @Test
  void unblockedPages_publishingException() throws PublishingException {
    blockedPageHashList.add(TEST_PAGE_HASH);

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);
    Mockito.doThrow(PublishingException.class)
        .when(publishBlockedPageRemovalAction)
        .publish(Mockito.any(BlockedHash.class));

    service.unblockPages(blockedPageHashList);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(publishBlockedPageRemovalAction, Mockito.times(1)).publish(blockedHashRecord);
    Mockito.verify(publishDuplicatePageListUpdateAction, Mockito.never()).publish(Mockito.any());
  }

  @Test
  void unblockPages() throws PublishingException {
    blockedPageHashList.add(TEST_PAGE_HASH);

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);
    Mockito.doNothing().when(blockedHashRepository).delete(Mockito.any(BlockedHash.class));

    service.unblockPages(blockedPageHashList);

    final DuplicatePageUpdate publishedDuplicatePageUpdate =
        duplicatePageUpdateArgumentCaptor.getValue();
    assertSame(savedDuplicatePage, publishedDuplicatePageUpdate.getPage());
    assertEquals(true, publishedDuplicatePageUpdate.isRemoved());
    assertEquals(TEST_TOTAL_DUPLICATE_PAGES, publishedDuplicatePageUpdate.getTotal());

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedHashRepository, Mockito.times(1)).delete(blockedHashRecord);
    Mockito.verify(publishBlockedPageRemovalAction, Mockito.times(1)).publish(blockedHashRecord);
    Mockito.verify(publishDuplicatePageListUpdateAction, Mockito.times(1))
        .publish(publishedDuplicatePageUpdate);
  }

  @Test
  void createFile() throws IOException {
    Mockito.when(blockedHashRepository.findAll()).thenReturn(blockedHashList);
    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), csvRowHandlerArgumentCaptor.capture()))
        .thenReturn(TEST_CSV_ROW);

    final DownloadDocument result = service.createFile();

    assertNotNull(result);
    assertNotNull(result.getFilename());
    assertEquals("text/csv", result.getMediaType());
    assertEquals(TEST_CSV_ROW, result.getContent());

    final String[] headers = csvRowHandlerArgumentCaptor.getAllValues().get(0).createRow(0, null);
    assertEquals(PAGE_LABEL_HEADER, headers[0]);
    assertEquals(PAGE_HASH_HEADER, headers[1]);
    assertEquals(PAGE_SNAPSHOT_HEADER, headers[2]);

    final String[] row =
        csvRowHandlerArgumentCaptor.getAllValues().get(0).createRow(1, blockedHash);
    assertEquals(TEST_PAGE_LABEL, row[0]);
    assertEquals(TEST_PAGE_HASH, row[1]);
    assertEquals(TEST_PAGE_THUMBNAIL, row[2]);

    assertEquals(blockedHashList.size() + 1, csvRowHandlerArgumentCaptor.getAllValues().size());

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findAll();
  }

  @Test
  void uploadFile() throws IOException {
    Mockito.when(blockedHashRepository.findAll()).thenReturn(blockedHashList);
    Mockito.doNothing()
        .when(csvAdaptor)
        .decodeRecords(
            Mockito.any(InputStream.class), Mockito.any(), csvRowDecoderArgumentCaptor.capture());
    Mockito.when(blockedHashRepository.save(blockedPageArgumentCaptor.capture()))
        .thenReturn(blockedHashRecord);

    final List<BlockedHash> result = service.uploadFile(inputStream);

    assertNotNull(result);
    assertSame(blockedHashList, result);
    assertNotNull(csvRowDecoderArgumentCaptor.getValue());

    csvRowDecoderArgumentCaptor.getValue().processRow(1, TEST_DECODED_ROW);
    assertNotNull(blockedPageArgumentCaptor.getValue());
    assertEquals(TEST_PAGE_LABEL, blockedPageArgumentCaptor.getValue().getLabel());
    assertEquals(TEST_PAGE_HASH, blockedPageArgumentCaptor.getValue().getHash());
    assertEquals(TEST_PAGE_THUMBNAIL, blockedPageArgumentCaptor.getValue().getThumbnail());

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findAll();
    Mockito.verify(csvAdaptor, Mockito.times(1))
        .decodeRecords(
            inputStream,
            new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER},
            csvRowDecoderArgumentCaptor.getValue());
    Mockito.verify(blockedHashRepository, Mockito.times(1))
        .save(blockedPageArgumentCaptor.getValue());
  }

  @Test
  void deleteBlockedPages() throws PublishingException {
    final List<String> blockedPageHashes = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      blockedPageHashes.add(RandomStringUtils.random(32, true, true));
    }

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);
    Mockito.when(blockedHashRecord.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.doNothing().when(blockedHashRepository).delete(Mockito.any(BlockedHash.class));

    final List<String> result = service.deleteBlockedPages(blockedPageHashes);

    assertNotNull(result);
    assertEquals(blockedPageHashes.size(), result.size());
    result.forEach(hash -> assertEquals(TEST_PAGE_HASH, hash));

    blockedPageHashes.forEach(
        hash -> Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(hash));
    Mockito.verify(blockedHashRepository, Mockito.times(blockedPageHashes.size()))
        .delete(blockedHashRecord);
    Mockito.verify(publishBlockedPageRemovalAction, Mockito.times(blockedPageHashes.size()))
        .publish(blockedHashRecord);
  }

  @Test
  void deleteBlockedPages_publishingException() throws PublishingException {
    final List<String> blockedPageHashes = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      blockedPageHashes.add(RandomStringUtils.random(32, true, true));
    }

    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);
    Mockito.when(blockedHashRecord.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.doNothing().when(blockedHashRepository).delete(Mockito.any(BlockedHash.class));
    Mockito.doThrow(PublishingException.class)
        .when(publishBlockedPageRemovalAction)
        .publish(Mockito.any(BlockedHash.class));

    final List<String> result = service.deleteBlockedPages(blockedPageHashes);

    assertNotNull(result);
    assertEquals(blockedPageHashes.size(), result.size());
    result.forEach(hash -> assertEquals(TEST_PAGE_HASH, hash));

    blockedPageHashes.forEach(
        hash -> Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(hash));
    Mockito.verify(blockedHashRepository, Mockito.times(blockedPageHashes.size()))
        .delete(blockedHashRecord);
    Mockito.verify(publishBlockedPageRemovalAction, Mockito.times(blockedPageHashes.size()))
        .publish(blockedHashRecord);
  }

  @Test
  void isHashBlocked_whenFound() {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedHashRecord);

    final boolean result = service.isHashBlocked(TEST_PAGE_HASH);

    assertTrue(result);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  void isHashBlocked_whenNotFound() {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(null);

    final boolean result = service.isHashBlocked(TEST_PAGE_HASH);

    assertFalse(result);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  void GetThumbnail_notFound() {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(null);

    assertThrows(BlockedHashException.class, () -> service.getThumbnail(TEST_PAGE_HASH));
  }

  @Test
  void getThumbnail() throws BlockedHashException {
    Mockito.when(blockedHashRepository.findByHash(Mockito.anyString())).thenReturn(blockedHash);

    final byte[] result = service.getThumbnail(TEST_PAGE_HASH);

    assertNotNull(result);
    assertArrayEquals(TEST_DECODED_PAGE, result);

    Mockito.verify(blockedHashRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }
}
