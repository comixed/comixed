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

import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.task.MarkComicForRemovalTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>MarkComicForRemovalTaskEncoder</code> handles encoding and decoding instances of {@link
 * MarkComicForRemovalTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class MarkComicForRemovalTaskEncoder extends AbstractTaskEncoder<MarkComicForRemovalTask> {
  @Autowired private ObjectFactory<MarkComicForRemovalTask> deleteComicWorkerTaskObjectFactory;

  @Setter private Comic comic;

  @Override
  public PersistedTask encode() {
    log.trace("Encoding delete comic task: comic={}", this.comic.getId());
    final PersistedTask result = new PersistedTask();
    result.setTaskType(PersistedTaskType.MARK_COMIC_FOR_REMOVAL);
    result.setComic(comic);
    return result;
  }

  @Override
  public MarkComicForRemovalTask decode(final PersistedTask persistedTask) {
    log.trace("Decoding delete comic task");
    final MarkComicForRemovalTask result = this.deleteComicWorkerTaskObjectFactory.getObject();
    result.setComic(persistedTask.getComic());
    return result;
  }
}
