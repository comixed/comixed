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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeoutException;

import org.comixed.adaptors.StatusAdaptor;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import net.jodah.concurrentunit.ConcurrentTestCase;
import net.jodah.concurrentunit.Waiter;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:test-application.properties")
public class WorkerTest extends ConcurrentTestCase
{
    class TestingWorkerTask extends AbstractWorkerTask
    {
        @Override
        public void startTask() throws WorkerTaskException
        {}
    }

    @InjectMocks
    private Worker worker;

    @Mock
    private StatusAdaptor statusAdaptor;

    @Mock
    private WorkerListener workerListener;

    @Test
    public void testStartsAsIdle()
    {
        assertSame(Worker.State.IDLE, worker.state);
    }

    @Test
    public void testStartAndStopWorker() throws InterruptedException, TimeoutException
    {
        final Waiter waiter = new Waiter();

        worker.addWorkerListener(new WorkerListener()
        {
            private boolean called = false;

            @Override
            public void queueChanged()
            {}

            @Override
            public void workerStateChanged()
            {
                if (!called)
                {
                    called = true;
                    assertEquals(Worker.State.RUNNING, worker.state);
                    worker.stop();
                }
            }
        });
        new Thread(() ->
        {
            worker.run();
            waiter.resume();
        }).start();

        waiter.await(1000);

        assertSame(Worker.State.STOP, worker.state);
    }

    @Test
    public void testAddWorkerListener()
    {
        assertTrue(worker.listeners.isEmpty());
        worker.addWorkerListener(workerListener);
        assertFalse(worker.listeners.isEmpty());
    }

    @Test
    public void testFireQueueChangedEvent()
    {
        worker.addWorkerListener(workerListener);

        Mockito.doNothing().when(workerListener).queueChanged();

        worker.fireQueueChangedEvent();

        Mockito.verify(workerListener, Mockito.times(1)).queueChanged();
    }

    @Test
    public void testGetCountForEmptyQueue()
    {
        assertEquals(0, worker.getCountFor(AddComicWorkerTask.class));
    }

    @Test
    public void testGetCountFor()
    {
        int count = ThreadLocalRandom.current().nextInt(25);

        for (int index = 0;
             index < count;
             index++)
        {
            worker.addTasksToQueue(new TestingWorkerTask());
        }

        assertEquals(count, worker.getCountFor(TestingWorkerTask.class));
    }
}
