/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import java.io.File;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.utils.ComicFileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicWorkerTask</code> handles moving a single comic file to a new location, creating
 * the subdirectory structure as needed, and updating the database.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class MoveComicWorkerTask extends AbstractWorkerTask {
  @Autowired private ComicService comicService;

  private Comic comic;
  private String destination;
  private String renamingRule;

  public void setComic(Comic comic) {
    this.comic = comic;
  }

  public void setDirectory(String destination) {
    this.destination = destination;
  }

  @Override
  public void startTask() throws WorkerTaskException {
    File sourceFile = null;
    try {
      sourceFile = this.renameOriginalFile();
    } catch (IOException error) {
      throw new WorkerTaskException("Could not rename original comic file", error);
    }
    File destFile = new File(this.getRelativeDestination(), getRelativeComicFilename());
    String defaultExtension = FilenameUtils.getExtension(comic.getFilename());
    destFile =
        new File(
            ComicFileUtils.findAvailableFilename(destFile.getAbsolutePath(), 0, defaultExtension));

    // if the source and target are the same, then skip the file
    if (destFile.equals(sourceFile)) {
      log.debug("Source and target are the same: " + destFile.getAbsolutePath());
      return;
    }

    // create the directory if it doesn't exist
    if (!destFile.getParentFile().exists()) {
      log.debug("Creating directory: " + destFile.getParentFile().getAbsolutePath());
      destFile.getParentFile().mkdirs();
    }
    try {
      log.debug("Moving comic: " + this.comic.getFilename() + " -> " + this.destination);

      FileUtils.moveFile(sourceFile, destFile);

      log.debug("Updating comic in database");
      this.comic.setFilename(destFile.getAbsolutePath());
      this.comicService.save(this.comic);
    } catch (IOException error) {
      throw new WorkerTaskException("Failed to move comic", error);
    }
  }

  private File renameOriginalFile() throws IOException {
    String originalFilename = this.comic.getFilename();
    String newFilename = originalFilename + "-old";
    File result = new File(newFilename);

    log.debug("Renaming comic file: {} => {}", originalFilename, newFilename);
    FileUtils.moveFile(new File(originalFilename), result);
    return result;
  }

  private String getRelativeDestination() {
    StringBuffer result = new StringBuffer(this.destination);

    this.addDirectory(result, this.comic.getPublisher());
    this.addDirectory(result, this.comic.getSeries());
    this.addDirectory(result, this.comic.getVolume());

    return result.toString();
  }

  private String getRelativeComicFilename() {
    StringBuffer result = new StringBuffer();

    result.append(comic.getSeries() != null ? comic.getSeries() : "Unknown");
    result.append(" v" + (comic.getVolume() != null ? comic.getVolume() : "Unknown"));
    result.append(" #" + (comic.getIssueNumber() != null ? comic.getIssueNumber() : "0000"));

    return result.toString();
  }

  private void addDirectory(StringBuffer result, String value) {
    result.append(File.separator);

    if ((value != null) && !value.isEmpty()) {
      result.append(value);
    } else {
      result.append("Unknown");
    }
  }

  @Override
  protected String createDescription() {
    final StringBuilder result = new StringBuilder();

    result
        .append("Moving comic:")
        .append(" comic=")
        .append(this.comic.getBaseFilename())
        .append(" from=")
        .append(FileUtils.getFile(this.comic.getFilename()).getAbsolutePath())
        .append(" to=")
        .append(this.destination);

    return result.toString();
  }

  /**
   * Sets the renaming rule to use.
   *
   * @param renamingRule the renaming rule
   */
  public void setRenamingRule(String renamingRule) {
    this.renamingRule = renamingRule;
  }
}
