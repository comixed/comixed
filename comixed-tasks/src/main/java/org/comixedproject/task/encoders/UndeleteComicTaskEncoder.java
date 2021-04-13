/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.UndeleteComicTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>UndeleteComicTaskEncoder</code> defines a type that can encode and decode instances of
 * {@link UndeleteComicTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class UndeleteComicTaskEncoder extends AbstractTaskEncoder<UndeleteComicTask> {
  @Autowired private TaskService taskService;
  @Autowired private ObjectFactory<UndeleteComicTask> undeleteComicWorkerTaskObjectFactory;

  private Comic comic;

  @Override
  public PersistedTask encode() {
    log.debug("Encoding undelete task for comic: id={}", this.comic.getId());
    final PersistedTask result = new PersistedTask();
    result.setTaskType(PersistedTaskType.UNDELETE_COMIC);
    result.setComic(this.comic);
    result.setProperty("noop", "noo");
    return result;
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public UndeleteComicTask decode(PersistedTask persistedTask) {
    this.taskService.delete(persistedTask);

    log.debug("Decoding undelete comic persistedTask: id={}", persistedTask.getId());

    final UndeleteComicTask result = this.undeleteComicWorkerTaskObjectFactory.getObject();
    result.setComic(persistedTask.getComic());

    return result;
  }

  public void setComic(Comic comic) {
    this.comic = comic;
  }
}
