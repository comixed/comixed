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

import static org.comixedproject.batch.comicbooks.OrganizeLibraryConfiguration.ORGANIZE_LIBRARY_JOB_RENAMING_RULE;
import static org.comixedproject.batch.comicbooks.OrganizeLibraryConfiguration.ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY;
import static org.comixedproject.service.admin.ConfigurationService.CFG_DONT_MOVE_UNSCRAPED_COMICS;

import java.io.File;
import java.util.Objects;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.admin.ConfigurationService;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicFilesProcessor</code> performs the action of moving comics during the organization
 * process.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class MoveComicFilesProcessor
    implements ItemProcessor<ComicBook, ComicBook>, StepExecutionListener {
  @Autowired private ConfigurationService configurationService;
  @Autowired private FileAdaptor fileAdaptor;
  @Autowired private ComicFileAdaptor comicFileAdaptor;
  @Autowired private ComicBookAdaptor comicBookAdaptor;

  JobParameters jobParameters;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    if (!comicBook.getComicDetail().getFile().exists()) {
      log.error("Comic file not found: {}", comicBook.getComicDetail().getFilename());
      return comicBook;
    }

    if (this.configurationService.isFeatureEnabled(CFG_DONT_MOVE_UNSCRAPED_COMICS)
        && Objects.isNull(comicBook.getMetadata())) {
      log.error("Comic book is not scraped: id={}", comicBook.getId());
      return comicBook;
    }

    log.debug("Getting target directory: id={}", comicBook.getId());
    final File targetDirectory =
        new File(this.jobParameters.getString(ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY));
    log.trace("Getting renaming rule");
    final String renamingRule = this.jobParameters.getString(ORGANIZE_LIBRARY_JOB_RENAMING_RULE);

    try {
      log.trace("Creating target directory (if needed)");
      this.fileAdaptor.createDirectory(targetDirectory);
      log.trace("Getting comicBook extension");
      final String comicExtension = comicBook.getComicDetail().getArchiveType().getExtension();
      log.trace("Generating new comicBook filename");
      String rebuiltFilename =
          this.comicFileAdaptor.createFilenameFromRule(
              comicBook, renamingRule, targetDirectory.getAbsolutePath());
      final File metadataSourceFile =
          new File(this.comicBookAdaptor.getMetadataFilename(comicBook));
      log.trace("Finding available filename");
      File comicDetailFile = comicBook.getComicDetail().getFile();
      rebuiltFilename =
          this.comicFileAdaptor.findAvailableFilename(
              comicBook.getComicDetail().getFilename(), rebuiltFilename, 0, comicExtension);
      File rebuiltFile = new File(rebuiltFilename);
      if (!this.fileAdaptor.sameFile(rebuiltFile, comicDetailFile)) {
        log.debug(
            "Moving comicBook file: {} => {}",
            comicDetailFile.getAbsolutePath(),
            rebuiltFile.getAbsolutePath());
        this.fileAdaptor.moveFile(comicDetailFile, rebuiltFile);
        log.trace("Updating comicBook filename: {}", rebuiltFile.getAbsoluteFile());
        comicBook.getComicDetail().setFilename(rebuiltFile.getAbsolutePath());
        this.comicFileAdaptor.standardizeFilename(comicBook);
      } else {
        log.debug("Not moving file: already at destination");
      }

      if (metadataSourceFile.exists()) {
        File metadataTargetFile = new File(this.comicBookAdaptor.getMetadataFilename(comicBook));
        if (!this.fileAdaptor.sameFile(metadataSourceFile, metadataTargetFile)) {
          log.trace(
              "Moving comic metadata file: {} => {}",
              metadataSourceFile.getAbsolutePath(),
              metadataTargetFile.getAbsolutePath());
          this.fileAdaptor.moveFile(metadataSourceFile, metadataTargetFile);
        }
      }
    } catch (Exception error) {
      log.error("Failed to move comics", error);
    }

    return comicBook;
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
