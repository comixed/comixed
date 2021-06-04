/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.comic.PageService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>RescanComicTask</code> handles rescanning a comic and updating its physical data in the
 * database.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class RescanComicTask extends AbstractTask {
  @Autowired private PageService pageService;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private Comic comic;

  public RescanComicTask() {
    super(PersistedTaskType.RESCAN_COMIC);
  }

  @Override
  public void startTask() {
    log.debug("Rescanning comic: id={} {}", this.comic.getId(), this.comic.getFilename());

    for (Page page : this.comic.getPages()) {
      log.debug("Updating page metrics: {}", page.getFilename());
      page.getWidth();
      page.getHeight();

      log.debug("Saving page details");
      this.pageService.save(page);
    }
  }

  @Override
  protected String createDescription() {
    final StringBuilder result = new StringBuilder();

    result.append("Rescan comic:").append(" comic=").append(this.comic.getFilename());

    return result.toString();
  }
}
