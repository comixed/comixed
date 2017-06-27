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

package org.comixed.ui;

import java.util.Locale;

import javax.swing.Action;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.KeyStroke;

import org.comixed.ui.actions.FileAddAction;
import org.comixed.ui.actions.FileExitAction;
import org.comixed.ui.actions.FileImportAction;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>MainMenuBar</code> manages the menu bar for the main application
 * window.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class MainMenuBar extends JMenuBar implements
                         InitializingBean
{
    private static final long serialVersionUID = -3549352202994937250L;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private FileExitAction fileExitAction;
    @Autowired
    private FileAddAction fileAddAction;
    @Autowired
    private FileImportAction fileImportAction;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.add(buildFileMenu());
    }

    private JMenu buildFileMenu()
    {
        JMenu result = new JMenu();

        configureMenuItem(result, "file");
        result.add(createMenuItem("file.add", fileAddAction));
        result.add(createMenuItem("file.import", fileImportAction));
        result.addSeparator();
        result.add(createMenuItem("file.exit", fileExitAction));

        return result;
    }

    private JMenuItem createMenuItem(String label, Action action)
    {
        JMenuItem result = new JMenuItem(action);

        configureMenuItem(result, label);

        return result;
    }

    private void configureMenuItem(JMenuItem menuItem, String label)
    {
        menuItem.setText(messageSource.getMessage("menu." + label + ".label", null, Locale.getDefault()));
        menuItem.setMnemonic(messageSource.getMessage("menu." + label + ".mnemonic", null, Locale.getDefault())
                                          .charAt(0));
        String accelerator = messageSource.getMessage("menu." + label + ".accelerator", null, null,
                                                      Locale.getDefault());

        if (accelerator != null)
        {
            menuItem.setAccelerator(KeyStroke.getKeyStroke(accelerator));
        }
    }
}
