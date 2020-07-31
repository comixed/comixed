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

package org.comixedproject.task.model;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.AddComicWorkerTaskEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>QueueComicsWorkerTask</code> is an unpersisted task that creates persisted instances of
 * {@link AddComicWorkerTask} to import comics.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class QueueComicsWorkerTask extends AbstractWorkerTask {
  @Autowired private TaskService taskService;

  boolean ignoreMetadata = false;
  private List<String> filenames;
  private boolean deleteBlockedPages = false;

  public void setDeleteBlockedPages(boolean deleteBlockedPages) {
    this.deleteBlockedPages = deleteBlockedPages;
  }

  /**
   * Sets the list of filenames to be added.
   *
   * @param filenames the filenames
   */
  public void setFilenames(List<String> filenames) {
    this.filenames = filenames;
  }

  /**
   * Sets whether to ignore any <code>ComicInfo.xml</code> file in the comic.
   *
   * @param ignore the ignore state
   */
  public void setIgnoreMetadata(boolean ignore) {
    this.ignoreMetadata = ignore;
  }

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    log.debug(
        "Enqueueing {} comic{}: delete blocked pages={} ignore metadata={}",
        this.filenames.size(),
        this.filenames.size() == 1 ? "" : "s",
        this.deleteBlockedPages,
        this.ignoreMetadata);

    long started = System.currentTimeMillis();

    for (String filename : this.filenames) {
      final Task task = new Task();

      log.debug("Comic file: {}", filename);

      task.setTaskType(TaskType.ADD_COMIC);
      task.setProperty(AddComicWorkerTaskEncoder.FILENAME, filename);
      task.setProperty(
          AddComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES, String.valueOf(this.deleteBlockedPages));
      task.setProperty(
          AddComicWorkerTaskEncoder.IGNORE_METADATA, String.valueOf(this.ignoreMetadata));
      this.taskService.save(task);
    }

    log.debug("Finished processing comics queue: {}ms", System.currentTimeMillis() - started);
  }

  @Override
  protected String createDescription() {
    final StringBuilder result = new StringBuilder();

    result
        .append("Queue comics for import:")
        .append(" count=")
        .append(this.filenames.size())
        .append(" delete blocked pages=")
        .append(this.deleteBlockedPages ? "Yes" : "No")
        .append(" ignore metadata=")
        .append(this.ignoreMetadata ? "Yes" : "No");

    return result.toString();
  }

  public List<String> gettFilenames() {
    return this.filenames;
  }
}
