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

package org.comixed.ui.adaptors;

import java.io.File;

import javax.swing.JFileChooser;

import org.comixed.ui.frames.MainFrame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>FileChooserAdaptor</code> provides a centralized way for the UI to show
 * a file and directory choosing dialog and for accessing the choices made.
 *
 * @author Darryl L. Pierce
 *
 */
public class FileChooserAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MainFrame mainFrame;

    @Autowired
    private JFileChooser fileChooser;

    /**
     * Shows the directory selection dialog box, returning the directory
     * selected.
     *
     * @param title
     *            the dialog title
     * @param startDirectory
     *            the starting directory
     * @return the selected directory, or <code>null</code> if none was selected
     */
    public File chooseDirectory(String title, String startDirectory)
    {
        this.logger.debug("Prompting user for a directory");

        this.fileChooser.setDialogTitle(title);
        this.fileChooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);

        if (startDirectory != null)
        {
            File file = new File(startDirectory);
            if (file.exists() && file.isDirectory())
            {
                this.logger.debug("Setting directory to: " + file.getAbsolutePath());
                this.fileChooser.setCurrentDirectory(file);
            }
        }
        return this.promptUserForFile();
    }

    /**
     * Prompts the user to select a single comic file.
     *
     * @param title
     *            the dialog title
     * @param startDirectory
     *            the starting directory
     * @return the file, or null if no was selected
     */
    public File chooseFile(String title, String startDirectory)
    {
        this.logger.debug("Prompting user for a file");

        this.fileChooser.setDialogTitle(title);
        this.fileChooser.setFileSelectionMode(JFileChooser.FILES_ONLY);

        if (startDirectory != null)
        {

        }
        if (startDirectory != null)
        {
            File file = new File(startDirectory);
            if (file.exists() && file.isDirectory())
            {
                this.logger.debug("Setting directory to the one last used: " + file.getAbsolutePath());
                this.fileChooser.setCurrentDirectory(file);
            }
        }
        return this.promptUserForFile();
    }

    private File promptUserForFile()
    {
        if (this.fileChooser.showOpenDialog(this.mainFrame) == JFileChooser.APPROVE_OPTION)
        {
            this.logger.debug("User selected directory: " + this.fileChooser.getSelectedFile());
            return this.fileChooser.getSelectedFile();
        }
        else
        {
            this.logger.debug("No directory selected");
            return null;
        }
    }
}
