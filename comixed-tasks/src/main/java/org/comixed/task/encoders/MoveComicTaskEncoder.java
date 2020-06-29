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

import lombok.extern.log4j.Log4j2;
import org.comixed.model.comic.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.model.MoveComicWorkerTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicTaskEncoder</code> encodes instances of {@link MoveComicWorkerTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class MoveComicTaskEncoder extends AbstractTaskEncoder<MoveComicWorkerTask> {
  public static final String DIRECTORY = "destination-directory";
  public static final String RENAMING_RULE = "renaming-rule";

  @Autowired private ObjectFactory<MoveComicWorkerTask> moveComicWorkerTaskObjectFactory;
  @Autowired private TaskRepository taskRepository;

  private Comic comic;
  private String directory;
  private String renamingRule;

  @Override
  public Task encode() {
    log.debug(
        "encoding move comic task: id={} directory={} rename rule={}",
        this.comic.getId(),
        this.directory,
        this.renamingRule);

    Task result = new Task();
    result.setTaskType(TaskType.MOVE_COMIC);
    result.setComic(this.comic);
    result.setProperty(DIRECTORY, this.directory);
    result.setProperty(RENAMING_RULE, this.renamingRule);

    return result;
  }

  @Override
  public MoveComicWorkerTask decode(Task task) {
    this.taskRepository.delete(task);

    log.debug("Decoding move comic task: id={}", task.getId());

    MoveComicWorkerTask result = this.moveComicWorkerTaskObjectFactory.getObject();
    result.setComic(task.getComic());
    result.setDirectory(task.getProperty(DIRECTORY));
    result.setRenamingRule(task.getProperty(RENAMING_RULE));

    return result;
  }

  /**
   * Sets the comic to be moved.
   *
   * @param comic the comic
   */
  public void setComic(Comic comic) {
    this.comic = comic;
  }

  /**
   * Sets the root directory into which the comic is to be moved.
   *
   * @param directory the directory
   */
  public void setDirectory(String directory) {
    this.directory = directory;
  }

  /**
   * Sets the renaming rule to be applied.
   *
   * @param renamingRule the renaming rule
   */
  public void setRenamingRule(String renamingRule) {
    this.renamingRule = renamingRule;
  }
}
