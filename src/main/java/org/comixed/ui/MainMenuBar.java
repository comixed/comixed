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

import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;

import org.comixed.ui.menus.MenuHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>MainMenuBar</code> manages the menu bar for the main application
 * window.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
@PropertySource("classpath:menus.properties")
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
    private MenuHelper menuHelper;

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
                this.menuHelper.configureMenuItem(menu, item.menu);
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
                JMenuItem menuItem = this.menuHelper.createMenuItem(item.menu + "." + item.label, item.bean);
                if (menuItem != null)
                {
                    menu.add(menuItem);
                }
            }

            lastItem = item;
        }
    }

    public List<Menu> getMainMenu()
    {
        return this.mainMenu;
    }
}
