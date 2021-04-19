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

package org.comixedproject.service.blockedpage;

import static junit.framework.TestCase.*;
import static org.comixedproject.service.blockedpage.BlockedPageService.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.csv.CsvRowDecoder;
import org.comixedproject.adaptors.csv.CsvRowEncoder;
import org.comixedproject.model.blockedpage.BlockedPage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.repositories.blockedpage.BlockedPageRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class BlockedPageServiceTest {
  private static final String TEST_PAGE_HASH = "The page hash";
  private static final String TEST_PAGE_LABEL = "The blocked page label";
  private static final String TEST_PAGE_SNAPSHOT = "The blocked page content encoded";
  private static final byte[] TEST_CSV_ROW = "The CSV file".getBytes();
  private static final List<String> TEST_DECODED_ROW = new ArrayList<>();

  @InjectMocks private BlockedPageService service;
  @Mock private BlockedPageRepository blockedPageRepository;
  @Mock private CsvAdaptor csvAdaptor;
  @Mock private List<String> blockedPageHashList;
  @Mock private BlockedPage blockedPage;
  @Mock private BlockedPage blockedPageRecord;
  @Mock private List<BlockedPage> blockedPageList;
  @Mock private InputStream inputStream;

  @Captor private ArgumentCaptor<BlockedPage> blockedPageArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowEncoder> csvRowHandlerArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowDecoder> csvRowDecoderArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(blockedPage.getLabel()).thenReturn(TEST_PAGE_LABEL);
    Mockito.when(blockedPage.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(blockedPage.getSnapshot()).thenReturn(TEST_PAGE_SNAPSHOT);
    TEST_DECODED_ROW.add(TEST_PAGE_LABEL);
    TEST_DECODED_ROW.add(TEST_PAGE_HASH);
    TEST_DECODED_ROW.add(TEST_PAGE_SNAPSHOT);
  }

  @Test
  public void testGetAll() {
    Mockito.when(blockedPageRepository.getAll()).thenReturn(blockedPageList);

    final List<BlockedPage> result = service.getAll();

    assertNotNull(result);
    assertSame(blockedPageList, result);

    Mockito.verify(blockedPageRepository, Mockito.times(1)).getAll();
  }

  @Test(expected = BlockedPageException.class)
  public void testGetByHashNoSuchHash() throws BlockedPageException {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString())).thenReturn(null);

    try {
      service.getByHash(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testGetByHash() throws BlockedPageException {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageRecord);

    final BlockedPage result = service.getByHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(blockedPageRecord, result);

    Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testGetHashes() {
    Mockito.when(blockedPageRepository.getHashes()).thenReturn(blockedPageHashList);

    final List<String> result = service.getHashes();

    assertNotNull(result);
    assertSame(blockedPageHashList, result);

    Mockito.verify(blockedPageRepository, Mockito.times(1)).getHashes();
  }

  @Test
  public void testBlockPageEntryAlreadyExists() {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageRecord);

    final BlockedPage result = service.blockHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(blockedPageRecord, result);

    Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageRecord, Mockito.never()).setLabel(Mockito.anyString());
    Mockito.verify(blockedPageRepository, Mockito.never()).save(Mockito.any(BlockedPage.class));
  }

  @Test
  public void testBlockPage() {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageRepository.save(blockedPageArgumentCaptor.capture()))
        .thenReturn(blockedPageRecord);

    final BlockedPage result = service.blockHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(blockedPageRecord, result);

    assertNotNull(blockedPageArgumentCaptor.getValue());
    assertEquals(TEST_PAGE_HASH, blockedPageArgumentCaptor.getValue().getHash());

    Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageRepository, Mockito.times(1))
        .save(blockedPageArgumentCaptor.getValue());
  }

  @Test(expected = BlockedPageException.class)
  public void testUpdateBlockedPageNotBlocked() throws BlockedPageException {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString())).thenReturn(null);

    try {
      service.updateBlockedPage(TEST_PAGE_HASH, blockedPage);
    } finally {
      Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testUpdateBlockedPage() throws BlockedPageException {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageRecord);
    Mockito.when(blockedPageRepository.save(Mockito.any(BlockedPage.class)))
        .thenReturn(blockedPageRecord);

    final BlockedPage result = service.updateBlockedPage(TEST_PAGE_HASH, blockedPage);

    assertNotNull(result);
    assertSame(blockedPageRecord, result);

    Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageRecord, Mockito.times(1)).setLabel(TEST_PAGE_LABEL);
    Mockito.verify(blockedPageRepository, Mockito.times(1)).save(blockedPageRecord);
  }

  @Test(expected = BlockedPageException.class)
  public void testUnblockedPageNotBlocked() throws BlockedPageException {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString())).thenReturn(null);

    try {
      service.unblockPage(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testUnblockPage() throws BlockedPageException {
    Mockito.when(blockedPageRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageRecord);
    Mockito.doNothing().when(blockedPageRepository).delete(Mockito.any(BlockedPage.class));

    service.unblockPage(TEST_PAGE_HASH);

    Mockito.verify(blockedPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(blockedPageRepository, Mockito.times(1)).delete(blockedPageRecord);
  }

  @Test
  public void testCreateFile() throws IOException {
    Mockito.when(blockedPageRepository.findAll()).thenReturn(blockedPageList);
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
        csvRowHandlerArgumentCaptor.getAllValues().get(0).createRow(1, blockedPage);
    assertEquals(TEST_PAGE_LABEL, row[0]);
    assertEquals(TEST_PAGE_HASH, row[1]);
    assertEquals(TEST_PAGE_SNAPSHOT, row[2]);

    assertEquals(blockedPageList.size() + 1, csvRowHandlerArgumentCaptor.getAllValues().size());

    Mockito.verify(blockedPageRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testUploadFile() throws IOException {
    Mockito.when(blockedPageRepository.findAll()).thenReturn(blockedPageList);
    Mockito.doNothing()
        .when(csvAdaptor)
        .decodeRecords(
            Mockito.any(InputStream.class), Mockito.any(), csvRowDecoderArgumentCaptor.capture());
    Mockito.when(blockedPageRepository.save(blockedPageArgumentCaptor.capture()))
        .thenReturn(blockedPageRecord);

    final List<BlockedPage> result = service.uploadFile(inputStream);

    assertNotNull(result);
    assertSame(blockedPageList, result);
    assertNotNull(csvRowDecoderArgumentCaptor.getValue());

    csvRowDecoderArgumentCaptor.getValue().processRow(1, TEST_DECODED_ROW);
    assertNotNull(blockedPageArgumentCaptor.getValue());
    assertEquals(TEST_PAGE_LABEL, blockedPageArgumentCaptor.getValue().getLabel());
    assertEquals(TEST_PAGE_HASH, blockedPageArgumentCaptor.getValue().getHash());
    assertEquals(TEST_PAGE_SNAPSHOT, blockedPageArgumentCaptor.getValue().getSnapshot());

    Mockito.verify(blockedPageRepository, Mockito.times(1)).findAll();
    Mockito.verify(csvAdaptor, Mockito.times(1))
        .decodeRecords(
            inputStream,
            new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER},
            csvRowDecoderArgumentCaptor.getValue());
    Mockito.verify(blockedPageRepository, Mockito.times(1))
        .save(blockedPageArgumentCaptor.getValue());
  }
}
