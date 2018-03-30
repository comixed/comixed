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

package org.comixed.ui.dialogs;

import java.awt.Dimension;
import java.awt.Point;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;

import javax.swing.JDialog;

import org.comixed.AppConfiguration;
import org.comixed.ui.components.DuplicatePagesPanel;
import org.comixed.ui.frames.MainFrame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;

public class DuplicatePagesDialog extends JDialog implements
                                  InitializingBean
{
    private static final long serialVersionUID = -5954915132269083078L;
    private static final String DELETE_DUPE_PAGE_DIALOG_XPOS = "dialog.duplicate-pages.x-pos";

    private static final String DELETE_DUP_PAGE_DIALOG_YPOS = "dialog.duplicate-pages.y-pos";
    private static final String DELETE_DUPE_PAGE_DIALOG_WIDTH = "dialog.duplicate-pages.width";
    private static final String DELETE_DUP_PAGE_DIALOG_HEIGHT = "dialog.duplicate-pages.height";
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private AppConfiguration configuration;

    @Autowired
    private DuplicatePagesPanel duplicatePagesPanel;

    @Autowired
    public DuplicatePagesDialog(MainFrame mainFrame)
    {
        super(mainFrame, true);
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.restoreDialogSizeAndLocation();
        this.setContentPane(this.duplicatePagesPanel);
        this.addComponentListener(new ComponentListener()
        {
            @Override
            public void componentHidden(ComponentEvent e)
            {}

            @Override
            public void componentMoved(ComponentEvent e)
            {
                this.storeDialogState();
            }

            @Override
            public void componentResized(ComponentEvent e)
            {
                this.storeDialogState();
            }

            @Override
            public void componentShown(ComponentEvent e)
            {}

            private void storeDialogState()
            {
                Point location = DuplicatePagesDialog.this.getLocation();
                Dimension size = DuplicatePagesDialog.this.getSize();
                DuplicatePagesDialog.this.configuration.setOption(DELETE_DUPE_PAGE_DIALOG_XPOS,
                                                                  String.valueOf(location.getX()));
                DuplicatePagesDialog.this.configuration.setOption(DELETE_DUP_PAGE_DIALOG_YPOS,
                                                                  String.valueOf(location.getY()));
                DuplicatePagesDialog.this.configuration.setOption(DELETE_DUPE_PAGE_DIALOG_WIDTH,
                                                                  String.valueOf(size.getWidth()));
                DuplicatePagesDialog.this.configuration.setOption(DELETE_DUP_PAGE_DIALOG_HEIGHT,
                                                                  String.valueOf(size.getHeight()));
                DuplicatePagesDialog.this.configuration.save();
            }
        });
    }

    private void restoreDialogSizeAndLocation()
    {
        if (this.configuration.hasOption(DELETE_DUPE_PAGE_DIALOG_XPOS)
            && this.configuration.hasOption(DELETE_DUP_PAGE_DIALOG_YPOS))
        {
            this.logger.debug("Restoring duplicate page dialog location...");
            this.setLocation(new Point(Double.valueOf(this.configuration.getOption(DELETE_DUPE_PAGE_DIALOG_XPOS))
                                             .intValue(),
                                       Double.valueOf(this.configuration.getOption(DELETE_DUP_PAGE_DIALOG_YPOS))
                                             .intValue()));
        }
        if (this.configuration.hasOption(DELETE_DUPE_PAGE_DIALOG_WIDTH)
            && this.configuration.hasOption(DELETE_DUP_PAGE_DIALOG_HEIGHT))
        {
            this.logger.debug("Restoring duplicate page dialog size...");
            this.setSize(new Dimension(Double.valueOf(this.configuration.getOption(DELETE_DUPE_PAGE_DIALOG_WIDTH))
                                             .intValue(),
                                       Double.valueOf(this.configuration.getOption(DELETE_DUP_PAGE_DIALOG_HEIGHT))
                                             .intValue()));
        }
    }
}
