/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.adaptors.comicbooks;

import static junit.framework.TestCase.*;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.adaptors.archive.model.ArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.ArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.adaptors.content.ComicMetadataContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorException;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.Page;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookAdaptorTest {
  private static final String TEST_COMIC_FILENAME = "/Users/comixed/Documents/comics/comicBook.cbz";
  private static final Object TEST_PAGE_EXTENSION = "jpg";
  private static final String TEST_ENTRY_FILENAME = "Entry filename." + TEST_PAGE_EXTENSION;
  private static final byte[] TEST_ARCHIVE_ENTRY_CONTENT = "Some data".getBytes();
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_FINAL_FILENAME = "The final filename";
  private static final byte[] TEST_COMICINFO_XML_CONTENT = "ComicInfo.xml content".getBytes();
  private static final int TEST_PAGE_INDEX = 0;
  private static final String TEST_REAL_COMIC_FILE = "target/test-classes/example.cbz";
  private static final String TEST_REAL_COMIC_METADATA_FILE = "target/test-classes/example.meta";
  private static final String TEST_PAGE_RENAMING_RULE = "page renaming rule";
  private static final String TEST_NEW_PAGE_FILENAME = "new page filename";
  private static final String TEST_MISSING_FILE = "farkle.png";
  private static final String TEST_EXISTING_FILE = "ComicInfo.xml";

  @InjectMocks private ComicBookAdaptor adaptor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ArchiveAdaptor readableArchiveAdaptor;
  @Mock private ArchiveAdaptor writeableArchiveAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private Page page;
  @Mock private ArchiveReadHandle readHandle;
  @Mock private ArchiveWriteHandle writeHandle;
  @Mock private ContentAdaptor contentAdaptor;
  @Mock private ComicArchiveEntry archiveEntry;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ComicPageAdaptor comicPageAdaptor;
  @Mock private ComicMetadataContentAdaptor comicMetadataContentAdaptor;
  @Mock private FileAdaptor fileAdaptor;

  @Captor private ArgumentCaptor<File> moveSourceFile;
  @Captor private ArgumentCaptor<File> moveDestinationFile;
  @Captor private ArgumentCaptor<String> temporaryArchiveFile;

  private File comicFile = new File(TEST_REAL_COMIC_FILE);
  private List<ComicArchiveEntry> archiveEntryList = new ArrayList<>();
  private List<Page> pageList = new ArrayList<>();

  @Before
  public void setUp()
      throws ArchiveAdaptorException, AdaptorException, ContentAdaptorException, IOException {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenReturn(readHandle);
    Mockito.when(writeableArchiveAdaptor.openArchiveForWrite(temporaryArchiveFile.capture()))
        .thenReturn(writeHandle);
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(writeableArchiveAdaptor);
    Mockito.when(readableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenReturn(archiveEntryList);
    Mockito.when(fileTypeAdaptor.getContentAdaptorFor(Mockito.any(byte[].class)))
        .thenReturn(contentAdaptor);
    Mockito.when(archiveEntry.getFilename()).thenReturn(TEST_ENTRY_FILENAME);

    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenReturn(readableArchiveAdaptor);
    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenReturn(TEST_ARCHIVE_ENTRY_CONTENT);
    Mockito.when(
            comicFileAdaptor.findAvailableFilename(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(TEST_FINAL_FILENAME);

    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFile()).thenReturn(comicFile);
    Mockito.when(comicBook.getPages()).thenReturn(pageList);
    Mockito.when(page.getFilename()).thenReturn(TEST_ENTRY_FILENAME);
    pageList.add(page);
    Mockito.when(comicMetadataContentAdaptor.createContent(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_COMICINFO_XML_CONTENT);
    Mockito.doNothing()
        .when(writeableArchiveAdaptor)
        .writeEntry(writeHandle, "ComicInfo.xml", TEST_COMICINFO_XML_CONTENT);
    Mockito.doNothing()
        .when(writeableArchiveAdaptor)
        .writeEntry(writeHandle, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);

    Mockito.doNothing()
        .when(fileAdaptor)
        .moveFile(moveSourceFile.capture(), moveDestinationFile.capture());
  }

  @Test(expected = AdaptorException.class)
  public void testCreateComicErrorGettingArchiveAdaptor() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    try {
      adaptor.createComic(TEST_COMIC_FILENAME);
    } finally {
      Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    }
  }

  @Test
  public void testCreateComic() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenReturn(readableArchiveAdaptor);
    Mockito.when(readableArchiveAdaptor.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);

    final ComicBook result = adaptor.createComic(TEST_COMIC_FILENAME);

    assertNotNull(result);
    assertEquals(TEST_COMIC_FILENAME, result.getComicDetail().getFilename());
    assertSame(TEST_ARCHIVE_TYPE, result.getComicDetail().getArchiveType());

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
  }

  @Test(expected = AdaptorException.class)
  public void testLoadGetArchiveAdaptorThrowsException()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    try {
      adaptor.load(comicBook);
    } finally {
      Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testLoadOpenArchiveThrowsException()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.load(comicBook);
    } finally {
      Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
          .openArchiveForRead(TEST_COMIC_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testLoadGetEntriesThrowsException()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    Mockito.when(readableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.load(comicBook);
    } finally {
      Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testLoadReadEntryThrowsException()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.load(comicBook);
    } finally {
      Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
          .readEntry(readHandle, TEST_ENTRY_FILENAME);
    }
  }

  @Test
  public void testLoadNoAdaptorForContent()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.when(fileTypeAdaptor.getContentAdaptorFor(Mockito.any(byte[].class))).thenReturn(null);

    adaptor.load(comicBook);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1))
        .getContentAdaptorFor(TEST_ARCHIVE_ENTRY_CONTENT);
  }

  @Test(expected = AdaptorException.class)
  public void testLoadContentAdaptorThrowsException()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.doThrow(ContentAdaptorException.class)
        .when(contentAdaptor)
        .loadContent(Mockito.any(ComicBook.class), Mockito.anyString(), Mockito.any(byte[].class));

    try {
      adaptor.load(comicBook);
    } finally {
      Mockito.verify(contentAdaptor, Mockito.times(1))
          .loadContent(comicBook, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
    }
  }

  @Test
  public void testLoadNoContent()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenReturn(new byte[0]);

    archiveEntryList.add(archiveEntry);

    adaptor.load(comicBook);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(contentAdaptor, Mockito.never())
        .loadContent(Mockito.any(ComicBook.class), Mockito.anyString(), Mockito.any(byte[].class));
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test
  public void testLoad() throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    archiveEntryList.add(archiveEntry);

    adaptor.load(comicBook);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1))
        .getContentAdaptorFor(TEST_ARCHIVE_ENTRY_CONTENT);
    Mockito.verify(contentAdaptor, Mockito.times(1))
        .loadContent(comicBook, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test(expected = AdaptorException.class)
  public void testSaveExceptionOnGetReadArchiveType() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(TEST_COMIC_FILENAME))
        .thenThrow(AdaptorException.class);

    try {
      adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, "");
    } finally {
      Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testSaveExceptionOnOpenArchiveForRead()
      throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, "");
    } finally {
      Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
          .openArchiveForRead(TEST_COMIC_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testSaveExceptionOnWriteComicInfo()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    Mockito.when(comicMetadataContentAdaptor.createContent(Mockito.any(ComicBook.class)))
        .thenThrow(ContentAdaptorException.class);

    try {
      adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, "");
    } finally {
      Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1)).createContent(comicBook);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testSaveReadPageThrowsException() throws AdaptorException, ArchiveAdaptorException {
    Mockito.doThrow(ArchiveAdaptorException.class)
        .when(readableArchiveAdaptor)
        .readEntry(Mockito.any(ArchiveReadHandle.class), Mockito.anyString());

    try {
      adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, "");
    } finally {
      Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
          .readEntry(readHandle, TEST_ENTRY_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testSaveWritePageThrowsException() throws AdaptorException, ArchiveAdaptorException {
    Mockito.doThrow(ArchiveAdaptorException.class)
        .when(writeableArchiveAdaptor)
        .writeEntry(writeHandle, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);

    try {
      adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, "");
    } finally {
      Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
          .writeEntry(writeHandle, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
    }
  }

  @Test
  public void testSaveRenamePages()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    Mockito.when(
            comicPageAdaptor.createFilenameFromRule(
                Mockito.any(Page.class), Mockito.anyString(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(TEST_NEW_PAGE_FILENAME);

    adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, TEST_PAGE_RENAMING_RULE);

    final String temporaryArchiveFilename = temporaryArchiveFile.getValue();
    assertNotNull(temporaryArchiveFilename);

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .openArchiveForWrite(temporaryArchiveFilename);
    Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1)).createContent(comicBook);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .writeEntry(writeHandle, "ComicInfo.xml", TEST_COMICINFO_XML_CONTENT);
    Mockito.verify(comicPageAdaptor, Mockito.times(1))
        .createFilenameFromRule(
            page, TEST_PAGE_RENAMING_RULE, 0, String.valueOf(pageList.size()).length());
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .writeEntry(writeHandle, TEST_NEW_PAGE_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
  }

  @Test
  public void testSaveRemoveDeletedPages()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException, IOException {

    adaptor.save(comicBook, TEST_ARCHIVE_TYPE, true, "");

    final String temporaryArchiveFilename = temporaryArchiveFile.getValue();
    assertNotNull(temporaryArchiveFilename);

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .openArchiveForWrite(temporaryArchiveFilename);
    Mockito.verify(comicBook, Mockito.times(1)).removeDeletedPages();
    Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1)).createContent(comicBook);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .writeEntry(writeHandle, "ComicInfo.xml", TEST_COMICINFO_XML_CONTENT);
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .writeEntry(writeHandle, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteFile(comicFile);
    Mockito.verify(fileAdaptor, Mockito.times(1))
        .moveFile(moveSourceFile.getValue(), moveDestinationFile.getValue());
    Mockito.verify(comicDetail, Mockito.times(1)).setFilename(TEST_FINAL_FILENAME);
  }

  @Test(expected = AdaptorException.class)
  public void testSaveMetadataFileMetadataAdaptorException()
      throws ContentAdaptorException, AdaptorException {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_REAL_COMIC_FILE);

    Mockito.when(comicMetadataContentAdaptor.createContent(Mockito.any(ComicBook.class)))
        .thenThrow(ContentAdaptorException.class);

    try {
      adaptor.saveMetadataFile(comicBook);
    } finally {
      Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1)).createContent(comicBook);
    }
  }

  @Test
  public void testSaveMetadataFile() throws ContentAdaptorException, AdaptorException {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_REAL_COMIC_FILE);

    Mockito.when(comicMetadataContentAdaptor.createContent(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_COMICINFO_XML_CONTENT);

    adaptor.saveMetadataFile(comicBook);

    assertTrue(new File(TEST_REAL_COMIC_METADATA_FILE).exists());

    Mockito.verify(comicMetadataContentAdaptor, Mockito.times(1)).createContent(comicBook);
  }

  @Test(expected = AdaptorException.class)
  public void testLoadPageExceptionOnGetArchiveAdaptor() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    try {
      adaptor.loadPageContent(comicBook, TEST_PAGE_INDEX);
    } finally {
      Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testLoadPageExceptionOnOpenArchive()
      throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.loadPageContent(comicBook, TEST_PAGE_INDEX);
    } finally {
      Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    }
  }

  @Test
  public void testLoadPage() throws AdaptorException, ArchiveAdaptorException {
    final byte[] result = adaptor.loadPageContent(comicBook, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(TEST_ARCHIVE_ENTRY_CONTENT, result);

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test(expected = AdaptorException.class)
  public void testLoadCoverExceptionOnGetArchiveAdaptor()
      throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    try {
      adaptor.loadCover(TEST_COMIC_FILENAME);
    } finally {
      Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testLoadCoverExceptionOnOpen() throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.loadCover(TEST_COMIC_FILENAME);
    } finally {
      Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
          .openArchiveForRead(TEST_COMIC_FILENAME);
    }
  }

  @Test(expected = AdaptorException.class)
  public void testLoadCoverExceptionOnGetEntries()
      throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.loadCover(TEST_COMIC_FILENAME);
    } finally {
      Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    }
  }

  @Test
  public void testLoadCoverNoImages() throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(archiveEntry.getArchiveEntryType()).thenReturn(ArchiveEntryType.FILE);

    archiveEntryList.add(archiveEntry);

    final byte[] result = adaptor.loadCover(TEST_COMIC_FILENAME);

    assertNull(result);

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test
  public void testLoadCover() throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(archiveEntry.getArchiveEntryType()).thenReturn(ArchiveEntryType.IMAGE);
    archiveEntryList.add(archiveEntry);

    final byte[] result = adaptor.loadCover(TEST_COMIC_FILENAME);

    assertNotNull(result);
    assertSame(TEST_ARCHIVE_ENTRY_CONTENT, result);

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test(expected = AdaptorException.class)
  public void testLoadFileArchiveAdaptorException()
      throws AdaptorException, ArchiveAdaptorException {
    Mockito.when(writeableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenReturn(readHandle);
    Mockito.when(writeableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      adaptor.loadFile(comicBook, TEST_MISSING_FILE);
    } finally {
      Mockito.verify(writeableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    }
  }

  @Test
  public void testLoadFileNotExistent() throws AdaptorException, ArchiveAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.when(writeableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenReturn(archiveEntryList);
    Mockito.when(writeableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenReturn(readHandle);
    Mockito.when(archiveEntry.getFilename()).thenReturn(TEST_EXISTING_FILE);

    final byte[] result = adaptor.loadFile(comicBook, TEST_MISSING_FILE);

    assertNull(result);

    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_EXISTING_FILE);
  }

  @Test
  public void testLoadFile() throws AdaptorException, ArchiveAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.when(writeableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenReturn(archiveEntryList);
    Mockito.when(writeableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenReturn(readHandle);
    Mockito.when(archiveEntry.getFilename()).thenReturn(TEST_EXISTING_FILE);
    Mockito.when(
            writeableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenReturn(TEST_COMICINFO_XML_CONTENT);

    final byte[] result = adaptor.loadFile(comicBook, TEST_EXISTING_FILE);

    assertNotNull(result);
    assertSame(TEST_COMICINFO_XML_CONTENT, result);

    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_EXISTING_FILE);
  }
}
