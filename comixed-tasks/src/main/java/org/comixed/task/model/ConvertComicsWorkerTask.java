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

package org.comixed.task.model;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.comic.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.encoders.ConvertComicTaskEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ConvertComicsWorkerTask extends AbstractWorkerTask {
  @Autowired private TaskRepository taskRepository;
  @Autowired private ObjectFactory<ConvertComicTaskEncoder> saveComicTaskEncoderObjectFactory;

  private List<Comic> comicList;
  private ArchiveType archiveType;
  private boolean renamePages;

  public void setComicList(List<Comic> comicList) {
    this.comicList = comicList;
  }

  public void setTargetArchiveType(ArchiveType archiveType) {
    this.archiveType = archiveType;
  }

  public void setRenamePages(boolean renamePages) {
    this.renamePages = renamePages;
  }

  @Override
  protected String createDescription() {
    return String.format(
        "Preparing to save %d comic%s",
        this.comicList.size(), this.comicList.size() == 1 ? "" : "s");
  }

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    log.debug(
        "Queueing up {} save comic task{}",
        this.comicList.size(),
        this.comicList.size() == 1 ? "" : "s");

    for (Comic comic : this.comicList) {
      log.debug("Queueing task to save comic: id={}", comic.getId());
      ConvertComicTaskEncoder encoder = this.saveComicTaskEncoderObjectFactory.getObject();

      encoder.setComic(comic);
      encoder.setTargetArchiveType(this.archiveType);
      encoder.setRenamePages(this.renamePages);
      try {
        Task task = encoder.encode();
        this.taskRepository.save(task);
      } catch (Exception error) {
        throw new WorkerTaskException("unable to queue comic conversion", error);
      }
    }
  }
}
