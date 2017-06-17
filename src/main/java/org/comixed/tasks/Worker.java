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

import java.util.Queue;

import org.apache.commons.collections4.queue.CircularFifoQueue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

/**
 * <code>Worker</code> runs in a separate worker and processes a queue of
 * worker tasks to be completed.
 *
 * When the queue is empty the work worker sits idle, but wakes up and processes
 * tasks as they are added. Tasks are executed in the order in which they are
 * added to the queue.
 *
 * @author Darryl. Pierce
 */
@Component
public class Worker implements
                    Runnable,
                    InitializingBean
{
    public enum State
    {
     IDLE,
     RUNNING,
     STOP,
    }

    private final Logger logger = LoggerFactory.getLogger(this.getClass());;

    Queue<WorkerTask> queue = new CircularFifoQueue<>();
    State state = State.IDLE;
    private Object semaphore = new Object();

    public Worker()
    {
        super();
    }

    /**
     * Adds a tasks to the queue.
     * 
     * @param task
     *            the task
     */
    public void addTasksToQueue(WorkerTask task)
    {
        this.logger.debug("Adding task to queue: " + task);
        this.queue.add(task);
        this.logger.debug("Queue size is now " + this.queue.size());
        this.wakeUpWorker();
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        logger.debug("Starting worker thread");

        new Thread(this).start();

    }

    public void beginWorkerThread()
    {
        new Thread(this, "ComixEd-Worker").start();
    }

    /**
     * * Returns whether the worker queue is empty or has tasks remaining. *
     * * @return true if the queue is empty
     */
    public boolean isQueueEmpty()
    {
        return this.queue.isEmpty();
    }

    /**
     * * Returns the size of the task queue. * * The size of the task queue does
     * not include any currently executing task. * * @return the size
     */
    public int queueSize()
    {
        return this.queue.size();
    }

    @Override
    public void run()
    {
        this.logger.debug("Starting worker queue");
        this.state = State.RUNNING;
        while (this.state != State.STOP)
        {
            synchronized (this.semaphore)
            {
                if (this.queue.isEmpty())
                {
                    this.logger.debug("Waiting for task or notification");
                    try
                    {
                        this.state = State.IDLE;
                        this.semaphore.wait();
                        this.state = State.RUNNING;
                    }
                    catch (InterruptedException cause)
                    {
                        this.logger.error("Worker interrupted", cause);
                    }
                }
                if (!this.queue.isEmpty() && (this.state == State.RUNNING))
                {
                    WorkerTask task = this.queue.poll();
                    try
                    {
                        this.logger.debug("Starting task: " + task);
                        long start = System.currentTimeMillis();
                        task.startTask();
                        this.logger.debug("Finished task: " + task + " [" + (System.currentTimeMillis() - start)
                                          + "ms]");
                    }
                    catch (WorkerTaskException error)
                    {
                        this.logger.debug("Failed to complete task", error);
                    }
                }
            }
        }
        this.logger.debug("Stop processing the work queue");
    }

    /**
     * * Signals the worker to stop processing the task queue. * * If a task is
     * current being processed, the worker will wait until that * task
     * completes.
     */
    public void stop()
    {
        this.logger.debug("Stopping worker thread");
        this.state = State.STOP;
        this.wakeUpWorker();
    }

    private void wakeUpWorker()
    {
        if (this.state == State.IDLE)
        {
            synchronized (this.semaphore)
            {
                this.logger.debug("Waking up worker thread");
                this.semaphore.notifyAll();
            }
        }
    }
}
