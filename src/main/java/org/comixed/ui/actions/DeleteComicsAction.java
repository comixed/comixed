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
import javax.swing.JCheckBox;
import javax.swing.JOptionPane;

import org.comixed.AppConfiguration;
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

/**
 * <code>DeleteComicsAction</code> prompts the user and, if the user agrees,
 * deletes the comics they have selected.
 *
 * @author Darryl L. Pierce
 *
 */
public class DeleteComicsAction extends AbstractAction implements
                                InitializingBean,
                                ComicSelectionListener
{
    private static final long serialVersionUID = -2294529876125471390L;
    private static final String DELETE_COMIC_FILE = "file.remove.delete-also";
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private AppConfiguration config;
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
        JCheckBox deleteFiles = new JCheckBox(messageSource.getMessage("dialog.confirm.delete.include-file.label", null,
                                                                       Locale.getDefault()));
        if (config.hasOption(DELETE_COMIC_FILE))
        {
            deleteFiles.setSelected(Boolean.valueOf(config.getOption(DELETE_COMIC_FILE)));
        }
        Object[] params =
        {this.messageSource.getMessage("dialog.confirm.delete.message", new Object[]
                {comics.size()}, Locale.getDefault()),
         deleteFiles};

        if (JOptionPane.showConfirmDialog(this.mainFrame, params,
                                          this.messageSource.getMessage("dialog.confirm.delete.title", null,
                                                                        Locale.getDefault()),
                                          JOptionPane.YES_NO_OPTION,
                                          JOptionPane.WARNING_MESSAGE) == JOptionPane.YES_OPTION)
        {
            logger.debug("Delete files? " + (deleteFiles.isSelected() ? "Yes" : "No"));
            DeleteComicsWorkerTask task = this.taskFactory.getObject();

            task.setComics(comics);
            task.setDeleteFiles(deleteFiles.isSelected());
            this.worker.addTasksToQueue(task);
            config.setOption(DELETE_COMIC_FILE, String.valueOf(deleteFiles.isSelected()));
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
