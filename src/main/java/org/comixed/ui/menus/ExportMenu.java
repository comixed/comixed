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

package org.comixed.ui.menus;

import java.util.ArrayList;
import java.util.List;

import javax.swing.JMenu;
import javax.swing.JMenuItem;

import org.comixed.ui.menus.MenuHelper.Menu;
import org.comixed.ui.menus.MenuHelper.MenuType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@Component
@PropertySource("classpath:menus.properties")
@ConfigurationProperties("app.submenu.export")
public class ExportMenu extends JMenu implements
                        InitializingBean
{
    private static final long serialVersionUID = 4935139045823208450L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    private List<Menu> menu = new ArrayList<>();

    @Autowired
    private MenuHelper menuHelper;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.logger.debug("Creating the export submenu");
        this.menuHelper.configureMenuItem(this, "export");
        for (Menu item : this.menu)
        {
            if (item.label == null)
            {
                continue;
            }
            if (item.type == MenuType.SEPARATOR)
            {
                this.logger.debug("Creating menu item: " + item.menu + "->" + item.label);
                this.addSeparator();
            }
            else if (item.type == MenuType.ITEM)
            {
                JMenuItem menuItem = this.menuHelper.createMenuItem(item.label, item.bean);
                if (menuItem != null)
                {
                    this.add(menuItem);
                }
            }
        }
    }

    public List<Menu> getMenu()
    {
        return this.menu;
    }
}
