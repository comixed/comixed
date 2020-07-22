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

package org.comixedproject.importer.adaptors;

import static org.junit.Assert.assertEquals;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.importer.PathReplacement;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.comic.ComicRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicFileImportAdaptorTest {
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_REPLACEMENT_FILENAME =
      "src/test/resources/replacement/example.cbz";

  @InjectMocks private ComicFileImportAdaptor adaptor;

  @Mock private ComicRepository comicRepository;

  @Mock private ComicFileHandler comicFileHandler;

  @Mock private PathReplacement pathReplacement;

  @Mock private PathReplacement unusedPathReplacement;

  private List<PathReplacement> pathReplacements = new ArrayList<>();

  private Comic comic = new Comic();

  private ComiXedUser importUser = new ComiXedUser();

  private Map<String, String> currentPages = new HashMap<>();

  @Before
  public void setUp() {
    comic.setFilename(TEST_COMIC_FILENAME);
    this.pathReplacements.add(this.pathReplacement);
    this.pathReplacements.add(this.unusedPathReplacement);
  }

  @Test
  public void testVerifyPathNoReplacement() {
    Mockito.when(pathReplacement.isMatch(Mockito.anyString())).thenReturn(false);

    this.adaptor.verifyPath(comic, pathReplacements);

    assertEquals(TEST_COMIC_FILENAME, comic.getFilename());

    Mockito.verify(pathReplacement, Mockito.times(1)).isMatch(TEST_COMIC_FILENAME);
  }

  @Test
  public void testVerifyPath() {
    Mockito.when(pathReplacement.isMatch(Mockito.anyString())).thenReturn(true);
    Mockito.when(pathReplacement.getReplacement(Mockito.anyString()))
        .thenReturn(TEST_REPLACEMENT_FILENAME);

    this.adaptor.verifyPath(comic, pathReplacements);

    assertEquals(TEST_REPLACEMENT_FILENAME, comic.getFilename());

    Mockito.verify(pathReplacement, Mockito.times(1)).isMatch(TEST_COMIC_FILENAME);
    Mockito.verify(pathReplacement, Mockito.times(1)).getReplacement(TEST_COMIC_FILENAME);
  }

  @Test
  public void testImportComicAlreadyInDatabase()
      throws FileNotFoundException, ComicFileHandlerException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(comic);

    this.adaptor.importComic(comic, this.pathReplacements, this.currentPages, this.importUser);

    Mockito.verify(comicRepository, Mockito.times(1)).findByFilename(comic.getFilename());
  }

  @Test(expected = FileNotFoundException.class)
  public void testImportComicFileIsMissing()
      throws FileNotFoundException, ComicFileHandlerException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);

    comic.setFilename(TEST_COMIC_FILENAME.substring(1));

    try {
      this.adaptor.importComic(comic, this.pathReplacements, this.currentPages, this.importUser);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).findByFilename(comic.getFilename());
    }
  }

  @Test
  public void testImportComicFile() throws ComicFileHandlerException, FileNotFoundException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

    this.adaptor.importComic(comic, this.pathReplacements, this.currentPages, this.importUser);

    Mockito.verify(comicRepository, Mockito.times(1)).findByFilename(comic.getFilename());
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }
}
