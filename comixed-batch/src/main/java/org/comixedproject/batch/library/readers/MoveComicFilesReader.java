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

package org.comixedproject.batch.library.readers;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.OrganizingComic;
import org.comixedproject.service.library.OrganizingComicService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicFilesReader</code> returns comics that are to be moved.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class MoveComicFilesReader implements ItemReader<OrganizingComic> {
  @Value("${comixed.batch.organize-library.chunk-size:1}")
  @Getter
  private int chunkSize;

  @Autowired private OrganizingComicService organizingComicService;

  @Getter @Setter List<OrganizingComic> organizingComicList = null;

  @Override
  public OrganizingComic read() {
    if (this.organizingComicList == null || this.organizingComicList.isEmpty()) {
      log.trace("Load more comics to process");
      this.organizingComicList = this.organizingComicService.loadComics(this.chunkSize);
    }

    if (this.organizingComicList.isEmpty()) {
      log.trace("No comics to process");
      this.organizingComicList = null;
      return null;
    }

    log.trace("Returning next comic to process");
    return this.organizingComicList.remove(0);
  }
}
