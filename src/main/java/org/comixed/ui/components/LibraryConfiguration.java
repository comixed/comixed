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

import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JPanel;

import org.comixed.AppConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>LibraryConfiguration</code> allows for editing general library settings
 * and default values.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class LibraryConfiguration extends JPanel implements
                                  InitializingBean
{
    private static final long serialVersionUID = 4042310274474496135L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private AppConfiguration configuration;

    private JCheckBox renamePagesOnExport = new JCheckBox();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        setLayout(new GridLayout(0, 2));
        this.add(new JLabel(messageSource.getMessage("dialog.config.tab.library.rename-pages.text", null,
                                                     getLocale())));
        if (configuration.hasOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT))
        {
            renamePagesOnExport.setSelected(Boolean.valueOf(configuration.getOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT)));
        }
        this.add(renamePagesOnExport);
    }

    public void saveConfiguration()
    {
        configuration.setOption(AppConfiguration.RENAME_COMIC_PAGES_ON_EXPORT,
                                String.valueOf(renamePagesOnExport.isSelected()));
    }
}
