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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.task.runner;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import lombok.extern.log4j.Log4j2;
import org.comixed.model.tasks.Task;
import org.comixed.task.TaskException;
import org.comixed.task.adaptors.TaskAdaptor;
import org.comixed.task.encoders.TaskEncoder;
import org.comixed.task.model.WorkerTask;
import org.comixed.task.model.WorkerTaskException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>Worker</code> runs in a separate worker and processes a queue of worker tasks to be
 * completed.
 *
 * <p>When the queue is empty the work worker sits idle, but wakes up and processes tasks as they
 * are added. Tasks are executed in the order in which they are added to the queue.
 *
 * @author Darryl. Pierce
 */
@Component
@Log4j2
public class Worker implements Runnable, InitializingBean {
  private static final Object semaphore = new Object();

  @Autowired private TaskAdaptor taskAdaptor;

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
   * @param task the task
   */
  public void addTasksToQueue(WorkerTask task) {
    this.log.debug("Adding task of type {} to queue", task.getClass());
    try {
      this.queue.put(task);

      int count = 0;

      if (this.taskCounts.containsKey(task.getClass())) {
        count = this.taskCounts.get(task.getClass());
      }
      count++;
      this.taskCounts.put(task.getClass(), count);
      this.log.debug(
          "There are now {} task{} of type {}", count, count == 1 ? "" : "s", task.getClass());

    } catch (InterruptedException error) {
      this.log.error("Unable to queue task", error);
      Thread.currentThread().interrupt();
    }
    this.log.debug("Queue size is now {}", this.queue.size());
    this.wakeUpWorker();
  }

  private void wakeUpWorker() {
    this.log.debug("Getting mutex lock");
    synchronized (this.semaphore) {
      this.log.debug("Waking up worker thread");
      this.semaphore.notifyAll();
    }
  }

  public void addWorkerListener(WorkerListener listener) {
    this.log.debug("Adding worker listener: {}", listener);
    this.listeners.add(listener);
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    this.log.debug("Starting worker thread");

    new Thread(this, "Jarvis-ComiXed").start();
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
   * Returns the size of the task queue.
   *
   * <p>The size of the task queue does not include any currently executing task.
   *
   * @return the size
   */
  public int queueSize() {
    return this.queue.size();
  }

  @Override
  public void run() {
    this.log.debug("Starting worker queue");
    this.state = State.RUNNING;
    this.fireWorkerStateChangedEvent();
    while (this.state != State.STOP) {
      WorkerTask currentTask = null;

      synchronized (this.semaphore) {
        if (this.queue.isEmpty()) {
          this.log.debug("Waiting for task or notification");
          try {
            this.state = State.IDLE;
            this.fireWorkerStateChangedEvent();
            this.semaphore.wait(1000L);
            this.log.debug("Woke up: state={}", this.state.name());
            // if we're in the stopped state then exit
            if (this.state == State.STOP) {
              this.log.debug("We are in the stopped state. Exiting...");
            }
          } catch (InterruptedException cause) {
            this.log.error("Worker interrupted", cause);
            Thread.currentThread().interrupt();
          }
        }
        if (!this.queue.isEmpty() && (this.state != State.STOP)) {
          this.state = State.RUNNING;
          currentTask = this.queue.poll();
          this.log.debug("Popping task of type {}", currentTask.getClass());
          int count = this.taskCounts.get(currentTask.getClass()) - 1;
          this.taskCounts.put(currentTask.getClass(), count);
          this.log.debug("There are now {} tasks of type {}", count, currentTask.getClass());
          this.fireQueueChangedEvent();
        }
        this.semaphore.notifyAll();
      }

      if (currentTask == null) {
        final List<Task> tasks = this.taskAdaptor.getNextTask();
        if (!tasks.isEmpty()) {
          final Task taskToRun = tasks.get(0);
          this.log.debug("Found a persisted task to run: type={}", taskToRun.getTaskType());
          final TaskEncoder<?> decoder;
          try {
            decoder = this.taskAdaptor.getEncoder(taskToRun.getTaskType());
            currentTask = decoder.decode(tasks.get(0));
          } catch (TaskException error) {
            this.log.error("Failed to decode and run task", error);
          }
        }
      }

      if (currentTask != null) {
        try {
          this.log.debug("Starting task: {}", currentTask.getDescription());
          long start = System.currentTimeMillis();
          currentTask.startTask();
          this.log.debug(
              "Finished task: "
                  + currentTask
                  + " ["
                  + (System.currentTimeMillis() - start)
                  + "ms]");
        } catch (WorkerTaskException | RuntimeException error) {
          this.log.warn("Failed to complete task: {}", currentTask.getDescription(), error);
        }
      }
    }
    this.log.debug("Stop processing the work queue");
    this.fireWorkerStateChangedEvent();
  }

  private void fireWorkerStateChangedEvent() {
    for (WorkerListener listener : this.listeners) {
      listener.workerStateChanged();
    }
  }

  void fireQueueChangedEvent() {
    this.log.debug("Notifying worker listeners");
    for (WorkerListener listener : this.listeners) {
      listener.queueChanged();
    }
  }

  /**
   * Signals the worker to stop processing the task queue.
   *
   * <p>If a task is current being processed, the worker will wait until that task completes.
   */
  public void stop() {
    this.log.debug("Stopping worker thread");
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
