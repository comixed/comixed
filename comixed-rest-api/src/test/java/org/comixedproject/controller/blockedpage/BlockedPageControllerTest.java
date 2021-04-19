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

package org.comixedproject.controller.blockedpage;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.comixedproject.model.messaging.Constants.BLOCKED_PAGE_LIST_REMOVAL_TOPIC;
import static org.comixedproject.model.messaging.Constants.BLOCKED_PAGE_LIST_UPDATE_TOPIC;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.comixedproject.model.blockedpage.BlockedPage;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.service.blockedpage.BlockedPageException;
import org.comixedproject.service.blockedpage.BlockedPageService;
import org.comixedproject.views.View;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.multipart.MultipartFile;

@RunWith(MockitoJUnitRunner.class)
public class BlockedPageControllerTest {
  private static final String TEST_BLOCKED_PAGE_AS_JSON =
      "This is the blocked page as a JSON object";
  private static final String TEST_PAGE_HASH = "0123456789ABCDEF0123456789ABCDEF";

  @InjectMocks private BlockedPageController controller;
  @Mock private BlockedPageService blockedPageService;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private List<BlockedPage> blockedPageList;
  @Mock private BlockedPage blockedPage;
  @Mock private BlockedPage blockedPageRecord;
  @Mock private Page page;
  @Mock private DownloadDocument downloadDocument;
  @Mock private MultipartFile uploadedFile;
  @Mock private InputStream inputStream;

  @Before
  public void setUp() {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
  }

  @Test
  public void testLoadAll() {
    Mockito.when(blockedPageService.getAll()).thenReturn(blockedPageList);

    final List<BlockedPage> result = controller.getAll();

    assertNotNull(result);
    assertSame(blockedPageList, result);

    Mockito.verify(blockedPageService, Mockito.times(1)).getAll();
  }

  @Test(expected = BlockedPageException.class)
  public void testGetOneServiceException() throws BlockedPageException {
    Mockito.when(blockedPageService.getByHash(Mockito.anyString()))
        .thenThrow(BlockedPageException.class);

    try {
      controller.getByHash(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(blockedPageService, Mockito.times(1)).getByHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testGetOne() throws BlockedPageException {
    Mockito.when(blockedPageService.getByHash(Mockito.anyString())).thenReturn(blockedPageRecord);

    final BlockedPage result = controller.getByHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(blockedPageRecord, result);

    Mockito.verify(blockedPageService, Mockito.times(1)).getByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testBlockPageJsonProcessingException() throws JsonProcessingException {
    Mockito.when(blockedPageService.blockHash(Mockito.anyString())).thenReturn(blockedPageRecord);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any(BlockedPage.class)))
        .thenThrow(JsonProcessingException.class);

    controller.blockPage(TEST_PAGE_HASH);

    Mockito.verify(blockedPageService, Mockito.times(1)).blockHash(TEST_PAGE_HASH);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.BlockedPageList.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(blockedPageRecord);
    Mockito.verify(messagingTemplate, Mockito.never())
        .convertAndSend(BLOCKED_PAGE_LIST_UPDATE_TOPIC, TEST_BLOCKED_PAGE_AS_JSON);
  }

  @Test
  public void testBlockPage() throws JsonProcessingException {
    Mockito.when(blockedPageService.blockHash(Mockito.anyString())).thenReturn(blockedPageRecord);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any(BlockedPage.class)))
        .thenReturn(TEST_BLOCKED_PAGE_AS_JSON);

    controller.blockPage(TEST_PAGE_HASH);

    Mockito.verify(blockedPageService, Mockito.times(1)).blockHash(TEST_PAGE_HASH);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.BlockedPageList.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(blockedPageRecord);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(BLOCKED_PAGE_LIST_UPDATE_TOPIC, TEST_BLOCKED_PAGE_AS_JSON);
  }

  @Test(expected = BlockedPageException.class)
  public void testUpdateBlockedPageServiceRaisesException() throws BlockedPageException {
    Mockito.when(
            blockedPageService.updateBlockedPage(
                Mockito.anyString(), Mockito.any(BlockedPage.class)))
        .thenThrow(BlockedPageException.class);

    try {
      controller.updateBlockedPage(TEST_PAGE_HASH, blockedPage);
    } finally {
      Mockito.verify(blockedPageService, Mockito.times(1))
          .updateBlockedPage(TEST_PAGE_HASH, blockedPage);
    }
  }

  @Test
  public void testUpdateBlockedPageJsonProcessingException()
      throws BlockedPageException, JsonProcessingException {
    Mockito.when(
            blockedPageService.updateBlockedPage(
                Mockito.anyString(), Mockito.any(BlockedPage.class)))
        .thenReturn(blockedPageRecord);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any(BlockedPage.class)))
        .thenThrow(JsonProcessingException.class);

    final BlockedPage response = controller.updateBlockedPage(TEST_PAGE_HASH, blockedPage);

    assertNotNull(response);
    assertSame(blockedPageRecord, response);

    Mockito.verify(blockedPageService, Mockito.times(1))
        .updateBlockedPage(TEST_PAGE_HASH, blockedPage);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.BlockedPageList.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(blockedPageRecord);
    Mockito.verify(messagingTemplate, Mockito.never())
        .convertAndSend(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testUpdateBlockedPage() throws BlockedPageException, JsonProcessingException {
    Mockito.when(
            blockedPageService.updateBlockedPage(
                Mockito.anyString(), Mockito.any(BlockedPage.class)))
        .thenReturn(blockedPageRecord);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any(BlockedPage.class)))
        .thenReturn(TEST_BLOCKED_PAGE_AS_JSON);

    final BlockedPage result = controller.updateBlockedPage(TEST_PAGE_HASH, blockedPage);

    assertNotNull(result);
    assertSame(blockedPageRecord, result);

    Mockito.verify(blockedPageService, Mockito.times(1))
        .updateBlockedPage(TEST_PAGE_HASH, blockedPage);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.BlockedPageList.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(blockedPageRecord);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(BLOCKED_PAGE_LIST_UPDATE_TOPIC, TEST_BLOCKED_PAGE_AS_JSON);
  }

  @Test
  public void testUnblockPageNoChange() throws BlockedPageException {
    Mockito.when(blockedPageService.unblockPage(Mockito.anyString())).thenReturn(null);

    controller.unblockPage(TEST_PAGE_HASH);

    Mockito.verify(blockedPageService, Mockito.times(1)).unblockPage(TEST_PAGE_HASH);
    Mockito.verify(messagingTemplate, Mockito.never())
        .convertAndSend(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testUnblockPageJsonEncodingError()
      throws JsonProcessingException, BlockedPageException {
    Mockito.when(blockedPageService.unblockPage(Mockito.anyString())).thenReturn(blockedPageRecord);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any(BlockedPage.class)))
        .thenThrow(JsonProcessingException.class);

    controller.unblockPage(TEST_PAGE_HASH);

    Mockito.verify(blockedPageService, Mockito.times(1)).unblockPage(TEST_PAGE_HASH);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.BlockedPageDetail.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(blockedPageRecord);
    Mockito.verify(messagingTemplate, Mockito.never())
        .convertAndSend(Mockito.anyString(), Mockito.anyString());
  }

  @Test
  public void testUnblockPage() throws JsonProcessingException, BlockedPageException {
    Mockito.when(blockedPageService.unblockPage(Mockito.anyString())).thenReturn(blockedPageRecord);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any(BlockedPage.class)))
        .thenReturn(TEST_BLOCKED_PAGE_AS_JSON);

    controller.unblockPage(TEST_PAGE_HASH);

    Mockito.verify(blockedPageService, Mockito.times(1)).unblockPage(TEST_PAGE_HASH);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.BlockedPageDetail.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(blockedPageRecord);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(BLOCKED_PAGE_LIST_REMOVAL_TOPIC, TEST_BLOCKED_PAGE_AS_JSON);
  }

  @Test
  public void testDownloadFile() throws IOException {
    Mockito.when(blockedPageService.createFile()).thenReturn(downloadDocument);

    final DownloadDocument response = controller.downloadFile();

    assertNotNull(response);
    assertSame(downloadDocument, response);

    Mockito.verify(blockedPageService, Mockito.times(1)).createFile();
  }

  @Test(expected = IOException.class)
  public void testUploadFileServiceException() throws BlockedPageException, IOException {
    Mockito.when(uploadedFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(blockedPageService.uploadFile(Mockito.any(InputStream.class)))
        .thenThrow(IOException.class);

    try {
      controller.uploadFile(uploadedFile);
    } finally {
      Mockito.verify(blockedPageService, Mockito.times(1)).uploadFile(inputStream);
    }
  }

  @Test
  public void testUploadFile() throws BlockedPageException, IOException {
    Mockito.when(uploadedFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(blockedPageService.uploadFile(Mockito.any(InputStream.class)))
        .thenReturn(blockedPageList);

    final List<BlockedPage> response = controller.uploadFile(uploadedFile);

    assertNotNull(response);
    assertSame(blockedPageList, response);

    Mockito.verify(blockedPageService, Mockito.times(1)).uploadFile(inputStream);
  }
}
