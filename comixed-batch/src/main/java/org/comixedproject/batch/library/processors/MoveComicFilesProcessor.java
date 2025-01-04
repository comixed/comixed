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

package org.comixedproject.batch.library.processors;

import static org.comixedproject.batch.library.OrganizeLibraryConfiguration.ORGANIZE_LIBRARY_JOB_RENAMING_RULE;
import static org.comixedproject.batch.library.OrganizeLibraryConfiguration.ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY;
import static org.comixedproject.service.admin.ConfigurationService.CFG_DONT_MOVE_UNSCRAPED_COMICS;

import java.io.File;
import java.util.Objects;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.library.OrganizingComic;
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
    implements ItemProcessor<OrganizingComic, OrganizingComic>, StepExecutionListener {
  @Autowired private ConfigurationService configurationService;
  @Autowired private FileAdaptor fileAdaptor;
  @Autowired private ComicFileAdaptor comicFileAdaptor;
  @Autowired private ComicBookAdaptor comicBookAdaptor;

  JobParameters jobParameters;

  @Override
  public OrganizingComic process(final OrganizingComic comic) {
    if (!comic.getFile().exists()) {
      log.error("Comic file not found: {}", comic.getFilename());
      return comic;
    }

    if (this.configurationService.isFeatureEnabled(CFG_DONT_MOVE_UNSCRAPED_COMICS)
        && Objects.isNull(comic.isScraped())) {
      log.error("Comic book is not scraped: id={}", comic.getComicBookId());
      return comic;
    }

    log.debug("Getting target directory: id={}", comic.getComicBookId());
    final File targetDirectory =
        new File(this.jobParameters.getString(ORGANIZE_LIBRARY_JOB_TARGET_DIRECTORY));
    log.trace("Getting renaming rule");
    final String renamingRule = this.jobParameters.getString(ORGANIZE_LIBRARY_JOB_RENAMING_RULE);

    try {
      log.trace("Creating target directory (if needed)");
      this.fileAdaptor.createDirectory(targetDirectory);
      log.trace("Getting comicBook extension");
      final String comicExtension = comic.getArchiveType().getExtension();
      log.trace("Generating new comicBook filename");
      String rebuiltFilename =
          this.comicFileAdaptor.createFilenameFromRule(
              comic, comic.getFilename(), renamingRule, targetDirectory.getAbsolutePath());
      final File metadataSourceFile =
          new File(this.comicBookAdaptor.getMetadataFilename(comic.getFilename()));
      log.trace("Finding available filename");
      File comicDetailFile = comic.getFile();
      rebuiltFilename =
          this.comicFileAdaptor.findAvailableFilename(
              comic.getFilename(), rebuiltFilename, 0, comicExtension);
      File rebuiltFile = new File(rebuiltFilename);
      if (!this.fileAdaptor.sameFile(rebuiltFile, comicDetailFile)) {
        log.debug(
            "Moving comicBook file: {} => {}",
            comicDetailFile.getAbsolutePath(),
            rebuiltFile.getAbsolutePath());
        this.fileAdaptor.moveFile(comicDetailFile, rebuiltFile);
        log.trace("Updating comicBook filename: {}", rebuiltFile.getAbsoluteFile());
        comic.setUpdatedFilename(
            this.comicFileAdaptor.standardizeFilename(rebuiltFile.getAbsolutePath()));
      } else {
        log.debug("Not moving file: already at destination");
      }

      if (metadataSourceFile.exists()) {
        File metadataTargetFile =
            new File(this.comicBookAdaptor.getMetadataFilename(comic.getFilename()));
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
