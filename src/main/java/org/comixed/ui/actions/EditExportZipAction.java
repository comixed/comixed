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

package org.comixed.ui.actions;

import java.awt.event.ActionEvent;

import javax.swing.AbstractAction;

import org.comixed.library.loaders.ZipArchiveLoader;
import org.comixed.library.model.ComicSelectionListener;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.tasks.ExportComicWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.ui.ComicTableView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EditExportZipAction extends AbstractAction implements
                                 InitializingBean,
                                 ComicSelectionListener
{
    private static final long serialVersionUID = 1187062644992838350L;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ZipArchiveLoader archiveLoader;

    @Autowired
    private ComicTableView tableView;

    @Autowired
    private ComicSelectionModel selectionModel;

    @Autowired
    private Worker worker;

    @Override
    public void actionPerformed(ActionEvent e)
    {
        this.logger.debug("Preparing to export comic to zip format");

        int[] selections = this.tableView.getSelectedRows();

        for (int selection : selections)
        {
            ExportComicWorkerTask task = new ExportComicWorkerTask(this.selectionModel.getComic(selection),
                                                                   this.archiveLoader);

            this.worker.addTasksToQueue(task);
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.selectionModel.addComicSelectionListener(this);
    }

    private void changeEnabledState()
    {
        this.setEnabled(this.selectionModel.hasSelections());
        this.logger.debug("Export Zip is now " + (this.isEnabled() ? "enabled" : "disabled"));
    }

    @Override
    public void comicListChanged()
    {
        this.changeEnabledState();
    }

    @Override
    public void selectionChanged()
    {
        this.changeEnabledState();
    }
}
