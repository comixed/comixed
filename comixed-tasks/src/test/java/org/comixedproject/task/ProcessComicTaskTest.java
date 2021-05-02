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

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comic.PublishComicUpdateAction;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFileDetails;
import org.comixedproject.model.comic.Page;
import org.comixedproject.service.blockedpage.BlockedPageService;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.state.comic.ComicEvent;
import org.comixedproject.state.comic.ComicStateHandler;
import org.comixedproject.utils.Utils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:application.properties")
@SpringBootTest
public class ProcessComicTaskTest {
  private static final String TEST_FILE_HASH = "OICU812";
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_BLOCKED_PAGE_HASH = "1234567890";
  private static final String TEST_UNBLOCKED_PAGE_HASH = "0987654321";
  private static final long TEST_COMIC_ID = 17L;

  @InjectMocks private ProcessComicTask task;
  @Mock private Comic comic;
  @Mock private Comic savedComic;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ComicService comicService;
  @Mock private Utils utils;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private BlockedPageService blockedPageService;
  @Mock private Page blockedPage;
  @Mock private Page unblockedPage;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private PublishComicUpdateAction publishComicUpdateAction;

  @Captor private ArgumentCaptor<ComicFileDetails> comicFileDetailsCaptor;

  private List<String> blockedPageHashes = new ArrayList<>();
  private ArchiveType archiveType = ArchiveType.CBZ;
  private List<Page> pageList = new ArrayList<>();

  @Before
  public void setUp() throws ArchiveAdaptorException, IOException, ComicException {
    this.pageList.add(blockedPage);
    this.pageList.add(unblockedPage);
    this.blockedPageHashes.add(TEST_BLOCKED_PAGE_HASH);

    Mockito.when(blockedPage.getHash()).thenReturn(TEST_BLOCKED_PAGE_HASH);
    Mockito.when(unblockedPage.getHash()).thenReturn(TEST_UNBLOCKED_PAGE_HASH);

    Mockito.when(comic.getArchiveType()).thenReturn(archiveType);
    Mockito.when(comic.getId()).thenReturn(TEST_COMIC_ID);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(utils.createHash(Mockito.any(InputStream.class))).thenReturn(TEST_FILE_HASH);
    Mockito.doNothing().when(comic).setFileDetails(comicFileDetailsCaptor.capture());
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(savedComic);
  }

  @After
  public void tearDown() {
    Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(archiveType);
  }

  @Test
  public void testStartTaskCheckForBlockedPages()
      throws TaskException, ArchiveAdaptorException, PublishingException {
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
    Mockito.verify(publishComicUpdateAction, Mockito.times(1)).publish(savedComic);
  }

  @Test
  public void testStartTaskIgnoreMetadata()
      throws TaskException, ArchiveAdaptorException, PublishingException {
    task.setComic(comic);
    task.setIgnoreMetadata(true);
    task.setDeleteBlockedPages(false);

    task.startTask();

    assertEquals(TEST_FILE_HASH, comicFileDetailsCaptor.getValue().getHash());

    Mockito.verify(archiveAdaptor, Mockito.times(1)).fillComic(comic);
    Mockito.verify(comic, Mockito.times(1)).setFileDetails(comicFileDetailsCaptor.getValue());
    Mockito.verify(publishComicUpdateAction, Mockito.times(1)).publish(savedComic);
  }

  @Test
  public void testStartTask()
      throws TaskException, ArchiveAdaptorException, IOException, PublishingException {
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
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comic, ComicEvent.contentsProcessed);
    Mockito.verify(publishComicUpdateAction, Mockito.times(1)).publish(savedComic);
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
  public void testStartTaskExceptionOnJsonEncoding() throws TaskException, PublishingException {
    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(false);

    task.startTask();

    Mockito.verify(publishComicUpdateAction, Mockito.times(1)).publish(savedComic);
  }

  @Test(expected = TaskException.class)
  public void testStartTaskExceptionOnLoadingComic()
      throws TaskException, IOException, ComicException {
    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(false);

    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      task.startTask();
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }
}
