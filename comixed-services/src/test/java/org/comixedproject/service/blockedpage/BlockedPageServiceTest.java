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

import java.util.List;
import org.comixedproject.model.blockedpage.BlockedPage;
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

  @InjectMocks private BlockedPageService service;
  @Mock private BlockedPageRepository blockedPageRepository;
  @Mock private List<BlockedPage> blockedPageList;
  @Mock private List<String> blockedPageHashList;
  @Mock private BlockedPage blockedPage;
  @Mock private BlockedPage blockedPageRecord;

  @Captor private ArgumentCaptor<BlockedPage> blockedPageArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(blockedPage.getLabel()).thenReturn(TEST_PAGE_LABEL);
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
}
