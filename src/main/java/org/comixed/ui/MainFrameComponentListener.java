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

import java.awt.Frame;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;

import javax.swing.JFrame;

import org.comixed.AppConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MainFrameComponentListener</code> stores the changes to
 * {@link MainFrame} as they occur.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class MainFrameComponentListener implements
                                        ComponentListener
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private AppConfiguration configuration;

    @Override
    public void componentHidden(ComponentEvent e)
    {}

    @Override
    public void componentMoved(ComponentEvent event)
    {
        this.saveState(event);
    }

    @Override
    public void componentResized(ComponentEvent event)
    {
        this.saveState(event);
    }

    @Override
    public void componentShown(ComponentEvent e)
    {}

    private void saveState(ComponentEvent event)
    {
        logger.debug("Saving main window state");
        if (((JFrame )event.getComponent()).getExtendedState() == Frame.MAXIMIZED_BOTH)
        {
            configuration.setOption(MainFrame.MAINWIN_MAXIMIZED, Boolean.TRUE.toString());
        }
        else
        {
            configuration.setOption(MainFrame.MAINWIN_MAXIMIZED, Boolean.FALSE.toString());
            configuration.setOption(MainFrame.MAINWIN_WIDTH, String.valueOf(event.getComponent().getWidth()));
            configuration.setOption(MainFrame.MAINWIN_HEIGHT, String.valueOf(event.getComponent().getHeight()));
            configuration.setOption(MainFrame.MAINWIN_XPOS, String.valueOf(event.getComponent().getX()));
            configuration.setOption(MainFrame.MAINWIN_YPOS, String.valueOf(event.getComponent().getY()));
        }
        configuration.save();
    }
}
