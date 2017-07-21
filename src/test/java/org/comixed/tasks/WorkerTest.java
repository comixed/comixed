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

import static org.junit.Assert.assertSame;

import java.util.concurrent.TimeoutException;

import org.comixed.adaptors.StatusAdaptor;
import org.junit.After;
import org.junit.Before;
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
    @InjectMocks
    private Worker worker;

    @Mock
    private StatusAdaptor statusAdaptor;

    @Before
    public void setUp()
    {
        // start the worker
        new Thread(() ->
        {
            worker.run();
        }).start();
    }

    @After
    public void tearDown()
    {
        worker.stop();
    }

    @Test
    public void testStartsAsIdle()
    {
        assertSame(Worker.State.IDLE, worker.state);
    }

    @Test
    public void testStartAndStopWorker() throws InterruptedException, TimeoutException
    {
        Mockito.doNothing().when(statusAdaptor).updateStatusText(Mockito.anyString());

        final Waiter waiter = new Waiter();

        new Thread(() ->
        {
            worker.addTasksToQueue(new AbstractWorkerTask()
            {
                @Override
                public void startTask()
                {
                    waiter.assertEquals(Worker.State.RUNNING, worker.state);
                    waiter.resume();
                }
            });
        }).start();
        waiter.await(1000);
        worker.stop();
        assertSame(Worker.State.STOP, worker.state);
    }
}
