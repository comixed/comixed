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
import org.comixed.library.model.Comic;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DeleteComicsWorkerTask
        extends AbstractWorkerTask
        implements WorkerTask {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComicRepository repository;

    private List<Comic> comics;
    private boolean deleteFiles;
    private List<Long> comicIds;

    public void setComicIds(List<Long> comicIds) {
        this.comicIds = comicIds;
    }

    public void setComics(List<Comic> comics) {
        this.comics = comics;
    }

    public void setDeleteFiles(boolean deleteFiles) {
        this.deleteFiles = deleteFiles;
    }

    @Override
    public void startTask()
            throws
            WorkerTaskException {
        if (this.comics == null) {
            this.logger.debug("No comics provided.");
            if (this.comicIds == null)
                throw new WorkerTaskException("No comics provided for deletion");

            this.comics = new ArrayList<>();
            for (Long comicId : this.comicIds) {
                Optional<Comic> comic = this.repository.findById(comicId);
                if (comic.isPresent()) {
                    this.logger.debug("Adding comic with id={}",
                                      comicId);
                    this.comics.add(comic.get());
                } else {
                    this.logger.debug("No such comic: id={}",
                                      comicId);
                }
            }
        }
        for (int index = 0;
             index < this.comics.size();
             index++) {
            Comic comic = this.comics.get(index);

            this.logger.debug("Deleting {} of {} comic(s)",
                              index + 1,
                              this.comics.size());

            if (this.deleteFiles) {
                this.logger.debug("Deleting comic file: " + comic.getFilename());
                File file = new File(comic.getFilename());

                try {
                    FileUtils.forceDelete(file);
                    this.logger.debug("Removing comic from repository: " + comic);
                }
                catch (IOException error) {
                    this.logger.error("Unable to delete comic: " + comic.getFilename(),
                                      error);
                }
            }

            this.repository.delete(comic);
        }
    }

    @Override
    protected String createDescription() {
        final StringBuilder result = new StringBuilder();

        result.append("Delete comic:")
              .append(" comic count=")
              .append(this.comics.size())
              .append(" delete files=")
              .append(this.deleteFiles
                      ? "Yes"
                      : "No");

        return result.toString();
    }
}
