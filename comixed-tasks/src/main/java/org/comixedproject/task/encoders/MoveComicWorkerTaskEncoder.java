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
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.MoveComicWorkerTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicWorkerTaskEncoder</code> encodes instances of {@link MoveComicWorkerTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class MoveComicWorkerTaskEncoder extends AbstractWorkerTaskEncoder<MoveComicWorkerTask> {
  public static final String DIRECTORY = "destination-directory";
  public static final String RENAMING_RULE = "renaming-rule";

  @Autowired private ObjectFactory<MoveComicWorkerTask> moveComicWorkerTaskObjectFactory;
  @Autowired private TaskService taskService;

  @Getter @Setter private Comic comic;
  @Getter @Setter private String targetDirectory;
  @Getter @Setter private String renamingRule;

  @Override
  public Task encode() {
    log.debug(
        "encoding move comic task: id={} directory={} rename rule={}",
        this.comic.getId(),
        this.targetDirectory,
        this.renamingRule);

    Task result = new Task();
    result.setTaskType(TaskType.MOVE_COMIC);
    result.setComic(this.comic);
    result.setProperty(DIRECTORY, this.targetDirectory);
    result.setProperty(RENAMING_RULE, this.renamingRule);

    return result;
  }

  @Override
  public MoveComicWorkerTask decode(Task task) {
    this.taskService.delete(task);

    log.debug("Decoding move comic task: id={}", task.getId());

    MoveComicWorkerTask result = this.moveComicWorkerTaskObjectFactory.getObject();
    result.setComic(task.getComic());
    result.setTargetDirectory(task.getProperty(DIRECTORY));
    result.setRenamingRule(task.getProperty(RENAMING_RULE));

    return result;
  }
}
