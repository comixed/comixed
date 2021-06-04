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

package org.comixedproject.task;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.state.comic.ComicEvent;
import org.comixedproject.state.comic.ComicStateHandler;
import org.comixedproject.utils.ComicFileUtils;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>MoveComicTask</code> handles moving a single comic file to a new location, creating the
 * subdirectory structure as needed, and updating the database.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class MoveComicTask extends AbstractTask {
  private static final String FORBIDDEN_RULE_CHARACTERS = "[\"':\\\\*?|<>]";
  private static final String FORBIDDEN_PROPERTY_CHARACTERS = "[\"':\\\\/*?|<>]";
  private static final String UNKNOWN_VALUE = "Unknown";

  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ComicFileUtils comicFileUtils;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private Comic comic;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private String targetDirectory;

  @JsonView(View.AuditLogEntryDetail.class)
  @Getter
  @Setter
  private String renamingRule;

  private final SimpleDateFormat dateFormat = new SimpleDateFormat("MMM yyyy");

  public MoveComicTask() {
    super(PersistedTaskType.MOVE_COMIC);
  }

  @Override
  public void startTask() throws TaskException {
    File sourceFile = null;
    try {
      sourceFile = this.renameOriginalFile();
    } catch (IOException error) {
      throw new TaskException("Could not rename original comic file", error);
    }
    File destFile = new File(this.targetDirectory, getRelativeComicFilename());
    String defaultExtension = FilenameUtils.getExtension(comic.getFilename());
    destFile =
        new File(
            this.comicFileUtils.findAvailableFilename(
                destFile.getAbsolutePath(), 0, defaultExtension));

    // if the source and target are the same, then skip the file
    if (destFile.equals(sourceFile)) {
      log.debug("Source and target are the same: {}", destFile.getAbsolutePath());
      return;
    }

    // create the directory if it doesn't exist
    if (!destFile.getParentFile().exists()) {
      log.debug("Creating directory: {}", destFile.getParentFile().getAbsolutePath());
      destFile.getParentFile().mkdirs();
    }
    try {
      log.debug("Moving comic: {} -> {}", this.comic.getFilename(), this.targetDirectory);

      FileUtils.moveFile(sourceFile, destFile);

      log.debug("Updating comic in database");
      this.comic.setFilename(destFile.getAbsolutePath());
      log.trace("Firing comic event: moved");
      this.comicStateHandler.fireEvent(this.comic, ComicEvent.comicMoved);
    } catch (IOException error) {
      throw new TaskException("Failed to move comic", error);
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

  String getRelativeComicFilename() {
    if (StringUtils.isEmpty(this.renamingRule)) {
      log.debug(
          "No renaming rules: using original filename: {}",
          FilenameUtils.getBaseName(this.comic.getFilename()));
      return FilenameUtils.getBaseName(this.comic.getFilename());
    }

    log.debug("Scrubbing renaming rule: {}", this.renamingRule);
    final String rule = this.scrub(this.renamingRule, FORBIDDEN_RULE_CHARACTERS);

    log.debug("Generating relative filename based on renaming rule: {}", rule);

    final String publisher =
        StringUtils.isEmpty(this.comic.getPublisher())
            ? UNKNOWN_VALUE
            : scrub(this.comic.getPublisher());
    final String series =
        StringUtils.isEmpty(this.comic.getSeries()) ? UNKNOWN_VALUE : scrub(this.comic.getSeries());
    final String volume =
        StringUtils.isEmpty(this.comic.getVolume()) ? UNKNOWN_VALUE : this.comic.getVolume();
    final String issueNumber =
        StringUtils.isEmpty(this.comic.getIssueNumber())
            ? UNKNOWN_VALUE
            : scrub(this.comic.getIssueNumber());
    final String coverDate =
        this.comic.getCoverDate() != null
            ? dateFormat.format(this.comic.getCoverDate())
            : "No Cover Date";

    String result =
        rule.replace("$PUBLISHER", publisher)
            .replace("$SERIES", series)
            .replace("$VOLUME", volume)
            .replace("$ISSUE", issueNumber)
            .replace("$COVERDATE", coverDate);

    log.debug("Relative comic filename: {}", result);

    return result;
  }

  private String scrub(final String text) {
    return this.scrub(text, FORBIDDEN_PROPERTY_CHARACTERS);
  }

  private String scrub(final String text, final String forbidden) {
    log.trace("Pre-sanitized text: {}", text);
    return text.replaceAll(forbidden, "_");
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
        .append(this.targetDirectory);

    return result.toString();
  }
}
