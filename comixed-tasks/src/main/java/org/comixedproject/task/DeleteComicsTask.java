/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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
import java.text.MessageFormat;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.adaptors.TaskAdaptor;
import org.comixedproject.task.encoders.DeleteComicTaskEncoder;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteComicsTask</code> handles creating persisted instances of {@link DeleteComicTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class DeleteComicsTask extends AbstractTask {
  @Autowired private ComicService comicService;
  @Autowired private TaskAdaptor taskAdaptor;
  @Autowired private TaskService taskService;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private List<Long> comicIds;

  public DeleteComicsTask() {
    super(PersistedTaskType.DELETE_COMICS);
  }

  @Override
  protected String createDescription() {
    return MessageFormat.format(
        "Enqueuing {0} comic{1} for deletion",
        this.comicIds.size(), this.comicIds.size() == 1 ? "" : "s");
  }

  @Override
  public void startTask() throws TaskException {
    for (int index = 0; index < this.comicIds.size(); index++) {
      final Long id = this.comicIds.get(index);
      Comic comic;
      try {
        comic = this.comicService.getComic(id);
      } catch (ComicException error) {
        throw new TaskException("failed to load comic", error);
      }

      if (comic != null) {
        try {
          final DeleteComicTaskEncoder encoder;
          encoder = this.taskAdaptor.getEncoder(PersistedTaskType.DELETE_COMIC);
          encoder.setComic(comic);
          encoder.setDeleteComicFile(false);
          this.taskService.save(encoder.encode());
        } catch (TaskException error) {
          log.error("Failed to encode delete comic task", error);
        }
      }
    }
  }
}
