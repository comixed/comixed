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

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class QueueComicsWorkerTask extends AbstractWorkerTask
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private Worker worker;

    @Autowired
    private ObjectFactory<AddComicWorkerTask> taskFactory;

    public List<String> filenames = new ArrayList<>();

    public boolean deleteBlockedPages = false;

    public void setDeleteBlockedPages(boolean deleteBlockedPages)
    {
        this.logger.debug("Setting delete blocked pages flag to {}", deleteBlockedPages);
        this.deleteBlockedPages = deleteBlockedPages;
    }

    public void setFilenames(List<String> filenames)
    {
        this.filenames.addAll(filenames);
        this.logger.debug("Preparing to queue {} files for import", this.filenames.size());
    }

    @Override
    public void startTask() throws WorkerTaskException
    {
        this.logger.debug("Processing comics queue");

        long started = System.currentTimeMillis();

        for (String filename : this.filenames)
        {
            AddComicWorkerTask task = this.taskFactory.getObject();

            this.logger.debug("Will import comic: {}", filename);
            task.setFile(new File(filename));
            this.logger.debug("Setting delete blocked pages flag to {}", this.deleteBlockedPages);
            task.setDeleteBlockedPages(this.deleteBlockedPages);
            this.worker.addTasksToQueue(task);
        }

        this.logger.debug("Finished processing comics queue: {}ms", System.currentTimeMillis() - started);
    }
}
