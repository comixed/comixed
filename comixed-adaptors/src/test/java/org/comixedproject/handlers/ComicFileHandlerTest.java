/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.handlers;

import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;

import java.io.InputStream;
import java.util.Map;
import org.comixedproject.adaptors.ComicDataAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.utils.FileTypeIdentifier;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicFileHandlerTest {
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_COMIC_FILE_TYPE = "zip";
  private static final String TEST_NON_ARCHIVE_FILENAME = "src/test/resources/example.jpg";

  @InjectMocks private ComicFileHandler handler;
  @Mock private FileTypeIdentifier identifier;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<InputStream> input;
  @Mock private Map<String, ArchiveAdaptor> archiveAdaptors;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ComicDataAdaptor comicDataAdaptor;
  @Mock private ArchiveType archiveType;

  @Test
  public void testLoadComicFileNotFound() throws ComicFileHandlerException {
    Mockito.when(comic.isMissing()).thenReturn(true);

    handler.loadComic(comic);

    Mockito.verify(comic, Mockito.times(1)).isMissing();
  }

  @Test(expected = ComicFileHandlerException.class)
  public void testLoadComicArchiveAdaptorException()
      throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(identifier.subtypeFor(Mockito.any(InputStream.class)))
        .thenReturn(TEST_COMIC_FILE_TYPE);
    Mockito.when(archiveAdaptors.get(Mockito.anyString())).thenReturn(archiveAdaptor);
    Mockito.doThrow(ArchiveAdaptorException.class)
        .when(archiveAdaptor)
        .loadComic(Mockito.any(Comic.class));

    try {
      handler.loadComic(comic);
    } finally {
      Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
      Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
    }
  }

  @Test
  public void testLoadComic() throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(identifier.subtypeFor(Mockito.any(InputStream.class)))
        .thenReturn(TEST_COMIC_FILE_TYPE);
    Mockito.when(archiveAdaptors.get(Mockito.anyString())).thenReturn(archiveAdaptor);
    Mockito.doNothing().when(archiveAdaptor).loadComic(Mockito.any(Comic.class));

    handler.loadComic(comic);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
  }

  @Test
  public void testLoadComicAndIgnoreComicInfoXml()
      throws ComicFileHandlerException, ArchiveAdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(identifier.subtypeFor(Mockito.any(InputStream.class)))
        .thenReturn(TEST_COMIC_FILE_TYPE);
    Mockito.when(archiveAdaptors.get(Mockito.anyString())).thenReturn(archiveAdaptor);
    Mockito.doNothing().when(archiveAdaptor).loadComic(Mockito.any(Comic.class));
    Mockito.doNothing().when(comicDataAdaptor).clear(Mockito.any(Comic.class));

    handler.loadComic(comic, true);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comicDataAdaptor, Mockito.times(1)).clear(comic);
  }

  @Test
  public void testGetArchiveAdaptorForUnknownComicType() throws ComicFileHandlerException {
    Mockito.when(identifier.subtypeFor(Mockito.any(InputStream.class)))
        .thenReturn(TEST_COMIC_FILE_TYPE);

    assertNull(handler.getArchiveAdaptorFor(TEST_NON_ARCHIVE_FILENAME));

    Mockito.verify(identifier, Mockito.times(1)).subtypeFor(Mockito.any(InputStream.class));
  }

  @Test
  public void testGetArchiveAdaptorFor() throws ComicFileHandlerException {
    Mockito.when(identifier.subtypeFor(Mockito.any(InputStream.class)))
        .thenReturn(TEST_COMIC_FILE_TYPE);
    Mockito.when(archiveAdaptors.get(Mockito.anyString())).thenReturn(archiveAdaptor);

    assertSame(archiveAdaptor, handler.getArchiveAdaptorFor(TEST_NON_ARCHIVE_FILENAME));

    Mockito.verify(identifier, Mockito.times(1)).subtypeFor(Mockito.any(InputStream.class));
    Mockito.verify(archiveAdaptors, Mockito.times(1)).get(TEST_COMIC_FILE_TYPE);
  }
}
