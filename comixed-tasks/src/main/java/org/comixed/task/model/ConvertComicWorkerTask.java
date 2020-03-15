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

import java.io.IOException;
import java.util.Date;
import org.comixed.adaptors.ArchiveType;
import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.model.library.Comic;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.encoders.ProcessComicTaskEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ConvertComicWorkerTask extends AbstractWorkerTask {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ComicRepository comicRepository;
  @Autowired private TaskRepository taskRepository;
  @Autowired private ObjectFactory<ProcessComicTaskEncoder> processComicTaskEncoderObjectFactory;

  private Comic comic;
  private ArchiveType targetArchiveType;
  private boolean renamePages;

  @Override
  protected String createDescription() {
    return String.format(
        "Saving comic: id=%d source type=%s destination type=%s rename pages=%s",
        this.comic.getId(),
        this.comic.getArchiveType(),
        this.targetArchiveType,
        this.renamePages ? "Yes" : "No");
  }

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    this.logger.debug(
        "Saving comic: id={} target archive type={}", this.comic.getId(), this.targetArchiveType);
    ArchiveAdaptor targetArchiveAdaptor = this.targetArchiveType.getArchiveAdaptor();
    try {
      Comic result = targetArchiveAdaptor.saveComic(this.comic, this.renamePages);
      this.logger.debug("Saving updated comic");
      result.setDateLastUpdated(new Date());
      this.comicRepository.save(result);

      this.logger.debug("Queueing up a comic processing task");
      ProcessComicTaskEncoder taskEncoder = this.processComicTaskEncoderObjectFactory.getObject();
      taskEncoder.setComic(result);
      taskEncoder.setIgnoreMetadata(false);
      taskEncoder.setDeleteBlockedPages(false);
      this.taskRepository.save(taskEncoder.encode());
    } catch (ArchiveAdaptorException | IOException error) {
      throw new WorkerTaskException("Failed to save comic", error);
    }
  }

  public Comic getComic() {
    return this.comic;
  }

  public void setComic(Comic comic) {
    this.comic = comic;
  }

  public ArchiveType getTargetArchiveType() {
    return this.targetArchiveType;
  }

  public void setTargetArchiveType(ArchiveType archiveType) {
    this.targetArchiveType = archiveType;
  }

  public void setRenamePages(boolean renamePages) {
    this.renamePages = renamePages;
  }
}
