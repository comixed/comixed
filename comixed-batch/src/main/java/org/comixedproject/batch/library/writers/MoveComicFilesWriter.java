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

package org.comixedproject.batch.library.writers;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.OrganizingComic;
import org.comixedproject.service.library.OrganizingComicService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicFilesWriter</code> updates records for comic books that have been organized.
 *
 * @author Darryl L. pierce
 */
@Component
@StepScope
@Log4j2
public class MoveComicFilesWriter implements ItemWriter<OrganizingComic> {
  @Autowired private OrganizingComicService organizingComicService;

  @Override
  public void write(final Chunk<? extends OrganizingComic> comics) {
    comics.forEach(organizingComic -> this.organizingComicService.saveComic(organizingComic));
  }
}
