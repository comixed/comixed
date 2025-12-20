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

import static org.junit.jupiter.api.Assertions.*;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.adaptors.archive.model.ArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.ArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.adaptors.content.*;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.ComicPage;
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
class ComicBookAdaptorTest {
  private static final String TEST_COMIC_FILENAME = "/Users/comixed/Documents/comics/comicBook.cbz";
  private static final String TEST_PAGE_EXTENSION = "jpg";
  private static final String TEST_ENTRY_FILENAME = "Entry filename." + TEST_PAGE_EXTENSION;
  private static final byte[] TEST_ARCHIVE_ENTRY_CONTENT = "Some data".getBytes();
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_FINAL_FILENAME = "The final filename";
  private static final byte[] TEST_COMICINFO_XML_CONTENT = "ComicInfo.xml content".getBytes();
  private static final int TEST_PAGE_INDEX = 0;
  private static final String TEST_REAL_COMIC_FILE = "target/test-classes/example.cbz";
  private static final String TEST_REAL_COMIC_METADATA_FILE = "target/test-classes/example.xml";
  private static final String TEST_MISSING_FILE = "farkle.png";
  private static final String TEST_EXISTING_FILE = "ComicInfo.xml";
  private static final String TEST_IMAGE_FILE = "src/test/resources/example.jpg";
  private static final byte[] TEST_IMAGE_DATA;
  private static final String TEST_RENAME_RULE = "PAGE-$INDEX";
  private static final String TEST_RENAMED_PAGE = "The renamed page filename";

  static {
    try {
      TEST_IMAGE_DATA = FileUtils.readFileToByteArray(new File(TEST_IMAGE_FILE));
    } catch (IOException error) {
      throw new RuntimeException(error);
    }
  }

  @InjectMocks private ComicBookAdaptor adaptor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ArchiveAdaptor readableArchiveAdaptor;
  @Mock private ArchiveAdaptor writeableArchiveAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicPage page;
  @Mock private ArchiveReadHandle readHandle;
  @Mock private ArchiveWriteHandle writeHandle;
  @Mock private ContentAdaptor contentAdaptor;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private ComicArchiveEntry archiveEntry;
  @Mock private ComicArchiveEntry archiveSubdirEntry;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ComicPageAdaptor comicPageAdaptor;
  @Mock private ComicMetadataWriter comicMetadataWriter;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private ContentAdaptorRules contentAdaptorRules;

  @Captor private ArgumentCaptor<File> moveSourceFile;
  @Captor private ArgumentCaptor<File> moveDestinationFile;
  @Captor private ArgumentCaptor<String> temporaryArchiveFile;
  @Captor private ArgumentCaptor<ArchiveReadHandle> archiveReadHandleArgumentCaptor;

  private File comicFile = new File(TEST_REAL_COMIC_FILE);
  private List<ComicArchiveEntry> archiveEntryList = new ArrayList<>();
  private List<ComicPage> pageList = new ArrayList<>();

  @BeforeEach
  void setUp()
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
    Mockito.when(
            fileTypeAdaptor.getContentAdaptorFor(Mockito.anyString(), Mockito.any(byte[].class)))
        .thenReturn(contentAdaptor);
    Mockito.when(archiveEntry.getFilename()).thenReturn(TEST_ENTRY_FILENAME);
    Mockito.when(archiveEntry.getSize()).thenReturn((long) TEST_ARCHIVE_ENTRY_CONTENT.length);
    Mockito.when(archiveSubdirEntry.getSize()).thenReturn(0L);

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
    Mockito.when(comicMetadataWriter.createContent(Mockito.any(ComicBook.class)))
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

  @Test
  void createComic_errorGettingArchiveAdaptor() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.createComic(TEST_COMIC_FILENAME));
  }

  @Test
  void createComic() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenReturn(readableArchiveAdaptor);
    Mockito.when(readableArchiveAdaptor.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);

    final ComicBook result = adaptor.createComic(TEST_COMIC_FILENAME);

    assertNotNull(result);
    assertEquals(TEST_COMIC_FILENAME, result.getComicDetail().getFilename());
    assertSame(TEST_ARCHIVE_TYPE, result.getComicDetail().getArchiveType());

    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_FILENAME);
  }

  @Test
  void load_getArchiveAdaptorThrowsException() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.load(comicBook, contentAdaptorRules));
  }

  @Test
  void load_openArchiveThrowsException() throws ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.load(comicBook, contentAdaptorRules));
  }

  @Test
  void load_getEntriesThrowsException() throws ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.load(comicBook, contentAdaptorRules));
  }

  @Test
  void load_readEntryThrowsException() throws ArchiveAdaptorException {

    archiveEntryList.add(archiveEntry);

    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.load(comicBook, contentAdaptorRules));
  }

  @Test
  void load_noAdaptorForContent() throws AdaptorException, ArchiveAdaptorException {

    archiveEntryList.add(archiveEntry);

    Mockito.when(
            fileTypeAdaptor.getContentAdaptorFor(Mockito.anyString(), Mockito.any(byte[].class)))
        .thenReturn(null);

    adaptor.load(comicBook, contentAdaptorRules);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1))
        .getContentAdaptorFor(TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
  }

  @Test
  void load_contentAdaptorThrowsException() throws ContentAdaptorException {

    archiveEntryList.add(archiveEntry);

    Mockito.doThrow(ContentAdaptorException.class)
        .when(contentAdaptor)
        .loadContent(
            Mockito.any(ComicBook.class),
            Mockito.anyString(),
            Mockito.any(byte[].class),
            Mockito.any(ContentAdaptorRules.class));

    assertThrows(AdaptorException.class, () -> adaptor.load(comicBook, contentAdaptorRules));
  }

  @Test
  void load_noContent() throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenReturn(new byte[0]);

    archiveEntryList.add(archiveEntry);

    adaptor.load(comicBook, contentAdaptorRules);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(contentAdaptor, Mockito.never())
        .loadContent(
            Mockito.any(ComicBook.class),
            Mockito.anyString(),
            Mockito.any(byte[].class),
            Mockito.any(ContentAdaptorRules.class));
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test
  void load() throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    archiveEntryList.add(archiveEntry);

    adaptor.load(comicBook, contentAdaptorRules);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1))
        .getContentAdaptorFor(TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
    Mockito.verify(contentAdaptor, Mockito.times(1))
        .loadContent(
            comicBook, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT, contentAdaptorRules);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test
  void load_comicWithSubdirs()
      throws AdaptorException, ArchiveAdaptorException, ContentAdaptorException {
    archiveEntryList.add(archiveSubdirEntry);
    archiveEntryList.add(archiveEntry);

    adaptor.load(comicBook, contentAdaptorRules);

    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .openArchiveForRead(TEST_COMIC_FILENAME);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).getEntries(readHandle);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1))
        .readEntry(readHandle, TEST_ENTRY_FILENAME);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1))
        .getContentAdaptorFor(TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT);
    Mockito.verify(contentAdaptor, Mockito.times(1))
        .loadContent(
            comicBook, TEST_ENTRY_FILENAME, TEST_ARCHIVE_ENTRY_CONTENT, contentAdaptorRules);
    Mockito.verify(readableArchiveAdaptor, Mockito.times(1)).closeArchiveForRead(readHandle);
  }

  @Test
  void save_exceptionOnGetReadArchiveType() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(TEST_COMIC_FILENAME))
        .thenThrow(AdaptorException.class);

    assertThrows(
        AdaptorException.class, () -> adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, ""));
  }

  @Test
  void save_exceptionOnOpenArchiveForRead() throws ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(
        AdaptorException.class, () -> adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, ""));
  }

  @Test
  void save_exceptionOnWriteComicInfo() throws ContentAdaptorException {
    Mockito.when(comicMetadataWriter.createContent(Mockito.any(ComicBook.class)))
        .thenThrow(ContentAdaptorException.class);

    assertThrows(
        AdaptorException.class, () -> adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, ""));
  }

  @Test
  void save() throws AdaptorException, ArchiveAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.when(readableArchiveAdaptor.getEntries(archiveReadHandleArgumentCaptor.capture()))
        .thenReturn(archiveEntryList);
    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenReturn(TEST_IMAGE_DATA);
    Mockito.when(fileTypeAdaptor.getContentAdaptorFor(Mockito.anyString(), Mockito.any()))
        .thenReturn(contentAdaptor);
    Mockito.when(contentAdaptor.getArchiveEntryType()).thenReturn(ArchiveEntryType.FILE);

    adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, "");

    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .writeEntry(writeHandle, TEST_ENTRY_FILENAME, TEST_IMAGE_DATA);
  }

  @Test
  void save_imageData() throws AdaptorException, ArchiveAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.when(readableArchiveAdaptor.getEntries(archiveReadHandleArgumentCaptor.capture()))
        .thenReturn(archiveEntryList);
    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenReturn(TEST_IMAGE_DATA);
    Mockito.when(fileTypeAdaptor.getContentAdaptorFor(Mockito.anyString(), Mockito.any()))
        .thenReturn(contentAdaptor);
    Mockito.when(contentAdaptor.getArchiveEntryType()).thenReturn(ArchiveEntryType.IMAGE);

    adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, "");

    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .writeEntry(writeHandle, TEST_ENTRY_FILENAME, TEST_IMAGE_DATA);
  }

  @Test
  void save_imageData_withRenameRule() throws AdaptorException, ArchiveAdaptorException {
    archiveEntryList.add(archiveEntry);

    Mockito.when(readableArchiveAdaptor.getEntries(archiveReadHandleArgumentCaptor.capture()))
        .thenReturn(archiveEntryList);
    Mockito.when(
            readableArchiveAdaptor.readEntry(
                Mockito.any(ArchiveReadHandle.class), Mockito.anyString()))
        .thenReturn(TEST_IMAGE_DATA);
    Mockito.when(fileTypeAdaptor.getContentAdaptorFor(Mockito.anyString(), Mockito.any()))
        .thenReturn(contentAdaptor);
    Mockito.when(contentAdaptor.getArchiveEntryType()).thenReturn(ArchiveEntryType.IMAGE);
    Mockito.when(
            comicPageAdaptor.createFilenameFromRule(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(TEST_RENAMED_PAGE);

    adaptor.save(comicBook, TEST_ARCHIVE_TYPE, false, TEST_RENAME_RULE);

    Mockito.verify(writeableArchiveAdaptor, Mockito.times(1))
        .writeEntry(writeHandle, TEST_RENAMED_PAGE, TEST_IMAGE_DATA);
  }

  @Test
  void saveMetadataFile_metadataAdaptorException() throws ContentAdaptorException {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_REAL_COMIC_FILE);

    Mockito.when(comicMetadataWriter.createContent(Mockito.any(ComicBook.class)))
        .thenThrow(ContentAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.saveMetadataFile(comicBook));
  }

  @Test
  void saveMetadataFile() throws ContentAdaptorException, AdaptorException {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_REAL_COMIC_FILE);

    Mockito.when(comicMetadataWriter.createContent(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_COMICINFO_XML_CONTENT);

    adaptor.saveMetadataFile(comicBook);

    assertTrue(new File(TEST_REAL_COMIC_METADATA_FILE).exists());

    Mockito.verify(comicMetadataWriter, Mockito.times(1)).createContent(comicBook);
  }

  @Test
  void loadPage_exceptionOnGetArchiveAdaptor() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.loadPageContent(comicBook, TEST_PAGE_INDEX));
  }

  @Test
  void loadPage_exceptionOnOpenArchive() throws ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.loadPageContent(comicBook, TEST_PAGE_INDEX));
  }

  @Test
  void loadPage() throws AdaptorException, ArchiveAdaptorException {
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

  @Test
  void loadCover_exceptionOnGetArchiveAdaptor() throws AdaptorException {
    Mockito.when(fileTypeAdaptor.getArchiveAdaptorFor(Mockito.anyString()))
        .thenThrow(AdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.loadCover(TEST_COMIC_FILENAME));
  }

  @Test
  void loadCover_exceptionOnOpen() throws ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.loadCover(TEST_COMIC_FILENAME));
  }

  @Test
  void loadCover_exceptionOnGetEntries() throws ArchiveAdaptorException {
    Mockito.when(readableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.loadCover(TEST_COMIC_FILENAME));
  }

  @Test
  void loadCover_noImages() throws AdaptorException, ArchiveAdaptorException {
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
  void loadCover() throws AdaptorException, ArchiveAdaptorException {
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

  @Test
  void loadFileArchive_adaptorException() throws ArchiveAdaptorException {
    Mockito.when(writeableArchiveAdaptor.openArchiveForRead(Mockito.anyString()))
        .thenReturn(readHandle);
    Mockito.when(writeableArchiveAdaptor.getEntries(Mockito.any(ArchiveReadHandle.class)))
        .thenThrow(ArchiveAdaptorException.class);

    assertThrows(AdaptorException.class, () -> adaptor.loadFile(comicBook, TEST_MISSING_FILE));
  }

  @Test
  void loadFile_notFound() throws AdaptorException, ArchiveAdaptorException {
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
  void loadFile() throws AdaptorException, ArchiveAdaptorException {
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

  @Test
  void sortPages() {
    adaptor.sortPages(comicBook);

    Mockito.verify(comicBook, Mockito.atLeast(pageList.size())).getPages();
  }
}
