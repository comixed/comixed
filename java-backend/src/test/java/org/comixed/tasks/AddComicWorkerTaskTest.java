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

package org.comixed.tasks;

import java.io.File;

import org.comixed.adaptors.StatusAdaptor;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.repositories.ComicRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class AddComicWorkerTaskTest
{
    private static final String TEST_CBZ_FILE = "src/test/resources/example.cbz";

    @InjectMocks
    private AddComicWorkerTask task;

    @Mock
    private MessageSource messageSource;

    @Mock
    private StatusAdaptor statusAdaptor;

    @Mock
    private ComicFileHandler comicFileHandler;

    @Mock
    private ComicRepository comicRepository;

    @Captor
    private ArgumentCaptor<Comic> comic;

    @Mock
    private ComicSelectionModel comicSelectionModel;

    @Test
    public void testAddFile() throws WorkerTaskException, ComicFileHandlerException
    {
        Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
        Mockito.doNothing().when(comicSelectionModel).reload();
        Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(Mockito.any(Comic.class));

        File file = new File(TEST_CBZ_FILE);

        task.file = file;
        task.startTask();

        Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic.capture());
        Mockito.verify(comicRepository, Mockito.times(1)).save(comic.capture());
        Mockito.verify(comicSelectionModel, Mockito.times(1)).reload();
    }

    @Test(expected = WorkerTaskException.class)
    public void testAddFileComicFileHandlerException() throws ComicFileHandlerException, WorkerTaskException
    {
        Mockito.doThrow(ComicFileHandlerException.class).when(comicFileHandler).loadComic(Mockito.any(Comic.class));

        try
        {
            File file = new File(TEST_CBZ_FILE);

            task.file = file;
            task.startTask();
        }
        finally
        {
            Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic.capture());
        }
    }
}
