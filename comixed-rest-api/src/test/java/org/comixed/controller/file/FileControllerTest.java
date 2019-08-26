/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.controller.file;

import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.file.FileDetails;
import org.comixed.net.ImportComicFilesResponse;
import org.comixed.net.ImportRequestBody;
import org.comixed.service.file.FileService;
import org.json.JSONException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class FileControllerTest {
    private static final String COVER_IMAGE_FILENAME = "coverimage.png";
    private static final String COMIC_ARCHIVE = "testcomic.cbz";
    private static final byte[] IMAGE_CONTENT = new byte[65535];
    private static final String TEST_FILE = "src/test/resources/example.cbz";
    private static final String TEST_DIRECTORY = "src/test";
    private static final String[] TEST_FILENAMES = new String[]{"First.cbz",
                                                                "Second.cbz",
                                                                "Third.cbr",
                                                                "Fourth.cb7"};
    private static final int TEST_IMPORT_STATUS = 129;

    @InjectMocks private FileController controller;
    @Mock private FileService fileService;
    @Mock private List<FileDetails> fileDetailsList;

    @Test
    public void testGetImportFileCover()
            throws
            ComicFileHandlerException,
            ArchiveAdaptorException {
        Mockito.when(fileService.getImportFileCover(Mockito.anyString()))
               .thenReturn(IMAGE_CONTENT);

        final byte[] result = controller.getImportFileCover(COMIC_ARCHIVE);

        assertNotNull(result);
        assertEquals(IMAGE_CONTENT,
                     result);

        Mockito.verify(fileService,
                       Mockito.times(1))
               .getImportFileCover(COMIC_ARCHIVE);
    }

    @Test
    public void testGetAllComicsUnder()
            throws
            IOException,
            JSONException {
        Mockito.when(fileService.getAllComicsUnder(Mockito.anyString()))
               .thenReturn(fileDetailsList);

        final List<FileDetails> result = controller.getAllComicsUnder(TEST_DIRECTORY);

        assertNotNull(result);
        assertSame(fileDetailsList,
                   result);

        Mockito.verify(fileService,
                       Mockito.times(1))
               .getAllComicsUnder(TEST_DIRECTORY);
    }

    @Test
    public void testGetImportStatus()
            throws
            NoSuchAlgorithmException,
            InterruptedException {
        Mockito.when(fileService.getImportStatus())
               .thenReturn(TEST_IMPORT_STATUS);

        final int result = controller.getImportStatus();

        assertEquals(TEST_IMPORT_STATUS,
                     result);
    }

    @Test
    public void testImportComicFiles()
            throws
            UnsupportedEncodingException {
        Mockito.when(fileService.importComicFiles(Mockito.any(String[].class),
                                                  Mockito.anyBoolean(),
                                                  Mockito.anyBoolean()))
               .thenReturn(TEST_FILENAMES.length);

        final ImportComicFilesResponse result = controller.importComicFiles(new ImportRequestBody(TEST_FILENAMES,
                                                                                                  false,
                                                                                                  false));

        assertEquals(TEST_FILENAMES.length,
                     result.getImportComicCount());

        Mockito.verify(fileService,
                       Mockito.times(1))
               .importComicFiles(TEST_FILENAMES,
                                 false,
                                 false);
    }
}
