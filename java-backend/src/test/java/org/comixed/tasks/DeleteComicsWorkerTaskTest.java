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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.tasks;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.comixed.library.model.Comic;
import org.comixed.repositories.ComicRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(PowerMockRunner.class)
@PrepareForTest(FileUtils.class)
@SpringBootTest
public class DeleteComicsWorkerTaskTest
{
    private static final String TEST_FILENAME = "/Users/comixed/Comics/comic.cbz";

    @InjectMocks
    private DeleteComicsWorkerTask workerTask;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private List<Comic> comicList;

    @Mock
    private Comic comic;

    @Captor
    private ArgumentCaptor<File> file;

    @Before
    public void setUp()
    {
        workerTask.setComics(comicList);
        workerTask.setDeleteFiles(true);
    }

    @Test
    public void testStartTaskDontDeleteFiles() throws WorkerTaskException
    {
        Mockito.when(comicList.size()).thenReturn(1);
        Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);
        Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));

        workerTask.setDeleteFiles(false);
        workerTask.startTask();

        Mockito.verify(comicList, Mockito.atLeast(2)).size();
        Mockito.verify(comicList, Mockito.times(1)).get(0);
        Mockito.verify(comicRepository, Mockito.times(1)).delete(comic);
    }

    @Test
    public void testStartTaskDeleteFilesRaisesException() throws IOException, WorkerTaskException
    {
        Mockito.when(comicList.size()).thenReturn(1);
        Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);
        Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);
        PowerMockito.mockStatic(FileUtils.class);
        PowerMockito.doThrow(new IOException("Expected")).when(FileUtils.class);
        FileUtils.forceDelete(Mockito.any(File.class));

        workerTask.startTask();

        Mockito.verify(comicList, Mockito.atLeast(2)).size();
        Mockito.verify(comicList, Mockito.times(1)).get(0);
        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
        PowerMockito.verifyStatic(FileUtils.class, Mockito.times(1));
        FileUtils.forceDelete(file.capture());
        Mockito.verify(comicRepository, Mockito.times(1)).delete(comic);
    }

    @Test
    public void testStartTask() throws IOException, WorkerTaskException
    {
        Mockito.when(comicList.size()).thenReturn(1);
        Mockito.when(comicList.get(Mockito.anyInt())).thenReturn(comic);
        Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);
        PowerMockito.mockStatic(FileUtils.class);
        PowerMockito.doNothing().when(FileUtils.class);
        FileUtils.forceDelete(Mockito.any(File.class));

        workerTask.startTask();

        Mockito.verify(comicList, Mockito.atLeast(2)).size();
        Mockito.verify(comicList, Mockito.times(1)).get(0);
        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
        PowerMockito.verifyStatic(FileUtils.class, Mockito.times(1));
        FileUtils.forceDelete(file.capture());
        Mockito.verify(comicRepository, Mockito.times(1)).delete(comic);
    }
}
