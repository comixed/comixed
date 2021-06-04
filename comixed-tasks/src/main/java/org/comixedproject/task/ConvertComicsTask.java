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

package org.comixedproject.task;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.ConvertComicTaskEncoder;
import org.comixedproject.views.View;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ConvertComicsTask</code> manages creating instances of {@link ConvertComicTask} and
 * persisting them for a set of comics.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class ConvertComicsTask extends AbstractTask {
  @Autowired private TaskService taskService;
  @Autowired private ComicService comicService;
  @Autowired private ObjectFactory<ConvertComicTaskEncoder> saveComicTaskEncoderObjectFactory;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private List<Long> idList;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private ArchiveType targetArchiveType;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private boolean renamePages;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private boolean deletePages;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private boolean deleteOriginal;

  public ConvertComicsTask() {
    super(PersistedTaskType.CONVERT_COMIC);
  }

  @Override
  protected String createDescription() {
    return String.format(
        "Preparing to save %d comic%s", this.idList.size(), this.idList.size() == 1 ? "" : "s");
  }

  @Override
  @Transactional
  public void startTask() throws TaskException {
    log.debug(
        "Queueing up {} save comic task{}", this.idList.size(), this.idList.size() == 1 ? "" : "s");

    for (Long id : this.idList) {
      log.debug("Queueing task to save comic: id={}", id);
      Comic comic = null;
      try {
        comic = this.comicService.getComic(id);
      } catch (ComicException error) {
        throw new TaskException("failed to load comic", error);
      }
      ConvertComicTaskEncoder encoder = this.saveComicTaskEncoderObjectFactory.getObject();

      encoder.setComic(comic);
      encoder.setTargetArchiveType(this.targetArchiveType);
      encoder.setRenamePages(this.renamePages);
      encoder.setDeletePages(this.deletePages);
      encoder.setDeleteOriginal(this.deleteOriginal);
      try {
        PersistedTask persistedTask = encoder.encode();
        this.taskService.save(persistedTask);
      } catch (Exception error) {
        throw new TaskException("unable to queue comic conversion", error);
      }
    }
  }
}
