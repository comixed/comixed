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

package org.comixedproject.task.model;

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>UndeleteComicWorkerTask</code> handles undeleting a single comic previously marked for
 * deletion.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class UndeleteComicWorkerTask extends AbstractWorkerTask {
  @Autowired private ComicService comicService;

  private Comic comic;

  @Override
  protected String createDescription() {
    return String.format("Undelete comic: id=%d", this.comic.getId());
  }

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    log.debug("Undeleting comic: id={}", this.comic.getId());

    this.comic.setDateDeleted(null);
    this.comic.setDateLastUpdated(new Date());
    this.comicService.save(this.comic);
  }

  public void setComic(final Comic comic) {
    this.comic = comic;
  }
}
