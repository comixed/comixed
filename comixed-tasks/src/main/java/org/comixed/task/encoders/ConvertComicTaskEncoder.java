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

package org.comixed.task.encoders;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.comic.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.model.ConvertComicWorkerTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ConvertComicTaskEncoder extends AbstractTaskEncoder<ConvertComicWorkerTask> {
  public static final String ARCHIVE_TYPE = "target-archive-type";
  public static final String RENAME_PAGES = "rename-pages";
  public static final String DELETE_PAGES = "delete-pages";

  @Autowired private TaskRepository taskRepository;
  @Autowired private ObjectFactory<ConvertComicWorkerTask> convertComicWorkerTaskObjectFactory;

  @Getter @Setter private Comic comic;
  @Getter @Setter private ArchiveType targetArchiveType;
  @Getter @Setter private boolean renamePages;
  @Getter @Setter private boolean deletePages;

  @Override
  public Task encode() {
    log.debug("Encoding save comic task");

    Task result = new Task();
    result.setTaskType(TaskType.CONVERT_COMIC);
    result.setComic(this.comic);
    result.setProperty(ARCHIVE_TYPE, this.targetArchiveType.toString());
    result.setProperty(RENAME_PAGES, String.valueOf(this.renamePages));
    result.setProperty(DELETE_PAGES, String.valueOf(this.deletePages));

    return result;
  }

  @Override
  @Transactional
  public ConvertComicWorkerTask decode(Task task) {
    log.debug("Decoding save comic task: id={}", task.getId());

    ConvertComicWorkerTask result = this.convertComicWorkerTaskObjectFactory.getObject();
    result.setComic(task.getComic());
    ArchiveType archiveType = ArchiveType.forValue(task.getProperty(ARCHIVE_TYPE));
    result.setTargetArchiveType(archiveType);
    result.setRenamePages(Boolean.valueOf(task.getProperty(RENAME_PAGES)));
    result.setDeletePages(Boolean.valueOf(task.getProperty(DELETE_PAGES)));

    log.debug("Deleting persisted task");
    this.taskRepository.delete(task);

    return result;
  }
}
