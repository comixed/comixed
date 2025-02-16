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

package org.comixedproject.rest.comicpages;

import static junit.framework.TestCase.assertSame;
import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.blockedpage.DeleteBlockedPagesRequest;
import org.comixedproject.model.net.blockedpage.MarkPageWithHashRequest;
import org.comixedproject.model.net.blockedpage.UnmarkPageWithHashRequest;
import org.comixedproject.model.net.comicpages.SetBlockedPageRequest;
import org.comixedproject.service.comicpages.BlockedHashException;
import org.comixedproject.service.comicpages.BlockedHashService;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.library.DuplicatePageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BlockedHashControllerTest {
  private static final String TEST_PAGE_HASH = "0123456789ABCDEF0123456789ABCDEF";
  private static final byte[] TEST_PAGE_CONTENT = "The page content".getBytes();

  @InjectMocks private BlockedHashController controller;
  @Mock private BlockedHashService blockedHashService;
  @Mock private ComicPageService comicPageService;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private SelectedHashManager selectedHashManager;
  @Mock private List<BlockedHash> blockedHashList;
  @Mock private BlockedHash blockedHash;
  @Mock private BlockedHash blockedHashRecord;
  @Mock private DownloadDocument downloadDocument;
  @Mock private MultipartFile uploadedFile;
  @Mock private InputStream inputStream;
  @Mock private List<String> hashList;
  @Mock private List<String> updatedHashList;
  @Mock private List<BlockedHash> blockedHashes = new ArrayList<>();
  @Mock private Set<String> selectedHashList;
  @Mock private HttpSession session;
  @Mock private Stream<String> selectedHashStream;

  @BeforeEach
  void setUp() {
    blockedHashes.add(blockedHashRecord);
    Mockito.when(fileTypeAdaptor.getType(Mockito.any())).thenReturn("jpeg");
    Mockito.when(selectedHashStream.toList()).thenReturn(hashList);
    Mockito.when(selectedHashList.stream()).thenReturn(selectedHashStream);
  }

  @Test
  void loadAll() {
    Mockito.when(blockedHashService.getAll()).thenReturn(blockedHashList);

    final List<BlockedHash> result = controller.getAll();

    assertNotNull(result);
    assertSame(blockedHashList, result);

    Mockito.verify(blockedHashService, Mockito.times(1)).getAll();
  }

  @Test
  void getByHash_serviceException() throws BlockedHashException {
    Mockito.when(blockedHashService.getByHash(Mockito.anyString()))
        .thenThrow(BlockedHashException.class);

    assertThrows(BlockedHashException.class, () -> controller.getByHash(TEST_PAGE_HASH));
  }

  @Test
  void getByHash() throws BlockedHashException {
    Mockito.when(blockedHashService.getByHash(Mockito.anyString())).thenReturn(blockedHashRecord);

    final BlockedHash result = controller.getByHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(blockedHashRecord, result);

    Mockito.verify(blockedHashService, Mockito.times(1)).getByHash(TEST_PAGE_HASH);
  }

  @Test
  void blockPageHashes() {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    controller.blockPageHashes(new SetBlockedPageRequest(pageHashList));

    Mockito.verify(blockedHashService, Mockito.times(1)).blockPages(pageHashList);
  }

  @Test
  void markPagesWithHash() {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    controller.markPagesWithHash(new MarkPageWithHashRequest(pageHashList));

    Mockito.verify(comicPageService, Mockito.times(1)).markPagesWithHashForDeletion(pageHashList);
  }

  @Test
  void unblockPage() {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    controller.unblockPageHashes(new SetBlockedPageRequest(pageHashList));

    Mockito.verify(blockedHashService, Mockito.times(1)).unblockPages(pageHashList);
  }

  @Test
  void unmarkPagesWithHash() {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    controller.unmarkPagesWithHash(new UnmarkPageWithHashRequest(pageHashList));

    Mockito.verify(comicPageService, Mockito.times(1)).unmarkPagesWithHashForDeletion(pageHashList);
  }

  @Test
  void updateBlockedPage() throws DuplicatePageException {
    Mockito.when(
            blockedHashService.updateBlockedPage(
                Mockito.anyString(), Mockito.any(BlockedHash.class)))
        .thenReturn(blockedHashRecord);

    final BlockedHash result = controller.updateBlockedPage(TEST_PAGE_HASH, blockedHash);

    assertNotNull(result);
    assertSame(blockedHashRecord, result);

    Mockito.verify(blockedHashService, Mockito.times(1))
        .updateBlockedPage(TEST_PAGE_HASH, blockedHash);
  }

  @Test
  void downloadFile() throws IOException {
    Mockito.when(blockedHashService.createFile()).thenReturn(downloadDocument);

    final DownloadDocument response = controller.downloadFile();

    assertNotNull(response);
    assertSame(downloadDocument, response);

    Mockito.verify(blockedHashService, Mockito.times(1)).createFile();
  }

  @Test
  void uploadFile_serviceException() throws IOException {
    Mockito.when(uploadedFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(blockedHashService.uploadFile(Mockito.any(InputStream.class)))
        .thenThrow(IOException.class);

    assertThrows(IOException.class, () -> controller.uploadFile(uploadedFile));
  }

  @Test
  void uploadFile() throws BlockedHashException, IOException {
    Mockito.when(uploadedFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(blockedHashService.uploadFile(Mockito.any(InputStream.class)))
        .thenReturn(blockedHashList);

    final List<BlockedHash> response = controller.uploadFile(uploadedFile);

    assertNotNull(response);
    assertSame(blockedHashList, response);

    Mockito.verify(blockedHashService, Mockito.times(1)).uploadFile(inputStream);
  }

  @Test
  void deleteBlockedPages() {
    Mockito.when(blockedHashService.deleteBlockedPages(Mockito.anyList()))
        .thenReturn(updatedHashList);

    final List<String> response =
        controller.deleteBlockedPages(new DeleteBlockedPagesRequest(hashList));

    assertNotNull(response);
    assertSame(updatedHashList, response);

    Mockito.verify(blockedHashService, Mockito.times(1)).deleteBlockedPages(hashList);
  }

  @Test
  void getThumbnail_thumbnailNotFound() throws BlockedHashException {
    Mockito.when(blockedHashService.getThumbnail(Mockito.anyString()))
        .thenThrow(BlockedHashException.class);

    assertThrows(BlockedHashException.class, () -> controller.getThumbnail(TEST_PAGE_HASH));
  }

  @Test
  void getThumbnail() throws BlockedHashException {
    Mockito.when(blockedHashService.getThumbnail(Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);

    final ResponseEntity<byte[]> result = controller.getThumbnail(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(blockedHashService, Mockito.times(1)).getThumbnail(TEST_PAGE_HASH);
  }

  @Test
  void blockSelectedHash() {
    Mockito.when(selectedHashManager.load(Mockito.any(HttpSession.class)))
        .thenReturn(selectedHashList);

    controller.blockSelectedHashes(session);

    Mockito.verify(selectedHashManager, Mockito.times(1)).load(Mockito.any(HttpSession.class));
    Mockito.verify(blockedHashService, Mockito.times(1)).blockPages(hashList);
    Mockito.verify(selectedHashManager, Mockito.times(1)).clearSelections(session);
  }

  @Test
  void unblockSelectedHash() {
    Mockito.when(selectedHashManager.load(Mockito.any(HttpSession.class)))
        .thenReturn(selectedHashList);

    controller.unblockSelectedHashes(session);

    Mockito.verify(selectedHashManager, Mockito.times(1)).load(Mockito.any(HttpSession.class));
    Mockito.verify(blockedHashService, Mockito.times(1)).unblockPages(hashList);
    Mockito.verify(selectedHashManager, Mockito.times(1)).clearSelections(session);
  }
}
