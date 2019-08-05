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

import org.apache.commons.lang.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:test-application.properties")
@SpringBootTest
public class QueueComicsWorkerTaskTest {
    @InjectMocks private QueueComicsWorkerTask task;
    @Mock private Worker worker;
    @Mock private ObjectFactory<AddComicWorkerTask> addComicTaskFactory;
    @Mock private AddComicWorkerTask addComicTask;

    private List<String> filenames;

    @Before
    public void setUp() {
        filenames = new ArrayList<>();

        for (int index = 0;
             index < 1000;
             index++) {
            filenames.add(RandomStringUtils.random(128,
                                                   true,
                                                   true));
        }
    }

    @Test
    public void testAddFiles() {
        task.setFilenames(filenames);

        assertFalse(task.filenames.isEmpty());
        for (String filename : filenames) {
            assertTrue(task.filenames.contains(filename));
        }
    }

    @Test
    public void testAddFilesAndDeleteBlockedPages() {
        task.setFilenames(filenames);
        task.setDeleteBlockedPages(true);

        assertFalse(task.filenames.isEmpty());
        for (String filename : filenames) {
            assertTrue(task.filenames.contains(filename));
        }
        assertTrue(task.deleteBlockedPages);
    }

    @Test
    public void testAddFilesAndIgnoreComicInfoXml() {
        task.setFilenames(filenames);
        task.setIgnoreMetadata(true);

        assertFalse(task.filenames.isEmpty());
        for (String filename : filenames) {
            assertTrue(task.filenames.contains(filename));
        }
        assertTrue(task.ignoreMetadata);
    }

    @Test
    public void testStartTask()
            throws
            WorkerTaskException {
        Mockito.doNothing()
               .when(worker)
               .addTasksToQueue(Mockito.any(AddComicWorkerTask.class));
        Mockito.when(addComicTaskFactory.getObject())
               .thenReturn(addComicTask);
        Mockito.doNothing()
               .when(addComicTask)
               .setDeleteBlockedPages(false);

        task.filenames = filenames;

        task.startTask();

        Mockito.verify(worker,
                       Mockito.times(filenames.size()))
               .addTasksToQueue(addComicTask);
        Mockito.verify(addComicTask,
                       Mockito.times(filenames.size()))
               .setFile(Mockito.any(File.class));
        Mockito.verify(addComicTask,
                       Mockito.times(filenames.size()))
               .setDeleteBlockedPages(false);
    }

    @Test
    public void testStartTaskAndDeleteBlockedPages()
            throws
            WorkerTaskException {
        Mockito.doNothing()
               .when(worker)
               .addTasksToQueue(Mockito.any(AddComicWorkerTask.class));
        Mockito.when(addComicTaskFactory.getObject())
               .thenReturn(addComicTask);
        Mockito.doNothing()
               .when(addComicTask)
               .setDeleteBlockedPages(true);

        task.filenames = filenames;
        task.deleteBlockedPages = true;

        task.startTask();

        Mockito.verify(worker,
                       Mockito.times(filenames.size()))
               .addTasksToQueue(addComicTask);
        Mockito.verify(addComicTask,
                       Mockito.times(filenames.size()))
               .setFile(Mockito.any(File.class));
        Mockito.verify(addComicTask,
                       Mockito.times(filenames.size()))
               .setDeleteBlockedPages(true);
    }

    @Test
    public void testStartTaskAndIgnoreComicInfoXml()
            throws
            WorkerTaskException {
        Mockito.doNothing()
               .when(worker)
               .addTasksToQueue(Mockito.any(AddComicWorkerTask.class));
        Mockito.when(addComicTaskFactory.getObject())
               .thenReturn(addComicTask);
        Mockito.doNothing()
               .when(addComicTask)
               .setIgnoreMetadata(true);

        task.filenames = filenames;
        task.ignoreMetadata = true;

        task.startTask();

        Mockito.verify(worker,
                       Mockito.times(filenames.size()))
               .addTasksToQueue(addComicTask);
        Mockito.verify(addComicTask,
                       Mockito.times(filenames.size()))
               .setFile(Mockito.any(File.class));
        Mockito.verify(addComicTask,
                       Mockito.times(filenames.size()))
               .setIgnoreMetadata(true);
    }
}
