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
import java.util.Locale;

import javax.swing.AbstractAction;
import javax.swing.JFileChooser;

import org.comixed.AppConfiguration;
import org.comixed.tasks.AddComicWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.ui.frames.MainFrame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>AddComicAction</code> lets the user select a single comic file to add to
 * the library.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class AddComicAction extends AbstractAction
{
    private static final long serialVersionUID = -3668945997213296168L;
    private static final String LAST_ADD_DIRECTORY = "file.add.last-directory";

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private JFileChooser fileChooser;
    @Autowired
    private MainFrame mainFrame;
    @Autowired
    private Worker worker;
    @Autowired
    private ObjectFactory<AddComicWorkerTask> taskFactory;
    @Autowired
    private AppConfiguration configuration;

    @Override
    public void actionPerformed(ActionEvent e)
    {
        logger.debug("Asking user to select a comic file to load");

        fileChooser.setDialogTitle(messageSource.getMessage("dialog.file-chooser.add.title", null,
                                                            Locale.getDefault()));
        if (configuration.hasOption(LAST_ADD_DIRECTORY))
        {
            File file = new File(configuration.getOption(LAST_ADD_DIRECTORY));
            if (file.exists() && file.isDirectory())
            {
                logger.debug("Setting directory to the one last used: " + file.getAbsolutePath());
                fileChooser.setCurrentDirectory(file);
            }
        }
        if (fileChooser.showOpenDialog(mainFrame) == JFileChooser.APPROVE_OPTION)
        {
            File file = fileChooser.getSelectedFile();
            logger.debug("User chose file: " + file.getAbsolutePath());
            AddComicWorkerTask task = taskFactory.getObject();
            task.setFile(file.getAbsoluteFile());
            worker.addTasksToQueue(task);
            configuration.setOption(LAST_ADD_DIRECTORY, file.getParent());
            configuration.save();
        }
    }
}
