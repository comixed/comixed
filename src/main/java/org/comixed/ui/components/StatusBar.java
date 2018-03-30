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

import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.border.BevelBorder;

import org.comixed.adaptors.StatusAdaptor;
import org.comixed.adaptors.StatusListener;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>StatusBar</code> shows ongoing status of the application subsystems.
 *
 * @author Darryl L. Pierce
 *
 */
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
    @Autowired
    private WorkerQueueDetailsPanel workerQueueDetailsPanel;

    public StatusBar()
    {
        super();
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        // set the layout of the status bar
        this.setBorder(new BevelBorder(BevelBorder.LOWERED));
        this.setLayout(new GridBagLayout());
        GridBagConstraints c = new GridBagConstraints();

        // add components to the status bar
        c.gridx = 0;
        c.gridy = 0;
        c.weightx = 0.0;
        c.ipadx = 5;
        c.ipady = 5;
        c.anchor = GridBagConstraints.LINE_START;
        this.add(libraryDetailsPanel, c);

        c.gridx = 1;
        c.weightx = 1.0;
        c.fill = GridBagConstraints.HORIZONTAL;
        this.add(this.statusText, c);
        this.statusText.setHorizontalAlignment(JLabel.LEFT);

        c.gridx = 2;
        c.weightx = 0.0;
        c.gridwidth = GridBagConstraints.REMAINDER;
        c.fill = GridBagConstraints.NONE;
        this.add(this.workerQueueDetailsPanel, c);

        this.statusAdaptor.addStatusListener(this);
    }

    @Override
    public void statusTextChanged(String message)
    {
        this.statusText.setText(message);
    }
}
