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

package org.comixedproject.service.page;

import static junit.framework.TestCase.*;

import java.util.List;
import org.comixedproject.model.net.library.LoadBlockedPageHashesResponse;
import org.comixedproject.model.page.BlockedPageHash;
import org.comixedproject.repositories.page.BlockedPageHashRepository;
import org.comixedproject.service.comic.ComicService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class BlockedPageHashServiceTest {
  private static final String TEST_HASH = "0123456789ABCDEF";
  private static final long TEST_TIMESTAMP = System.currentTimeMillis();

  @InjectMocks private BlockedPageHashService service;
  @Mock private BlockedPageHashRepository blockedPageHashRepository;
  @Mock private BlockedPageHash blockedPageHashRecord;
  @Mock private ComicService comicService;
  @Mock private List<String> hashList;

  @Captor private ArgumentCaptor<BlockedPageHash> blockedPageHashArgumentCaptor;

  @Test
  public void testAddHash() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(blockedPageHashRepository.save(blockedPageHashArgumentCaptor.capture()))
        .thenReturn(blockedPageHashRecord);
    Mockito.doNothing().when(comicService).updateComicsWithPageHash(Mockito.anyString());

    service.addHash(TEST_HASH);

    assertNotNull(blockedPageHashArgumentCaptor.getValue());
    assertEquals(TEST_HASH, blockedPageHashArgumentCaptor.getValue().getHash());

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.times(1))
        .save(blockedPageHashArgumentCaptor.getValue());
    Mockito.verify(comicService, Mockito.times(1)).updateComicsWithPageHash(TEST_HASH);
  }

  @Test
  public void testAddHashAlreadyBlocked() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageHashRecord);

    service.addHash(TEST_HASH);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.never()).save(Mockito.any());
    Mockito.verify(comicService, Mockito.never()).updateComicsWithPageHash(Mockito.anyString());
  }

  @Test
  public void testDeleteHashNotFound() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString())).thenReturn(null);

    service.deleteHash(TEST_HASH);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.never()).delete(Mockito.any());
    Mockito.verify(comicService, Mockito.never()).updateComicsWithPageHash(Mockito.anyString());
  }

  @Test
  public void testDeleteHash() {
    Mockito.when(blockedPageHashRepository.findByHash(Mockito.anyString()))
        .thenReturn(blockedPageHashRecord);
    Mockito.doNothing().when(blockedPageHashRepository).delete(Mockito.any());
    Mockito.doNothing().when(comicService).updateComicsWithPageHash(Mockito.anyString());

    service.deleteHash(TEST_HASH);

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(TEST_HASH);
    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).delete(blockedPageHashRecord);
    Mockito.verify(comicService, Mockito.times(1)).updateComicsWithPageHash(TEST_HASH);
  }

  @Test
  public void testGetAllHashes() {
    Mockito.when(blockedPageHashRepository.getAllHashes()).thenReturn(hashList);

    final LoadBlockedPageHashesResponse result = service.getAllHashesSince(TEST_TIMESTAMP);

    assertNotNull(result);
    assertSame(hashList, result.getHashes());

    Mockito.verify(blockedPageHashRepository, Mockito.times(1)).getAllHashes();
  }
}
