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
import java.io.File;
import java.util.List;
import java.util.Locale;

import javax.swing.AbstractAction;
import javax.swing.JOptionPane;

import org.comixed.AppConfiguration;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.repositories.ComicRepository;
import org.comixed.tasks.MoveComicWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.ui.frames.MainFrame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>ConsolidateLibraryAction</code> allows for beginning the process of
 * moving all library files to a structured, managed directory structure.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ConsolidateLibraryAction extends AbstractAction
{
    private static final long serialVersionUID = 609363007445174158L;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private AppConfiguration configuration;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private MainFrame mainFrame;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private ObjectFactory<MoveComicWorkerTask> taskFactory;

    @Autowired
    private Worker worker;

    @Override
    public void actionPerformed(ActionEvent e)
    {
        this.logger.debug("Preparing to consolidate library...");

        if (!this.configuration.hasOption(AppConfiguration.LIBRARY_ROOT))
        {
            JOptionPane.showMessageDialog(this.mainFrame,
                                          this.messageSource.getMessage("dialog.consolidate-library.missing-root.text",
                                                                        null, Locale.getDefault()),
                                          this.messageSource.getMessage("dialog.missing-config.title", null,
                                                                        Locale.getDefault()),
                                          JOptionPane.ERROR_MESSAGE);

        }
        else
        {
            File dir = new File(this.configuration.getOption(AppConfiguration.LIBRARY_ROOT));

            if (JOptionPane.showConfirmDialog(this.mainFrame,
                                              this.messageSource.getMessage("dialog.consolidate-library.label",
                                                                            new Object[]
                                                                            {this.configuration.getOption(AppConfiguration.LIBRARY_ROOT)},
                                                                            Locale.getDefault()),
                                              this.messageSource.getMessage("dialog.consolidate-library.title", null,
                                                                            Locale.getDefault()),
                                              JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION)
            {
                if (!dir.exists())
                {
                    logger.debug("Creating library directory: " + dir.getAbsolutePath());
                    dir.mkdir();
                }

                List<Comic> comics = comicSelectionModel.hasSelections() ? comicSelectionModel.getSelectedComics()
                                                                         : comicSelectionModel.getAllComics();

                if (comics.isEmpty())
                {
                    loadAllComics(comics);
                }

                for (Comic comic : comics)
                {
                    MoveComicWorkerTask task = taskFactory.getObject();

                    task.setComic(comic);
                    task.setDestination(dir.getAbsolutePath());
                    worker.addTasksToQueue(task);
                }
            }
        }
    }

    private void loadAllComics(List<Comic> comics)
    {
        logger.debug("Loading all comics");
        Iterable<Comic> selection = this.comicRepository.findAll();

        selection.forEach(comics::add);
    }
}
