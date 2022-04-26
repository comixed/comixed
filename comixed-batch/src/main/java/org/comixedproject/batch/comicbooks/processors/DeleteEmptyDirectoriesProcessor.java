/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.processors;

import java.io.File;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.ArrayUtils;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteEmptyDirectoriesProcessor</code> deletes a directory that contains no content.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class DeleteEmptyDirectoriesProcessor implements ItemProcessor<File, Void> {
  @Autowired private FileAdaptor fileAdaptor;

  @Override
  public Void process(final File directory) throws Exception {
    if (ArrayUtils.isEmpty(directory.listFiles())) {
      log.trace("Deleting empty directory: {}", directory.getAbsolutePath());
      this.fileAdaptor.deleteDirectory(directory);
    }
    return null;
  }
}
