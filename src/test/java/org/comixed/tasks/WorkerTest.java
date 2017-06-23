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

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

import net.jodah.concurrentunit.ConcurrentTestCase;
import net.jodah.concurrentunit.Waiter;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = Worker.class)
@TestPropertySource(locations = "classpath:test-application.properties")
public class WorkerTest extends ConcurrentTestCase
{
    @Autowired
    private Worker worker;

    @Test
    public void testStartsAsIdle()
    {
        assertSame(Worker.State.IDLE, worker.state);
    }

    @Test
    public void testStartAndStopWorker() throws InterruptedException, TimeoutException
    {
        assertSame(Worker.State.IDLE, worker.state);
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
