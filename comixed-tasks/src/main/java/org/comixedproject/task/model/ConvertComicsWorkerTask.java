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

package org.comixedproject.task.model;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.task.encoders.ConvertComicTaskEncoder;
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

  @Getter @Setter private List<Comic> comicList;
  @Getter @Setter private ArchiveType targetArchiveType;
  @Getter @Setter private boolean renamePages;
  @Getter @Setter private boolean deletePages;

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
      encoder.setTargetArchiveType(this.targetArchiveType);
      encoder.setRenamePages(this.renamePages);
      encoder.setDeletePages(this.deletePages);
      try {
        Task task = encoder.encode();
        this.taskRepository.save(task);
      } catch (Exception error) {
        throw new WorkerTaskException("unable to queue comic conversion", error);
      }
    }
  }
}
