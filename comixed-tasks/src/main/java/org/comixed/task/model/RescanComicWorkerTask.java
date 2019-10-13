/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.task.model;

import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.comixed.repositories.PageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RescanComicWorkerTask
        extends AbstractWorkerTask {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private PageRepository pageRepository;

    private Comic comic;

    public void setComic(Comic comic) {
        this.comic = comic;
    }

    @Override
    public void startTask()
            throws
            WorkerTaskException {
        this.logger.debug("Rescanning comic: id={} {}",
                          this.comic.getId(),
                          this.comic.getFilename());

        for (Page page : this.comic.getPages()) {
            this.logger.debug("Updating page metrics: {}",
                              page.getFilename());
            page.getWidth();
            page.getHeight();

            this.logger.debug("Saving page details");
            this.pageRepository.save(page);
        }
    }

    @Override
    protected String createDescription() {
        final StringBuilder result = new StringBuilder();

        result.append("Rescan comic:")
              .append(" comic=")
              .append(this.comic.getFilename());

        return result.toString();
    }
}
