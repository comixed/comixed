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

package org.comixed.task.runner;

import net.jodah.concurrentunit.ConcurrentTestCase;
import net.jodah.concurrentunit.Waiter;
import org.comixed.task.model.WorkerTask;
import org.comixed.task.model.WorkerTaskException;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeoutException;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:test-application.properties")
@Ignore // TODO get this working
public class WorkerTest
        extends ConcurrentTestCase {
    private static final int TEST_TASK_COUNT = 72;

    @InjectMocks private Worker worker;
    @Mock private WorkerListener workerListener;
    @Mock private WorkerTask workerTask;
    @Mock private BlockingQueue<WorkerTask> blockingQueue;
    @Mock private Map<Class<? extends WorkerTask>, Integer> taskCounts;
    @Mock private Object semaphore;

    @Before
    public void setUp() {
        worker.queue = blockingQueue;
        worker.taskCounts = taskCounts;
    }

    @Test
    public void testGetState() {
        worker.state = Worker.State.IDLE;

        assertSame(Worker.State.IDLE,
                   worker.getState());
    }

    @Test
    public void testGetIsQueueEmptyWhenNot()
            throws
            InterruptedException {
        Mockito.when(blockingQueue.isEmpty())
               .thenReturn(false);

        assertFalse(worker.isQueueEmpty());
    }

    @Test
    public void testGetIsQueueEmpty() {
        Mockito.when(blockingQueue.isEmpty())
               .thenReturn(true);

        assertTrue(worker.isQueueEmpty());
    }

    @Test
    public void testQueueSize() {
        Mockito.when(blockingQueue.size())
               .thenReturn(TEST_TASK_COUNT);

        assertEquals(TEST_TASK_COUNT,
                     worker.queueSize());

        Mockito.verify(blockingQueue,
                       Mockito.times(1))
               .size();
    }

    @Test
    public void testAddTaskToQueueRaisesException()
            throws
            InterruptedException {
        Mockito.doThrow(new InterruptedException())
               .when(blockingQueue)
               .put(Mockito.any(WorkerTask.class));

        worker.queue = blockingQueue;

        worker.addTasksToQueue(workerTask);

        Mockito.verify(blockingQueue,
                       Mockito.times(1))
               .put(workerTask);
    }

    @Test
    public void testAddTaskToQueueUpdatesExistingTaskCount() {
        Mockito.when(taskCounts.containsKey(Mockito.any(Class.class)))
               .thenReturn(true);
        Mockito.when(taskCounts.get(Mockito.any(Class.class)))
               .thenReturn(TEST_TASK_COUNT);
        Mockito.when(taskCounts.put(Mockito.any(),
                                    Mockito.anyInt()))
               .thenReturn(TEST_TASK_COUNT + 1);

        worker.addTasksToQueue(workerTask);

        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .containsKey(workerTask.getClass());
        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .get(workerTask.getClass());
        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .put(workerTask.getClass(),
                    TEST_TASK_COUNT + 1);
    }

    @Test
    public void testAddTaskToQueue() {
        Mockito.when(taskCounts.containsKey(Mockito.any(Class.class)))
               .thenReturn(false);
        Mockito.when(taskCounts.put(Mockito.any(),
                                    Mockito.anyInt()))
               .thenReturn(1);

        worker.addTasksToQueue(workerTask);

        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .containsKey(workerTask.getClass());
        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .put(workerTask.getClass(),
                    1);
    }

    // TODO fix test failures that have become non-deterministic after upgrading
    // @Test
    // public void testRunSleepsOnEmptyQueue() throws InterruptedException,
    // TimeoutException
    // {
    // Mockito.when(blockingQueue.isEmpty()).thenReturn(true);
    //
    // final Waiter waiter = new Waiter();
    //
    // new Thread(() ->
    // {
    // waiter.resume();
    // worker.run();
    // waiter.resume();
    // }).start();
    //
    // waiter.await();
    //
    // // pause a second to give run a chance to do something
    // Thread.sleep(1000);
    //
    // assertSame(Worker.State.IDLE, worker.getState());
    //
    // worker.stop();
    //
    // waiter.await(10000);
    //
    // Mockito.verify(blockingQueue, Mockito.atLeast(2)).isEmpty();
    // }

    @Test
    public void testRunProcessesTheQueue()
            throws
            InterruptedException,
            TimeoutException,
            WorkerTaskException {
        final Waiter waiter = new Waiter();
        worker.queue = new LinkedBlockingQueue<>();
        worker.taskCounts = new HashMap<>();

        WorkerTask shutdownTask = new WorkerTask() {
            @Override
            public void startTask()
                    throws
                    WorkerTaskException {
                assertSame(Worker.State.RUNNING,
                           WorkerTest.this.worker.getState());
                WorkerTest.this.worker.stop();
            }

            @Override
            public String getDescription() {
                return "This is a test task";
            }
        };
        worker.addTasksToQueue(shutdownTask);

        new Thread(() -> {
            waiter.resume();
            worker.run();
            waiter.resume();
        }).start();

        // wait for shutdownTask to run
        waiter.await(1000);

        // wait for stop to finish
        waiter.await(1000);
    }

    // TODO fix test failures that have become non-deterministic after upgrading
    // to Spring Boot 2.2.0
    // @Test
    // public void testRunProcessesRaisesException() throws
    // InterruptedException, TimeoutException, WorkerTaskException
    // {
    // final Waiter waiter = new Waiter();
    // worker.queue = new LinkedBlockingQueue<>();
    // worker.taskCounts = new HashMap<>();
    //
    // WorkerTask shutdownTask = new WorkerTask()
    // {
    // @Override
    // public void startTask() throws WorkerTaskException
    // {
    // assertNotSame(Worker.State.STOP, WorkerTest.this.worker.getState());
    // waiter.resume();
    // throw new WorkerTaskException("Expected failure");
    // }
    // };
    // worker.addTasksToQueue(shutdownTask);
    //
    // new Thread(() ->
    // {
    // waiter.resume();
    // worker.run();
    // waiter.resume();
    // }).start();
    //
    // // wait for shutdownTask to run
    // waiter.await(1000);
    //
    // // wait for stop to finish
    // waiter.await(1000);
    // }

    @Test
    public void testRun()
            throws
            InterruptedException,
            TimeoutException {
        final Waiter waiter = new Waiter();

        worker.addWorkerListener(new WorkerListener() {
            private boolean called = false;

            @Override
            public void queueChanged() {
            }

            @Override
            public void workerStateChanged() {
                if (!called) {
                    called = true;
                    assertEquals(Worker.State.RUNNING,
                                 worker.state);
                    worker.stop();
                }
            }
        });
        new Thread(() -> {
            worker.run();
            waiter.resume();
        }).start();

        waiter.await(1000);

        assertSame(Worker.State.STOP,
                   worker.state);
    }

    @Test
    public void testAddWorkerListener() {
        assertTrue(worker.listeners.isEmpty());
        worker.addWorkerListener(workerListener);
        assertFalse(worker.listeners.isEmpty());
    }

    @Test
    public void testFireQueueChangedEvent() {
        worker.addWorkerListener(workerListener);

        Mockito.doNothing()
               .when(workerListener)
               .queueChanged();

        worker.fireQueueChangedEvent();

        Mockito.verify(workerListener,
                       Mockito.times(1))
               .queueChanged();
    }

    @Test
    public void testGetCountForEmptyQueue() {
        Mockito.when(blockingQueue.isEmpty())
               .thenReturn(true);

        assertEquals(0,
                     worker.getCountFor(workerTask.getClass()));

        Mockito.verify(blockingQueue,
                       Mockito.times(1))
               .isEmpty();
    }

    @Test
    public void testGetCountForNonexistentWorkerTask() {
        Mockito.when(blockingQueue.isEmpty())
               .thenReturn(false);
        Mockito.when(taskCounts.containsKey(Mockito.any()))
               .thenReturn(false);

        assertEquals(0,
                     worker.getCountFor(workerTask.getClass()));

        Mockito.verify(blockingQueue,
                       Mockito.times(1))
               .isEmpty();
        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .containsKey(workerTask.getClass());
    }

    @Test
    public void testGetCountFor() {
        Mockito.when(blockingQueue.isEmpty())
               .thenReturn(false);
        Mockito.when(taskCounts.containsKey(Mockito.any()))
               .thenReturn(true);
        Mockito.when(taskCounts.get(Mockito.any()))
               .thenReturn(TEST_TASK_COUNT);

        assertEquals(TEST_TASK_COUNT,
                     worker.getCountFor(workerTask.getClass()));

        Mockito.verify(blockingQueue,
                       Mockito.times(1))
               .isEmpty();
        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .containsKey(workerTask.getClass());
        Mockito.verify(taskCounts,
                       Mockito.times(1))
               .get(workerTask.getClass());
    }
}
