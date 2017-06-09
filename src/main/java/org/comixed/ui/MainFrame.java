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

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.HeadlessException;
import java.awt.Point;
import java.awt.Toolkit;

import javax.swing.JFrame;

import org.comixed.ComixEdApp;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>MainFrame</code> defines the main window for the GUI application.
 * 
 * @author Darryl L. Pierce
 *
 */
public class MainFrame extends JFrame implements
                       InitializingBean
{
    private static final long serialVersionUID = -6880161504037716183L;

    @Autowired
    private MainClientPanel mainClientPane;
    @Autowired
    private StatusBar statusBar;
    @Autowired
    private MainMenuBar menuBar;

    public MainFrame() throws HeadlessException
    {
        super();
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        updateFrameTitle();
        // build the user interface
        getContentPane().add(mainClientPane, BorderLayout.CENTER);
        getContentPane().add(statusBar, BorderLayout.SOUTH);
        // set a default size and location
        setSize(getDefaultDimensions());
        setLocation(getDefaultLocation());
        // add the menubar
        setJMenuBar(menuBar);
    }

    private Dimension getDefaultDimensions()
    {
        Dimension area = Toolkit.getDefaultToolkit().getScreenSize();

        int width = (int )(area.getWidth() * 0.75);
        int height = (int )(area.getHeight() * 0.75);

        return new Dimension(width, height);
    }

    private Point getDefaultLocation()
    {
        Dimension area = Toolkit.getDefaultToolkit().getScreenSize();

        int xpos = (int )(area.getWidth() * 0.125);
        int ypos = (int )(area.getHeight() * 0.125);

        return new Point(xpos, ypos);
    }

    private void updateFrameTitle()
    {
        setTitle(ComixEdApp.FULL_NAME_AND_VERSION);
    }
}
