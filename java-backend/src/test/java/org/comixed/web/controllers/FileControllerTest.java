/*
 * ComixEd - A digital comic book library management application.
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

package org.comixed.web.controllers;

import static org.junit.Assert.assertEquals;

import org.comixed.library.adaptors.ArchiveAdaptor;
import org.comixed.library.adaptors.ArchiveAdaptorException;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class FileControllerTest
{
    private static final String COVER_IMAGE_FILENAME = "coverimage.png";
    private static final String COMIC_ARCHIVE = "testcomic.cbz";
    private static final byte[] IMAGE_CONTENT = new byte[65535];

    @InjectMocks
    private FileController controller;

    @Mock
    private ComicFileHandler comicFileHandler;

    @Mock
    private ArchiveAdaptor archiveAdaptor;

    @Test
    public void testGetImageFromFile()
    {}

    @Test
    public void testGetImportFileCover() throws ComicFileHandlerException, ArchiveAdaptorException
    {
        Mockito.when(comicFileHandler.getArchiveAdaptorFor(COMIC_ARCHIVE)).thenReturn(archiveAdaptor);
        Mockito.when(archiveAdaptor.getFirstImageFileName(COMIC_ARCHIVE)).thenReturn(COVER_IMAGE_FILENAME);
        Mockito.when(archiveAdaptor.loadSingleFile(COMIC_ARCHIVE, COVER_IMAGE_FILENAME)).thenReturn(IMAGE_CONTENT);

        assertEquals(IMAGE_CONTENT, controller.getImportFileCover(COMIC_ARCHIVE));

        Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor, Mockito.times(1)).getFirstImageFileName(COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor, Mockito.times(1)).loadSingleFile(COMIC_ARCHIVE, COVER_IMAGE_FILENAME);
    }
}
