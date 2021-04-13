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
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.task.AddComicTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>AddComicTaskEncoder</code> encodes the details for an {@link AddComicTask} instance.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class AddComicTaskEncoder extends AbstractTaskEncoder<AddComicTask> {
  public static final String FILENAME = "filename";
  public static final String DELETE_BLOCKED_PAGES = "delete-blocked-pages";
  public static final String IGNORE_METADATA = "ignore-metadata";

  @Autowired private ObjectFactory<AddComicTask> addComicWorkerTaskObjectFactory;

  @Setter private String comicFilename;
  @Setter private boolean deleteBlockedPages;
  @Setter private boolean ignoreMetadata;

  @Override
  public PersistedTask encode() {
    log.debug(
        "Encoding add comic task: filename={} delete blocked pages={} ignore metadata={}",
        this.comicFilename,
        this.deleteBlockedPages,
        this.ignoreMetadata);

    final PersistedTask result = new PersistedTask();

    result.setProperty(FILENAME, this.comicFilename);
    result.setProperty(DELETE_BLOCKED_PAGES, String.valueOf(this.deleteBlockedPages));
    result.setProperty(IGNORE_METADATA, String.valueOf(this.ignoreMetadata));

    return result;
  }

  @Override
  public AddComicTask decode(final PersistedTask persistedTask) {
    log.debug(
        "Decoding persisted persistedTask: id={} type={}",
        persistedTask.getId(),
        persistedTask.getTaskType());
    final AddComicTask result = this.addComicWorkerTaskObjectFactory.getObject();

    log.debug("Loading persistedTask state");
    result.setFilename(persistedTask.getProperty(FILENAME));
    result.setDeleteBlockedPages(Boolean.valueOf(persistedTask.getProperty(DELETE_BLOCKED_PAGES)));
    result.setIgnoreMetadata(Boolean.valueOf(persistedTask.getProperty(IGNORE_METADATA)));

    return result;
  }
}
