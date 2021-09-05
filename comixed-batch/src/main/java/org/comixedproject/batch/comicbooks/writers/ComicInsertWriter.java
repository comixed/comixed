/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.writers;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicService;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicInsertWriter</code> publishes comics after they're ready to insert into the database.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicInsertWriter implements ItemWriter<Comic> {
  @Autowired private ComicService comicService;

  @Override
  public void write(final List<? extends Comic> comics) throws Exception {
    comics.forEach(
        comic -> {
          log.trace("Saving comic: {}", comic.getFilename());
          this.comicService.save(comic);
        });
  }
}
