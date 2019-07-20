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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.tasks;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.comixed.library.model.Comic;
import org.comixed.repositories.ComicRepository;
import org.comixed.utils.ComicFileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

/**
 * <code>MoveComicWorkerTask</code> handles moving a single comic file to a new
 * location, creating the subdirectory structure as needed, and updating the database.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope("prototype")
public class MoveComicWorkerTask
        extends AbstractWorkerTask {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicRepository comicRepository;

    private Comic comic;
    private String destination;

    public void setComic(Comic comic) {
        this.comic = comic;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    @Override
    public void startTask()
            throws
            WorkerTaskException {
        File sourceFile = new File(this.comic.getFilename());
        File destFile = new File(this.getRelativeDestination(),
                                 getRelativeComicFilename());
        String defaultExtension = FilenameUtils.getExtension(comic.getFilename());
        destFile = new File(ComicFileUtils.findAvailableFilename(destFile.getAbsolutePath(),
                                                                 0,
                                                                 defaultExtension));

        // if the source and target are the same, then skip the file
        if (destFile.equals(sourceFile)) {
            this.logger.debug("Source and target are the same: " + destFile.getAbsolutePath());
            return;
        }

        // create the directory if it doesn't exist
        if (!destFile.getParentFile()
                     .exists()) {
            this.logger.debug("Creating directory: " + destFile.getParentFile()
                                                               .getAbsolutePath());
            destFile.getParentFile()
                    .mkdirs();
        }
        try {
            this.logger.debug("Moving comic: " + this.comic.getFilename() + " -> " + this.destination);

            FileUtils.moveFile(sourceFile,
                               destFile);

            this.logger.debug("Updating comic in database");
            this.comic.setFilename(destFile.getAbsolutePath());
            this.comicRepository.save(this.comic);
        }
        catch (IOException error) {
            throw new WorkerTaskException("Failed to move comic",
                                          error);
        }
    }

    private String getRelativeDestination() {
        StringBuffer result = new StringBuffer(this.destination);

        this.addDirectory(result,
                          this.comic.getPublisher());
        this.addDirectory(result,
                          this.comic.getSeries());
        this.addDirectory(result,
                          this.comic.getVolume());

        return result.toString();
    }

    private String getRelativeComicFilename() {
        StringBuffer result = new StringBuffer();

        result.append(comic.getSeries() != null
                      ? comic.getSeries()
                      : "Unknown");
        result.append(" v" + (comic.getVolume() != null
                              ? comic.getVolume()
                              : "Unknown"));
        result.append(" #" + (comic.getIssueNumber() != null
                              ? comic.getIssueNumber()
                              : "0000"));

        return result.toString();
    }

    private void addDirectory(StringBuffer result,
                              String value) {
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

        result.append("Moving comic:")
              .append(" comic=")
              .append(this.comic.getBaseFilename())
              .append(" from=")
              .append(FileUtils.getFile(this.comic.getFilename())
                               .getAbsolutePath())
              .append(" to=")
              .append(this.destination);

        return result.toString();
    }
}
