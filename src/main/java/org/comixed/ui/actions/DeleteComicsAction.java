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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.swing.AbstractAction;
import javax.swing.JOptionPane;

import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicSelectionListener;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.tasks.DeleteComicsWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.ui.components.ComicDetailsTable;
import org.comixed.ui.frames.MainFrame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteComicsAction</code> prompts the user and, if the user agrees,
 * deletes the comics they have selected.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class DeleteComicsAction extends AbstractAction implements
                                InitializingBean,
                                ComicSelectionListener
{
    private static final long serialVersionUID = -2294529876125471390L;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private MainFrame mainFrame;

    @Autowired
    private ComicDetailsTable detailsTable;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    @Autowired
    private Worker worker;

    @Autowired
    private ObjectFactory<DeleteComicsWorkerTask> taskFactory;

    @Override
    public void actionPerformed(ActionEvent e)
    {
        int[] rows = this.detailsTable.getSelectedRows();
        List<Comic> comics = new ArrayList<>();

        for (int row : rows)
        {
            comics.add(this.comicSelectionModel.getComic(row));
        }

        this.logger.debug("Prompting the user to delete " + comics.size() + " comics");

        if (JOptionPane.showConfirmDialog(this.mainFrame,
                                          this.messageSource.getMessage("dialog.confirm.delete.message", new Object[]
                                          {comics.size()}, Locale.getDefault()),
                                          this.messageSource.getMessage("dialog.confirm.delete.title", null,
                                                                        Locale.getDefault()),
                                          JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION)
        {
            boolean deleteFileAsWell = (JOptionPane.showConfirmDialog(this.mainFrame,
                                                                      this.messageSource.getMessage("dialog.confirm.delete.include-file.label",
                                                                                                    new Object[]
                                                                                                    {comics.size()},
                                                                                                    Locale.getDefault()),
                                                                      this.messageSource.getMessage("dialog.confirm.delete.include-file.title",
                                                                                                    null,
                                                                                                    Locale.getDefault()),
                                                                      JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION);
            {
                this.logger.debug("Deleting comics...");
                DeleteComicsWorkerTask task = this.taskFactory.getObject();

                task.setComics(comics);
                task.setDeleteFiles(deleteFileAsWell);
                this.worker.addTasksToQueue(task);
            }
        }
        else
        {
            this.logger.debug("User declined to delete comics...");
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.comicSelectionModel.addComicSelectionListener(this);
        this.toggleEnabled();
    }

    @Override
    public void comicListChanged()
    {/* ignored */ }

    @Override
    public void selectionChanged()
    {
        this.toggleEnabled();
    }

    private void toggleEnabled()
    {
        this.setEnabled(this.comicSelectionModel.hasSelections());
    }
}
