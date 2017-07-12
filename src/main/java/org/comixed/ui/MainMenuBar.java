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

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.swing.AbstractAction;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.KeyStroke;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.ApplicationContext;
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
@ConfigurationProperties("app.menus")
public class MainMenuBar extends JMenuBar implements
                         InitializingBean
{
    public static class Menu
    {
        String menu;
        String label;
        String bean;

        public void setBean(String bean)
        {
            this.bean = bean;
        }

        public void setLabel(String label)
        {
            this.label = label;
        }

        public void setMenu(String menu)
        {
            this.menu = menu;
        }
    }

    private static final long serialVersionUID = -3549352202994937250L;

    private List<Menu> mainMenu = new ArrayList<>();

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private ApplicationContext context;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        // build the menu
        JMenu menu = null;
        Menu lastItem = null;
        for (Menu item : this.mainMenu)
        {
            // skip any undefined item due to the number in
            // application.properties
            if (item.menu == null)
            {
                continue;
            }
            // create the menu if necessary
            if ((lastItem == null) || !lastItem.menu.equals(item.menu))
            {
                this.logger.debug("Creating menu: " + item.menu);
                menu = new JMenu();
                this.configureMenuItem(menu, item.menu);
                this.add(menu);
            }
            // create and add the menu item
            this.logger.debug("Creating menu item: " + item.menu + "->" + item.label);
            if (item.label.equals("---"))
            {
                menu.addSeparator();
            }
            else
            {
                JMenuItem menuItem = this.createMenuItem(item.menu + "." + item.label, item.bean);
                if (menuItem != null)
                {
                    menu.add(menuItem);
                }
            }

            lastItem = item;
        }
    }

    private void configureMenuItem(JMenuItem menuItem, String label)
    {
        menuItem.setText(this.messageSource.getMessage("menu." + label + ".label", null, Locale.getDefault()));
        menuItem.setMnemonic(this.messageSource.getMessage("menu." + label + ".mnemonic", null, Locale.getDefault())
                                               .charAt(0));
        String accelerator = this.messageSource.getMessage("menu." + label + ".accelerator", null, null,
                                                           Locale.getDefault());

        if (accelerator != null)
        {
            menuItem.setAccelerator(KeyStroke.getKeyStroke(accelerator));
        }
    }

    private JMenuItem createMenuItem(String label, String actionName)
    {
        if (!this.context.containsBean(actionName))
        {
            this.logger.warn("No such menu bean: name=" + actionName);
            return null;
        }

        AbstractAction action = (AbstractAction )this.context.getBean(actionName);
        JMenuItem result = new JMenuItem(action);
        this.configureMenuItem(result, label);

        return result;
    }

    public List<Menu> getMainMenu()
    {
        return this.mainMenu;
    }
}
