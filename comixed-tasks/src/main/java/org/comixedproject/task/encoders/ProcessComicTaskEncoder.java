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
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.task.ProcessComicTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ProcessComicTaskEncoder extends AbstractTaskEncoder<ProcessComicTask> {
  public static final String DELETE_BLOCKED_PAGES = "delete-blocked-pages";
  public static final String IGNORE_METADATA = "ignore-metadata";

  @Autowired private ObjectFactory<ProcessComicTask> processComicTaskObjectFactory;

  @Setter private Comic comic;
  @Setter private boolean deleteBlockedPages;
  @Setter private boolean ignoreMetadata;

  @Override
  public PersistedTask encode() {
    log.debug(
        "Encoding process comic task: comic={} delete blocked pages={} ignore metadata={}",
        this.comic.getId(),
        this.deleteBlockedPages,
        this.ignoreMetadata);

    final PersistedTask result = new PersistedTask();

    result.setTaskType(PersistedTaskType.PROCESS_COMIC);
    result.setComic(this.comic);
    result.setProperty(DELETE_BLOCKED_PAGES, String.valueOf(this.deleteBlockedPages));
    result.setProperty(IGNORE_METADATA, String.valueOf(this.ignoreMetadata));

    return result;
  }

  @Override
  public ProcessComicTask decode(final PersistedTask persistedTask) {
    log.debug("Decoding process comic persistedTask: comic={}", persistedTask.getComic().getId());

    final ProcessComicTask result = this.processComicTaskObjectFactory.getObject();
    result.setComic(persistedTask.getComic());
    result.setDeleteBlockedPages(Boolean.valueOf(persistedTask.getProperty(DELETE_BLOCKED_PAGES)));
    result.setIgnoreMetadata(Boolean.valueOf(persistedTask.getProperty(IGNORE_METADATA)));

    return result;
  }
}
