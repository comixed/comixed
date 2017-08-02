/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicWorkerTask</code> handles moving a single comic file to a new
 * location, creating the subdirectory structure as needed, and updating the
 * database.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
@Scope("prototype")
public class MoveComicWorkerTask extends AbstractWorkerTask
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    private Comic comic;
    private String destination;

    @Override
    public void startTask() throws WorkerTaskException
    {
        File sourceFile = new File(comic.getFilename());
        File destFile = new File(destination, FilenameUtils.getName(comic.getFilename()));

        // if the source and target are the same, then skip the file
        if (destFile.equals(sourceFile))
        {
            logger.debug("Source and target are the same...");
            return;
        }

        try
        {
            logger.debug("Moving comic: " + comic.getFilename() + " -> " + destination);

            FileUtils.moveFile(sourceFile, destFile);

            logger.debug("Updating comic in database");
            comic.setFilename(destFile.getAbsolutePath());
            comicRepository.save(comic);
            comicSelectionModel.reload();
        }
        catch (IOException error)
        {
            throw new WorkerTaskException("Failed to move comic", error);
        }
    }

    public void setComic(Comic comic)
    {
        this.comic = comic;
    }

    public void setDestination(String destination)
    {
        this.destination = destination;
    }
}
