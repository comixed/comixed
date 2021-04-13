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
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.MoveComicTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicTaskEncoder</code> encodes instances of {@link MoveComicTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class MoveComicTaskEncoder extends AbstractTaskEncoder<MoveComicTask> {
  public static final String DIRECTORY = "destination-directory";
  public static final String RENAMING_RULE = "renaming-rule";

  @Autowired private ObjectFactory<MoveComicTask> moveComicWorkerTaskObjectFactory;
  @Autowired private TaskService taskService;

  @Getter @Setter private Comic comic;
  @Getter @Setter private String targetDirectory;
  @Getter @Setter private String renamingRule;

  @Override
  public PersistedTask encode() {
    log.debug(
        "encoding move comic task: id={} directory={} rename rule={}",
        this.comic.getId(),
        this.targetDirectory,
        this.renamingRule);

    PersistedTask result = new PersistedTask();
    result.setTaskType(PersistedTaskType.MOVE_COMIC);
    result.setComic(this.comic);
    result.setProperty(DIRECTORY, this.targetDirectory);
    result.setProperty(RENAMING_RULE, this.renamingRule);

    return result;
  }

  @Override
  public MoveComicTask decode(PersistedTask persistedTask) {
    this.taskService.delete(persistedTask);

    log.debug("Decoding move comic persistedTask: id={}", persistedTask.getId());

    MoveComicTask result = this.moveComicWorkerTaskObjectFactory.getObject();
    result.setComic(persistedTask.getComic());
    result.setTargetDirectory(persistedTask.getProperty(DIRECTORY));
    result.setRenamingRule(persistedTask.getProperty(RENAMING_RULE));

    return result;
  }
}
