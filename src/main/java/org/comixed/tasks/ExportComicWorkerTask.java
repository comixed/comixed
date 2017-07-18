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

import org.comixed.library.loaders.ArchiveLoader;
import org.comixed.library.loaders.ArchiveLoaderException;
import org.comixed.library.model.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Configurable;

@Configurable
public class ExportComicWorkerTask extends AbstractWorkerTask
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private Comic comic;
    private ArchiveLoader archiveLoader;

    public ExportComicWorkerTask(Comic comic, ArchiveLoader archiveLoader)
    {
        this.comic = comic;
        this.archiveLoader = archiveLoader;
    }

    @Override
    public void startTask() throws WorkerTaskException
    {
        logger.debug("Converting comic: " + comic.getFilename());

        try
        {
            archiveLoader.saveComic(comic);
        }
        catch (ArchiveLoaderException error)
        {
            throw new WorkerTaskException("Unable to convert comic", error);
        }
    }

}
