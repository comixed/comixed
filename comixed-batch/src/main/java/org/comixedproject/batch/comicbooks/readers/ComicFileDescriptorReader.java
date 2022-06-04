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

package org.comixedproject.batch.comicbooks.readers;

import java.util.List;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * <code>ComicFileDescriptorReader</code> reads descriptors used to import comics into the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicFileDescriptorReader implements ItemReader<ComicFileDescriptor> {
  @Autowired private ComicFileService comicFileService;

  @Value("${comixed.batch.chunk-size}")
  @Getter
  private int batchChunkSize = 10;

  private List<ComicFileDescriptor> comicFileDescriptorList = null;

  @Override
  public ComicFileDescriptor read() {
    if (this.comicFileDescriptorList == null || this.comicFileDescriptorList.isEmpty()) {
      log.trace("Load more descriptors to process");
      this.comicFileDescriptorList =
          this.comicFileService.findComicFileDescriptors(this.batchChunkSize);
    }

    if (this.comicFileDescriptorList.isEmpty()) {
      log.trace("No descriptors to process");
      this.comicFileDescriptorList = null;
      return null;
    }

    final ComicFileDescriptor result = this.comicFileDescriptorList.remove(0);
    log.trace("Deleting descriptor record");
    this.comicFileService.deleteComicFileDescriptor(result);
    log.trace("Returning next comic to process");
    return result;
  }
}
