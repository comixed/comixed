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

package org.comixedproject.service.file;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.util.List;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.file.FileDetails;
import org.comixedproject.repositories.comic.ComicRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class FileServiceTest {
  private static final String TEST_ARCHIVE_FILENAME = "example.cbz";
  private static final String TEST_COVER_FILENAME = "cover_image.jpg";
  private static final byte[] TEST_COVER_CONTENT = "this is image data".getBytes();
  private static final String TEST_ROOT_DIRECTORY = "src/test/resources";
  private static final String TEST_COMIC_ARCHIVE =
      TEST_ROOT_DIRECTORY + "/" + TEST_ARCHIVE_FILENAME;
  private static final String[] TEST_FILENAMES =
      new String[] {"First.cbz", "Second.cbz", "Third.cbr", "Fourth.cb7"};
  private static final Integer TEST_LIMIT = 2;
  private static final Integer TEST_NO_LIMIT = -1;

  @InjectMocks private FileService service;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ComicRepository comicRepository;
  @Mock private Comic comic;

  @Test
  public void testGetImportFileCoverWithNoHandler()
      throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.anyString())).thenReturn(null);

    assertNull(service.getImportFileCover(TEST_COMIC_ARCHIVE));

    Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_ARCHIVE);
  }

  @Test
  public void testGetImportFileCoverWithNoCover()
      throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.anyString()))
        .thenReturn(archiveAdaptor);
    Mockito.when(archiveAdaptor.getFirstImageFileName(Mockito.anyString())).thenReturn(null);

    assertNull(service.getImportFileCover(TEST_COMIC_ARCHIVE));

    Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_ARCHIVE);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).getFirstImageFileName(TEST_COMIC_ARCHIVE);
  }

  @Test
  public void testGetImportFileCover() throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.anyString()))
        .thenReturn(archiveAdaptor);
    Mockito.when(archiveAdaptor.getFirstImageFileName(Mockito.anyString()))
        .thenReturn(TEST_COVER_FILENAME);
    Mockito.when(archiveAdaptor.loadSingleFile(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_COVER_CONTENT);

    final byte[] result = service.getImportFileCover(TEST_COMIC_ARCHIVE);

    assertNotNull(result);
    assertEquals(TEST_COVER_CONTENT, result);

    Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(TEST_COMIC_ARCHIVE);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).getFirstImageFileName(TEST_COMIC_ARCHIVE);
    Mockito.verify(archiveAdaptor, Mockito.times(1))
        .loadSingleFile(TEST_COMIC_ARCHIVE, TEST_COVER_FILENAME);
  }

  @Test
  public void testGetAllComicsUnderInvalidDirectory() throws IOException {
    final List<FileDetails> result =
        service.getAllComicsUnder(TEST_ROOT_DIRECTORY + "/nonexistent", TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetAllComicsUnderWithFileSupplied() throws IOException {
    final List<FileDetails> result = service.getAllComicsUnder(TEST_COMIC_ARCHIVE, TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetAllComicsAlreadyImported() throws IOException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(comic);

    final List<FileDetails> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_LIMIT);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(comicRepository, Mockito.times(1))
        .findByFilename(new File(TEST_COMIC_ARCHIVE).getCanonicalPath());
  }

  @Test
  public void testGetAllComicsUnderWithLimit() throws IOException {
    final List<FileDetails> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_LIMIT);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_LIMIT.intValue(), result.size());
  }

  @Test
  public void testGetAllComicsUnder() throws IOException {
    final List<FileDetails> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY, TEST_NO_LIMIT);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(3, result.size());
  }
}
