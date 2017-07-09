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

import java.util.Locale;

import javax.swing.AbstractAction;
import javax.swing.JMenuItem;
import javax.swing.KeyStroke;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>MenuHelper</code> provides methods for building menu items.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class MenuHelper
{
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private ApplicationContext context;

    public void configureMenuItem(JMenuItem menuItem, String label)
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

    public JMenuItem createMenuItem(String label, String beanName)
    {
        if (!this.context.containsBean(beanName)) return null;

        AbstractAction action = (AbstractAction )this.context.getBean(beanName);
        JMenuItem result = new JMenuItem(action);
        this.configureMenuItem(result, label);

        return result;
    }
}