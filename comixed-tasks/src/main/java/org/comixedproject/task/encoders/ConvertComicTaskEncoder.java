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

import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.ConvertComicTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ConvertComicTaskEncoder extends AbstractTaskEncoder<ConvertComicTask> {
  public static final String ARCHIVE_TYPE = "target-archive-type";
  public static final String RENAME_PAGES = "rename-pages";
  public static final String DELETE_PAGES = "delete-pages";
  public static final String DELETE_ORIGINAL_COMIC = "delete-original-comic";

  @Autowired private TaskService taskService;
  @Autowired private ObjectFactory<ConvertComicTask> convertComicWorkerTaskObjectFactory;

  @Getter @Setter private Comic comic;
  @Getter @Setter private ArchiveType targetArchiveType;
  @Getter @Setter private boolean renamePages;
  @Getter @Setter private boolean deletePages;
  @Getter @Setter private boolean deleteOriginal;

  @Override
  public PersistedTask encode() {
    log.debug("Encoding save comic task");

    PersistedTask result = new PersistedTask();
    result.setTaskType(PersistedTaskType.CONVERT_COMIC);
    result.setComic(this.comic);
    result.setProperty(ARCHIVE_TYPE, this.targetArchiveType.toString());
    result.setProperty(RENAME_PAGES, String.valueOf(this.renamePages));
    result.setProperty(DELETE_PAGES, String.valueOf(this.deletePages));
    result.setProperty(DELETE_ORIGINAL_COMIC, String.valueOf(this.deleteOriginal));

    return result;
  }

  @Override
  @Transactional
  public ConvertComicTask decode(PersistedTask persistedTask) {
    log.debug("Decoding save comic persistedTask: id={}", persistedTask.getId());

    ConvertComicTask result = this.convertComicWorkerTaskObjectFactory.getObject();
    result.setComic(persistedTask.getComic());
    ArchiveType archiveType = ArchiveType.forValue(persistedTask.getProperty(ARCHIVE_TYPE));
    result.setTargetArchiveType(archiveType);
    result.setRenamePages(Boolean.parseBoolean(persistedTask.getProperty(RENAME_PAGES)));
    result.setDeletePages(Boolean.parseBoolean(persistedTask.getProperty(DELETE_PAGES)));
    result.setDeleteOriginal(
        Boolean.parseBoolean(persistedTask.getProperty(DELETE_ORIGINAL_COMIC)));

    log.debug("Deleting persisted persistedTask");
    this.taskService.delete(persistedTask);

    return result;
  }
}
