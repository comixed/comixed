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

package org.comixed.ui.components;

import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.io.File;

import javax.swing.AbstractAction;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;

import org.comixed.AppConfiguration;
import org.comixed.ui.adaptors.FileChooserAdaptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;

/**
 * <code>LibraryConfiguration</code> allows for editing general library settings
 * and default values.
 *
 * @author Darryl L. Pierce
 *
 */
public class LibraryConfiguration extends JPanel implements
                                  InitializingBean
{
    private static final long serialVersionUID = 4042310274474496135L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private AppConfiguration configuration;

    @Autowired
    private FileChooserAdaptor fileChooserAdaptor;

    private JTextField libraryRootDirectory = new JTextField();
    private JCheckBox renamePagesOnExport = new JCheckBox();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.setLayout(new GridLayout(0, 3));
        this.add(new JLabel(this.messageSource.getMessage("dialog.config.tab.library.root-directory.text", null,
                                                          this.getLocale())));
        JButton directoryButton = new JButton(new AbstractAction()
        {
            private static final long serialVersionUID = 3769006433361648049L;

            @Override
            public void actionPerformed(ActionEvent e)
            {
                File dir = LibraryConfiguration.this.fileChooserAdaptor.chooseDirectory(LibraryConfiguration.this.messageSource.getMessage("dialog.config.tab.library.root-directory.title",
                                                                                                                                           null,
                                                                                                                                           LibraryConfiguration.this.getLocale()),
                                                                                        LibraryConfiguration.this.configuration.getOption(AppConfiguration.LIBRARY_ROOT));

                if (dir != null)
                {
                    LibraryConfiguration.this.logger.debug("User choose directory: " + dir.getAbsolutePath());
                    LibraryConfiguration.this.libraryRootDirectory.setText(dir.getAbsolutePath());
                }
            }
        });
        directoryButton.setText(this.messageSource.getMessage("dialog.button.browse.label", null, this.getLocale()));
        this.add(this.libraryRootDirectory);
        this.add(new JLabel()); // padding out the label area
        this.add(directoryButton);
        this.add(new JLabel(this.messageSource.getMessage("dialog.config.tab.library.rename-pages.text", null,
                                                          this.getLocale())));
        this.add(this.renamePagesOnExport);
        this.loadConfiguration();
    }

    private void loadConfiguration()
    {
        if (this.configuration.hasOption(AppConfiguration.LIBRARY_ROOT))
        {
            this.libraryRootDirectory.setText(this.configuration.getOption(AppConfiguration.LIBRARY_ROOT));
        }
        if (this.configuration.hasOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT))
        {
            this.renamePagesOnExport.setSelected(Boolean.valueOf(this.configuration.getOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT)));
        }
    }

    public void saveConfiguration()
    {
        this.configuration.setOption(AppConfiguration.LIBRARY_ROOT, this.libraryRootDirectory.getText());
        this.configuration.setOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT,
                                     String.valueOf(this.renamePagesOnExport.isSelected()));
        this.configuration.save();
    }
}
