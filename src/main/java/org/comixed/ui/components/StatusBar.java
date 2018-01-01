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

import java.awt.BorderLayout;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.border.BevelBorder;

import org.comixed.adaptors.StatusAdaptor;
import org.comixed.adaptors.StatusListener;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>StatusBar</code> shows ongoing status of the application subsystems.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class StatusBar extends JPanel implements
                       InitializingBean,
                       StatusListener
{
    private static final long serialVersionUID = 228129338982896691L;

    private JLabel statusText = new JLabel();

    @Autowired
    private StatusAdaptor statusAdaptor;
    @Autowired
    private LibraryDetailsPanel libraryDetailsPanel;

    public StatusBar()
    {
        super();
        this.setBorder(new BevelBorder(BevelBorder.LOWERED));
        this.add(this.statusText, BorderLayout.CENTER);
        this.statusText.setHorizontalAlignment(JLabel.LEFT);
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        // add components to the status bar
        this.add(libraryDetailsPanel);
        this.statusAdaptor.addStatusListener(this);
    }

    @Override
    public void statusTextChanged(String message)
    {
        this.statusText.setText(message);
    }
}
