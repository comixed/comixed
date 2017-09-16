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
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DeleteComicsWorkerTask extends AbstractWorkerTask implements
                                    WorkerTask
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicRepository repository;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    private List<Comic> comics;
    private boolean deleteFiles;

    public void setComics(List<Comic> comics)
    {
        this.comics = comics;
    }

    public void setDeleteFiles(boolean deleteFiles)
    {
        this.deleteFiles = deleteFiles;
    }

    @Override
    public void startTask() throws WorkerTaskException
    {
        for (Comic comic : this.comics)
        {
            if (this.deleteFiles)
            {
                this.logger.debug("Deleting comic file: " + comic.getFilename());
                File file = new File(comic.getFilename());

                try
                {
                    FileUtils.forceDelete(file);
                    this.logger.debug("Removing comic from repository: " + comic);
                }
                catch (IOException error)
                {
                    this.logger.error("Unable to delete comic: " + comic.getFilename(), error);
                }
            }

            this.repository.delete(comic);
        }

        this.comicSelectionModel.reload();
    }
}
