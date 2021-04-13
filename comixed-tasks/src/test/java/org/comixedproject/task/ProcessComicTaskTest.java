/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.task;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFileDetails;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.service.blockedpage.BlockedPageService;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.utils.Utils;
import org.comixedproject.views.View;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:application.properties")
@SpringBootTest
public class ProcessComicTaskTest {
  private static final String TEST_FILE_HASH = "OICU812";
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_BLOCKED_PAGE_HASH = "1234567890";
  private static final String TEST_UNBLOCKED_PAGE_HASH = "0987654321";
  private static final String TEST_COMIC_AS_JSON = "This is a JSON encoded comic";

  @InjectMocks private ProcessComicTask task;
  @Mock private Comic comic;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ComicService comicService;
  @Mock private Utils utils;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private BlockedPageService blockedPageService;
  @Mock private Page blockedPage;
  @Mock private Page unblockedPage;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;

  @Captor private ArgumentCaptor<ComicFileDetails> comicFileDetailsCaptor;

  private List<String> blockedPageHashes = new ArrayList<>();
  private ArchiveType archiveType = ArchiveType.CBZ;
  private List<Page> pageList = new ArrayList<>();

  @Before
  public void setUp() throws ArchiveAdaptorException, IOException {
    this.pageList.add(blockedPage);
    this.pageList.add(unblockedPage);
    this.blockedPageHashes.add(TEST_BLOCKED_PAGE_HASH);

    Mockito.when(blockedPage.getHash()).thenReturn(TEST_BLOCKED_PAGE_HASH);
    Mockito.when(unblockedPage.getHash()).thenReturn(TEST_UNBLOCKED_PAGE_HASH);

    Mockito.when(comic.getArchiveType()).thenReturn(archiveType);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.doNothing().when(archiveAdaptor).loadComic(comic);
    Mockito.doNothing().when(archiveAdaptor).fillComic(comic);
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(utils.createHash(Mockito.any(InputStream.class))).thenReturn(TEST_FILE_HASH);
    Mockito.doNothing().when(comic).setFileDetails(comicFileDetailsCaptor.capture());
    Mockito.when(comicService.save(Mockito.any(Comic.class))).thenReturn(comic);

    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any(Comic.class)))
        .thenReturn(TEST_COMIC_AS_JSON);
  }

  @After
  public void tearDown() {
    Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(archiveType);
  }

  @Test
  public void testStartTaskCheckForBlockedPages()
      throws TaskException, ArchiveAdaptorException, IOException {
    Mockito.when(blockedPageService.getHashes()).thenReturn(blockedPageHashes);
    Mockito.when(comic.getPages()).thenReturn(pageList);

    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(true);

    task.startTask();

    assertEquals(TEST_FILE_HASH, comicFileDetailsCaptor.getValue().getHash());

    Mockito.verify(blockedPageService, Mockito.times(1)).getHashes();
    Mockito.verify(blockedPage, Mockito.times(1)).setDeleted(true);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
    Mockito.verify(comic, Mockito.times(1)).setFileDetails(comicFileDetailsCaptor.getValue());
    Mockito.verify(comicService, Mockito.times(1)).save(comic);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ComicDetailsView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(comic);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(Constants.COMIC_LIST_UPDATE_TOPIC, TEST_COMIC_AS_JSON);
  }

  @Test
  public void testStartTaskIgnoreMetadata()
      throws TaskException, ArchiveAdaptorException, IOException {
    task.setComic(comic);
    task.setIgnoreMetadata(true);
    task.setDeleteBlockedPages(false);

    task.startTask();

    assertEquals(TEST_FILE_HASH, comicFileDetailsCaptor.getValue().getHash());

    Mockito.verify(archiveAdaptor, Mockito.times(1)).fillComic(comic);
    Mockito.verify(comic, Mockito.times(1)).setFileDetails(comicFileDetailsCaptor.getValue());
    Mockito.verify(comicService, Mockito.times(1)).save(comic);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ComicDetailsView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(comic);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(Constants.COMIC_LIST_UPDATE_TOPIC, TEST_COMIC_AS_JSON);
  }

  @Test
  public void testStartTask() throws TaskException, ArchiveAdaptorException, IOException {
    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(false);

    task.startTask();

    assertEquals(TEST_FILE_HASH, comicFileDetailsCaptor.getValue().getHash());
    assertFalse(task.createDescription().isEmpty());

    Mockito.verify(blockedPageService, Mockito.never()).getHashes();
    Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
    Mockito.verify(blockedPage, Mockito.never()).setDeleted(true);
    Mockito.verify(comic, Mockito.times(1)).setFileDetails(comicFileDetailsCaptor.getValue());
    Mockito.verify(comicService, Mockito.times(1)).save(comic);
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.ComicDetailsView.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(comic);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(Constants.COMIC_LIST_UPDATE_TOPIC, TEST_COMIC_AS_JSON);
  }

  @Test(expected = TaskException.class)
  public void testStartTaskArchiveAdaptorRaisesException()
      throws TaskException, ArchiveAdaptorException {
    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(false);

    Mockito.doThrow(ArchiveAdaptorException.class).when(archiveAdaptor).loadComic(comic);

    try {
      task.startTask();
    } finally {
      Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
    }
  }

  @Test(expected = TaskException.class)
  public void testStartTaskExceptionOnFileHash() throws TaskException, IOException {
    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(false);

    Mockito.when(utils.createHash(Mockito.any(FileInputStream.class))).thenThrow(IOException.class);

    try {
      task.startTask();
    } finally {
      Mockito.verify(utils, Mockito.times(1)).createHash(Mockito.any(FileInputStream.class));
    }
  }

  @Test
  public void testStartTaskExceptionOnJsonEncoding() throws TaskException, IOException {
    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(false);

    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);

    task.startTask();

    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(comic);
    Mockito.verify(messagingTemplate, Mockito.never())
        .convertAndSend(Mockito.anyString(), Mockito.anyString());
  }
}
