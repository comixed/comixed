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

import org.comixed.model.tasks.ProcessComicEntry;
import org.comixed.repositories.tasks.ProcessComicEntryRepository;
import org.comixed.task.model.ProcessComicTask;
import org.comixed.task.model.WorkerTask;
import org.comixed.task.model.WorkerTaskException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * <code>Worker</code> runs in a separate worker and processes a queue of
 * worker tasks to be completed.
 * <p>
 * When the queue is empty the work worker sits idle, but wakes up and processes tasks as they are added. Tasks are
 * executed in the order in which they are added to the queue.
 *
 * @author Darryl. Pierce
 */
@Component
public class Worker
        implements Runnable,
                   InitializingBean {
    private static final Object semaphore = new Object();

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ProcessComicEntryRepository processComicEntryRepository;
    @Autowired private ObjectFactory<ProcessComicTask> processComicTaskFactory;

    public List<WorkerListener> listeners = new ArrayList<>();
    BlockingQueue<WorkerTask> queue = new LinkedBlockingQueue<>();
    State state = State.NOT_STARTED;
    Map<Class<? extends WorkerTask>, Integer> taskCounts = new HashMap<>();

    public Worker() {
        super();
    }

    /**
     * Adds a tasks to the queue.
     *
     * @param task
     *         the task
     */
    public void addTasksToQueue(WorkerTask task) {
        this.logger.debug("Adding task of type {} to queue",
                          task.getClass());
        try {
            this.queue.put(task);

            int count = 0;

            if (this.taskCounts.containsKey(task.getClass())) {
                count = this.taskCounts.get(task.getClass());
            }
            count++;
            this.taskCounts.put(task.getClass(),
                                count);
            this.logger.debug("There are now {} task{} of type {}",
                              count,
                              count == 1
                              ? ""
                              : "s",
                              task.getClass());

        }
        catch (InterruptedException error) {
            this.logger.error("Unable to queue task",
                              error);
        }
        this.logger.debug("Queue size is now {}",
                          this.queue.size());
        this.wakeUpWorker();
    }

    private void wakeUpWorker() {
        logger.debug("Getting mutex lock");
        synchronized (this.semaphore) {
            this.logger.debug("Waking up worker thread");
            this.semaphore.notifyAll();
        }
    }

    public void addWorkerListener(WorkerListener listener) {
        this.logger.debug("Adding worker listener: {}",
                          listener);
        this.listeners.add(listener);
    }

    @Override
    public void afterPropertiesSet()
            throws
            Exception {
        this.logger.debug("Starting worker thread");

        new Thread(this,
                   "Jarvis-ComiXed").start();
    }

    /**
     * Returns the number of pending tasks of the specified type are in the queue.
     *
     * @param taskClass
     *         the task type
     *
     * @return the count
     */
    public int getCountFor(Class<? extends WorkerTask> taskClass) {
        this.logger.info("Getting worker count: class={}",
                         taskClass.getName());
        this.logger.debug("Getting worker queue count: class={}",
                          taskClass.getName());
        synchronized (this.semaphore) {
            if (this.queue.isEmpty()) {
                this.logger.debug("The queue is empty");
                return 0;
            }

            if (!this.taskCounts.containsKey(taskClass)) {
                this.logger.debug("No entries in queue for {}",
                                  taskClass.getName());

                for (Iterator<Class<? extends WorkerTask>> keyIter = this.taskCounts.keySet()
                                                                                    .iterator();
                     keyIter.hasNext(); ) {
                    this.logger.debug("KEY={}",
                                      keyIter.next());
                }
                return 0;
            }

            final Integer result = this.taskCounts.get(taskClass);

            this.logger.debug("{} task{} found",
                              result,
                              result == 1
                              ? ""
                              : "s");

            return result;
        }
    }

    /**
     * Returns the current state of the worker.
     *
     * @return the state
     */
    public State getState() {
        return this.state;
    }

    /**
     * Returns whether the worker queue is empty or has tasks remaining.
     *
     * @return true if the queue is empty
     */
    public boolean isQueueEmpty() {
        return this.queue.isEmpty();
    }

    /**
     * Returns the size of the task queue.
     * <p>
     * The size of the task queue does not include any currently executing task.
     *
     * @return the size
     */
    public int queueSize() {
        return this.queue.size();
    }

    @Override
    public void run() {
        this.logger.debug("Starting worker queue");
        this.state = State.RUNNING;
        this.fireWorkerStateChangedEvent();
        while (this.state != State.STOP) {
            WorkerTask currentTask = null;

            synchronized (this.semaphore) {
                if (this.queue.isEmpty()) {
                    this.logger.debug("Waiting for task or notification");
                    try {
                        this.state = State.IDLE;
                        this.fireWorkerStateChangedEvent();
                        this.semaphore.wait(1000L);
                        logger.debug("Woke up: state={}",
                                     this.state.name());
                        // if we're in the stopped state then exit
                        if (this.state == State.STOP) {
                            logger.debug("We are in the stopped state. Exiting...");
                        }
                    }
                    catch (InterruptedException cause) {
                        this.logger.error("Worker interrupted",
                                          cause);
                    }
                }
                if (!this.queue.isEmpty() && (this.state != State.STOP)) {
                    this.state = State.RUNNING;
                    currentTask = this.queue.poll();
                    this.logger.debug("Popping task of type {}",
                                      currentTask.getClass());
                    int count = this.taskCounts.get(currentTask.getClass()) - 1;
                    this.taskCounts.put(currentTask.getClass(),
                                        count);
                    this.logger.debug("There are now {} tasks of type {}",
                                      count,
                                      currentTask.getClass());
                    this.fireQueueChangedEvent();
                }
                this.semaphore.notifyAll();
            }

            if (currentTask == null) {
                this.lookForProcessEntries();
            } else if (currentTask != null) {

                try {
                    this.logger.debug("Starting task: " + currentTask);
                    long start = System.currentTimeMillis();
                    currentTask.startTask();
                    this.logger.debug(
                            "Finished task: " + currentTask + " [" + (System.currentTimeMillis() - start) + "ms]");
                }
                catch (WorkerTaskException | RuntimeException error) {
                    this.logger.warn("Failed to complete task: {}",
                                     currentTask.getDescription(),
                                     error);
                }
            }
        }
        this.logger.debug("Stop processing the work queue");
        this.fireWorkerStateChangedEvent();

    }

    private void lookForProcessEntries() {
        this.logger.debug("Checking for entries to process");
        final ProcessComicEntry entry = this.processComicEntryRepository.findFirstByOrderByCreated();

        if (entry != null) {
            this.logger.debug("Entry found for: {}",
                              entry.getComic()
                                   .getFilename());
            final ProcessComicTask task = this.processComicTaskFactory.getObject();
            task.setEntry(entry);

            this.logger.debug("Queueing task");
            this.addTasksToQueue(task);
        }

    }

    private void fireWorkerStateChangedEvent() {
        for (WorkerListener listener : this.listeners) {
            listener.workerStateChanged();
        }
    }

    void fireQueueChangedEvent() {
        this.logger.debug("Notifying worker listeners");
        for (WorkerListener listener : this.listeners) {
            listener.queueChanged();
        }
    }

    /**
     * Signals the worker to stop processing the task queue.
     * <p>
     * If a task is current being processed, the worker will wait until that task completes.
     */
    public void stop() {
        this.logger.debug("Stopping worker thread");
        this.state = State.STOP;
        this.wakeUpWorker();
    }

    public enum State {
        NOT_STARTED,
        IDLE,
        RUNNING,
        STOP,
    }
}
