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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.importer;

import org.comixed.importer.adaptors.ComicFileImportAdaptor;
import org.comixed.importer.adaptors.ComicRackBackupAdaptor;
import org.comixed.importer.adaptors.ImportAdaptorException;
import org.comixed.library.model.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ImportFileProcessorTest {
    private static final String TEST_SOURCE_FILENAME = "src/test/resources/comicrack-backup.xml";

    @InjectMocks
    private ImportFileProcessor processor;

    @Mock
    private ComicRackBackupAdaptor comicRackBackupAdaptor;

    @Captor
    private ArgumentCaptor<File> fileCaptor;

    @Mock
    private ComicFileImportAdaptor importAdaptor;

    private List<Comic> comicList = new ArrayList<>();

    @Test(expected = ProcessorException.class)
    public void testProcessNullFile() throws ProcessorException {
        this.processor.process(null);
    }

    @Test(expected = ProcessorException.class)
    public void testProcessFileNotFound() throws ProcessorException {
        this.processor.process(TEST_SOURCE_FILENAME.substring(1));
    }

    @Test(expected = ProcessorException.class)
    public void testProcessSourceIsDirectory() throws ProcessorException {
        this.processor.process("src/test/resources");
    }

    @Test(expected = ProcessorException.class)
    public void testProcessComicRackAdaptorThrowsException() throws ProcessorException, ImportAdaptorException {
        Mockito.when(comicRackBackupAdaptor.load(Mockito.any()))
                .thenThrow(ImportAdaptorException.class);

        try {
            this.processor.process(TEST_SOURCE_FILENAME);
        } finally {
            Mockito.verify(comicRackBackupAdaptor, Mockito.times(1))
                    .load(fileCaptor.capture());
        }
    }

    @Test(expected = ProcessorException.class)
    public void testProcessComicFileImporterThrowsException() throws ImportAdaptorException, ProcessorException {
        Mockito.when(comicRackBackupAdaptor.load(Mockito.any()))
                .thenReturn(comicList);
        Mockito.doThrow(ImportAdaptorException.class)
                .when(importAdaptor)
                .importComics(Mockito.anyList(), Mockito.anyList());

        try {
            this.processor.process(TEST_SOURCE_FILENAME);
        } finally {
            Mockito.verify(comicRackBackupAdaptor, Mockito.times(1))
                    .load(fileCaptor.capture());
            Mockito.verify(importAdaptor, Mockito.times(1))
                    .importComics(comicList, this.processor.replacements);
        }
    }

    @Test
    public void testProcess() throws ImportAdaptorException, ProcessorException {
        Mockito.when(comicRackBackupAdaptor.load(Mockito.any()))
                .thenReturn(comicList);
        Mockito.doNothing()
                .when(importAdaptor)
                .importComics(Mockito.anyList(), Mockito.anyList());

        this.processor.process(TEST_SOURCE_FILENAME);

        Mockito.verify(comicRackBackupAdaptor, Mockito.times(1))
                .load(fileCaptor.capture());
        Mockito.verify(importAdaptor, Mockito.times(1))
                .importComics(comicList, this.processor.replacements);
    }
}