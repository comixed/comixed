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

import java.io.IOException;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.task.encoders.ProcessComicTaskEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ConvertComicWorkerTask extends AbstractWorkerTask {
  @Autowired private ComicRepository comicRepository;
  @Autowired private TaskRepository taskRepository;
  @Autowired private ObjectFactory<ProcessComicTaskEncoder> processComicTaskEncoderObjectFactory;
  @Autowired private ComicFileHandler comicFileHandler;

  @Getter @Setter private Comic comic;
  @Getter @Setter private ArchiveType targetArchiveType;
  @Getter @Setter private boolean renamePages;
  @Getter @Setter private boolean deletePages;

  @Override
  protected String createDescription() {
    return String.format(
        "Saving comic: id=%d source type=%s destination type=%s %s%s",
        this.comic.getId(),
        this.comic.getArchiveType(),
        this.targetArchiveType,
        this.renamePages ? "(renaming pages)" : "",
        this.deletePages ? "(deleting pages)" : "");
  }

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    log.debug(
        "Saving comic: id={} target archive type={}", this.comic.getId(), this.targetArchiveType);
    ArchiveAdaptor targetArchiveAdaptor =
        this.comicFileHandler.getArchiveAdaptorFor(this.targetArchiveType);

    try {
      this.comic.removeDeletedPages(this.deletePages);
      Comic saveComic = targetArchiveAdaptor.saveComic(this.comic, this.renamePages);
      log.debug("Saving updated comic");
      saveComic.setDateLastUpdated(new Date());
      final Comic result = this.comicRepository.save(saveComic);
      this.comicRepository.flush();

      log.debug("Queueing up a comic processing task");
      ProcessComicTaskEncoder taskEncoder = this.processComicTaskEncoderObjectFactory.getObject();
      taskEncoder.setComic(result);
      taskEncoder.setIgnoreMetadata(false);
      taskEncoder.setDeleteBlockedPages(false);
      this.taskRepository.save(taskEncoder.encode());
    } catch (ArchiveAdaptorException | IOException error) {
      throw new WorkerTaskException("Failed to save comic", error);
    }
  }
}
