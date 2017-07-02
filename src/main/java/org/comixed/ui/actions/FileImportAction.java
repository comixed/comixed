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
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.swing.AbstractAction;
import javax.swing.JFileChooser;

import org.comixed.AppConfiguration;
import org.comixed.tasks.AddComicWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.ui.MainFrame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>FileImportAction</code> imports all comic files within a specified
 * directory.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class FileImportAction extends AbstractAction
{
    private static final long serialVersionUID = -5509387083770877459L;
    private static final String LAST_IMPORT_DIRECTORY = "file.import.last-directory";
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
        this.logger.debug("Asking user to select the top directory for import");
        this.fileChooser.setDialogTitle(this.messageSource.getMessage("dialog.file-chooser.import.title", null,
                                                                      Locale.getDefault()));
        this.fileChooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
        if (this.configuration.hasOption(LAST_IMPORT_DIRECTORY))
        {
            File file = new File(this.configuration.getOption(LAST_IMPORT_DIRECTORY));
            if (file.exists() && file.isDirectory())
            {
                this.logger.debug("Setting directory to the one last used: " + file.getAbsolutePath());
                this.fileChooser.setCurrentDirectory(file);
            }
        }
        if (this.fileChooser.showOpenDialog(this.mainFrame) == JFileChooser.APPROVE_OPTION)
        {
            // build the list of files to be imported
            List<File> filenames = this.getFileList(this.fileChooser.getSelectedFile());
            for (File filename : filenames)
            {
                AddComicWorkerTask task = this.taskFactory.getObject();

                task.setFile(filename);
                this.worker.addTasksToQueue(task);
            }

            this.configuration.setOption(LAST_IMPORT_DIRECTORY, this.fileChooser.getSelectedFile().getAbsolutePath());
            this.configuration.save();
        }
    }

    private List<File> getFileList(File root)
    {
        this.logger.debug("Getting all comic files under " + root.getAbsolutePath());
        List<File> result = new ArrayList<>();
        this.searchDirectory(root, result);
        return result;
    }

    private void searchDirectory(File root, List<File> result)
    {
        this.logger.debug("Descending into " + root);
        File[] files = root.listFiles((FileFilter )pathname ->
        {
            String name = pathname.getName().toLowerCase();
            if (pathname.isFile() && !(name.endsWith(".cbz") || name.endsWith(".cbr"))) return false;
            return true;
        });

        for (File file : files)
        {
            if (file.isDirectory())
            {
                this.searchDirectory(file, result);
            }
            else
            {
                result.add(file);
            }
        }
    }
}
