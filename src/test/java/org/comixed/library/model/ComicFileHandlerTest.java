/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

package org.comixed.library.model;

import java.io.InputStream;
import java.util.Map;

import org.comixed.library.adaptors.ArchiveAdaptor;
import org.comixed.library.adaptors.ArchiveAdaptorException;
import org.comixed.library.utils.FileTypeIdentifier;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicFileHandlerTest
{
    private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
    private static final String TEST_COMIC_FILE_TYPE = "zip";

    @InjectMocks
    private ComicFileHandler handler;

    @Mock
    private FileTypeIdentifier identifier;

    @Mock
    private Comic comic;

    @Captor
    private ArgumentCaptor<InputStream> input;

    @Mock
    private Map<String,
                ArchiveAdaptor> archiveAdaptors;

    @Mock
    private ArchiveAdaptor archiveAdaptor;

    @Before
    public void setUp() throws Exception
    {}

    @Test(expected = ComicFileHandlerException.class)
    public void testLoadComicUnknownType() throws ComicFileHandlerException
    {
        Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
        Mockito.when(identifier.typeFor(Mockito.any(InputStream.class))).thenReturn(null);

        handler.loadComic(comic);

        Mockito.verify(comic, Mockito.times(1)).getFilename();
        Mockito.verify(identifier, Mockito.times(1)).typeFor(input.capture());
    }

    @Test
    public void testLoadComicFileNotFound() throws ComicFileHandlerException
    {
        Mockito.when(comic.isMissing()).thenReturn(true);

        handler.loadComic(comic);

        Mockito.verify(comic, Mockito.times(1)).isMissing();
    }

    @Test(expected = ComicFileHandlerException.class)
    public void testLoadComicNoDefinedArchiveAdaptor() throws ComicFileHandlerException, ArchiveAdaptorException
    {
        Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
        Mockito.when(identifier.typeFor(Mockito.any(InputStream.class))).thenReturn(TEST_COMIC_FILE_TYPE);
        Mockito.when(archiveAdaptors.get(Mockito.anyString())).thenReturn(null);

        try
        {
            handler.loadComic(comic);
        }
        finally
        {
            Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
            Mockito.verify(identifier, Mockito.times(1)).typeFor(input.capture());
            Mockito.verify(archiveAdaptors, Mockito.times(1)).get(TEST_COMIC_FILE_TYPE);
        }
    }

    @Test(expected = ComicFileHandlerException.class)
    public void testLoadComicArchiveAdaptorException() throws ComicFileHandlerException, ArchiveAdaptorException
    {
        Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
        Mockito.when(identifier.typeFor(Mockito.any(InputStream.class))).thenReturn(TEST_COMIC_FILE_TYPE);
        Mockito.when(archiveAdaptors.get(Mockito.anyString())).thenReturn(archiveAdaptor);
        Mockito.doThrow(ArchiveAdaptorException.class).when(archiveAdaptor).loadComic(Mockito.any(Comic.class));

        try
        {
            handler.loadComic(comic);
        }
        finally
        {
            Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
            Mockito.verify(identifier, Mockito.times(1)).typeFor(input.capture());
            Mockito.verify(archiveAdaptors, Mockito.times(1)).get(TEST_COMIC_FILE_TYPE);
            Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
        }
    }

    @Test
    public void testLoadComic() throws ComicFileHandlerException, ArchiveAdaptorException
    {
        Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
        Mockito.when(identifier.typeFor(Mockito.any(InputStream.class))).thenReturn(TEST_COMIC_FILE_TYPE);
        Mockito.when(archiveAdaptors.get(Mockito.anyString())).thenReturn(archiveAdaptor);
        Mockito.doNothing().when(archiveAdaptor).loadComic(Mockito.any(Comic.class));

        handler.loadComic(comic);

        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
        Mockito.verify(identifier, Mockito.times(1)).typeFor(input.capture());
        Mockito.verify(archiveAdaptors, Mockito.times(1)).get(TEST_COMIC_FILE_TYPE);
        Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
    }
}
