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

package org.comixedproject.batch.comicbooks.processors;

import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.PARAM_RENAMING_RULE;
import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.PARAM_TARGET_DIRECTORY;

import java.io.File;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicProcessor</code> performs the action of moving comics during the consolidation
 * process.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MoveComicProcessor implements ItemProcessor<Comic, Comic>, StepExecutionListener {
  @Autowired private FileAdaptor fileAdaptor;
  @Autowired private ComicFileAdaptor comicFileAdaptor;

  private JobParameters jobParameters;

  @Override
  public Comic process(final Comic comic) {
    log.debug("Getting target directory: id={}", comic.getId());
    final File targetDirectory = new File(this.jobParameters.getString(PARAM_TARGET_DIRECTORY));
    log.trace("Getting renaming rule");
    final String renamingRule = this.jobParameters.getString(PARAM_RENAMING_RULE);

    try {
      log.trace("Creating target directory (if needed)");
      this.fileAdaptor.createDirectory(targetDirectory);
      log.trace("Getting comic extension");
      final String comicExtension = comic.getArchiveType().getExtension();
      log.trace("Generating new comic filename");
      String targetFilename = this.comicFileAdaptor.createFilenameFromRule(comic, renamingRule);
      log.trace("Finding available filename");
      targetFilename = String.format("%s/%s", targetDirectory, targetFilename);
      targetFilename =
          this.comicFileAdaptor.findAvailableFilename(targetFilename, 0, comicExtension);
      final File targetFile = new File(targetFilename);
      log.trace("Moving comic file");
      this.fileAdaptor.moveFile(comic.getFile(), targetFile);
      log.trace("Updating comic filename: {}", targetFile.getAbsoluteFile());
      comic.setFilename(targetFile.getAbsolutePath());
    } catch (IOException error) {
      log.error("Failed to move comics", error);
    }

    return comic;
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    log.trace("Loading execution context");
    this.jobParameters = stepExecution.getJobExecution().getJobParameters();
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    return null;
  }
}
