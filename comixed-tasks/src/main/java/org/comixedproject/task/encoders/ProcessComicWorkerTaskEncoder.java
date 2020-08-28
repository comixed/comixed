/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.task.encoders;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.task.model.ProcessComicWorkerTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ProcessComicWorkerTaskEncoder
    extends AbstractWorkerTaskEncoder<ProcessComicWorkerTask> {
  public static final String DELETE_BLOCKED_PAGES = "delete-blocked-pages";
  public static final String IGNORE_METADATA = "ignore-metadata";

  @Autowired private ObjectFactory<ProcessComicWorkerTask> processComicTaskObjectFactory;

  private Comic comic;
  private boolean deleteBlockedPages;
  private boolean ignoreMetadata;

  @Override
  public Task encode() {
    log.debug(
        "Encoding process comic task: comic={} delete blocked pages={} ignore metadata={}",
        this.comic.getId(),
        this.deleteBlockedPages,
        this.ignoreMetadata);

    final Task result = new Task();

    result.setTaskType(TaskType.PROCESS_COMIC);
    result.setComic(this.comic);
    result.setProperty(DELETE_BLOCKED_PAGES, String.valueOf(this.deleteBlockedPages));
    result.setProperty(IGNORE_METADATA, String.valueOf(this.ignoreMetadata));

    return result;
  }

  @Override
  public ProcessComicWorkerTask decode(final Task task) {
    log.debug("Decoding process comic task: comic={}", task.getComic().getId());

    final ProcessComicWorkerTask result = this.processComicTaskObjectFactory.getObject();
    result.setComic(task.getComic());
    result.setDeleteBlockedPages(Boolean.valueOf(task.getProperty(DELETE_BLOCKED_PAGES)));
    result.setIgnoreMetadata(Boolean.valueOf(task.getProperty(IGNORE_METADATA)));

    return result;
  }

  public void setComic(final Comic comic) {
    this.comic = comic;
  }

  public void setDeleteBlockedPages(final boolean deleteBlockedPages) {
    this.deleteBlockedPages = deleteBlockedPages;
  }

  public void setIgnoreMetadata(final boolean ignoreMetadata) {
    this.ignoreMetadata = ignoreMetadata;
  }
}
