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

package org.comixed.task.model;

import java.text.MessageFormat;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.task.TaskException;
import org.comixed.task.adaptors.TaskAdaptor;
import org.comixed.task.encoders.DeleteComicTaskEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class DeleteComicsWorkerTask extends AbstractWorkerTask {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ComicRepository comicRepository;
  @Autowired private TaskAdaptor taskAdaptor;
  private List<Long> comicIds;

  @Override
  protected String createDescription() {
    return MessageFormat.format(
        "Enqueuing {0} comic{1} for deletion",
        this.comicIds.size(), this.comicIds.size() == 1 ? "" : "s");
  }

  @Override
  public void startTask() throws WorkerTaskException {
    for (int index = 0; index < this.comicIds.size(); index++) {
      final Long id = this.comicIds.get(index);
      final Comic comic = this.comicRepository.getById(id);

      if (comic != null) {
        try {
          final DeleteComicTaskEncoder encoder;
          encoder = this.taskAdaptor.getActionDecoder(TaskType.DeleteComic);
          encoder.setComic(comic);
          encoder.setDeleteComicFile(false);
          this.taskAdaptor.save(encoder.encode());
        } catch (TaskException error) {
          this.logger.error("Failed to encode delete comic task", error);
        }
      }
    }
  }

  public void setComicIds(final List<Long> comicIds) {
    this.comicIds = comicIds;
  }
}
