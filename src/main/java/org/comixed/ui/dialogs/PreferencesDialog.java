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

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;

import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;

import org.comixed.AppConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>PreferencesDialog</code> displays a dialog allowing the user to
 * modify the application configuration.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class PreferencesDialog extends JDialog implements
                                 InitializingBean
{
    private static final long serialVersionUID = -2326299346696630087L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    private static final String CONFIG_DIALOG_XPOS = "dialog.config.x-pos";
    private static final String CONFIG_DIALOG_YPOS = "dialog.config.y-pos";
    private static final String CONFIG_DIALOG_WIDTH = "dialog.config.width";
    private static final String CONFIG_DIALOG_HEIGHT = "dialog.config.height";

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private AppConfiguration configuration;

    public PreferencesDialog()
    {
        this.setModal(true);
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.setTitle(this.messageSource.getMessage("dialog.config.title", null, this.getLocale()));
        createContent();
        this.setLocation(this.getDefaultLocation());
        this.setSize(this.getDefaultSize());

        // add a component listener to persist changes in size and location
        this.addComponentListener(new ComponentListener()
        {
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
            public void componentShown(ComponentEvent event)
            {}

            private void saveState(ComponentEvent event)
            {
                PreferencesDialog.this.configuration.setOption(CONFIG_DIALOG_XPOS,
                                                                 String.valueOf(PreferencesDialog.this.getX()));
                PreferencesDialog.this.configuration.setOption(CONFIG_DIALOG_YPOS,
                                                                 String.valueOf(PreferencesDialog.this.getY()));
                PreferencesDialog.this.configuration.setOption(CONFIG_DIALOG_WIDTH,
                                                                 String.valueOf(PreferencesDialog.this.getWidth()));
                PreferencesDialog.this.configuration.setOption(CONFIG_DIALOG_HEIGHT,
                                                                 String.valueOf(PreferencesDialog.this.getHeight()));
                PreferencesDialog.this.configuration.save();
            }
        });
    }

    private void createContent()
    {
        JPanel content = new JPanel();
        JTabbedPane tabbedPane = new JTabbedPane();

        tabbedPane.setTabPlacement(JTabbedPane.LEFT);

        tabbedPane.addTab(messageSource.getMessage("dialog.config.tab.general.label", null, getLocale()),
                          getGeneralTab());
        content.add(tabbedPane, BorderLayout.CENTER);
        // create the buttons
        JButton save = new JButton(messageSource.getMessage("dialog.button.save.label", null, getLocale()));
        save.addActionListener(new ActionListener()
        {
            @Override
            public void actionPerformed(ActionEvent e)
            {
                logger.debug("Saving configuration");
                PreferencesDialog.this.setVisible(false);
            }
        });
        JButton cancel = new JButton(messageSource.getMessage("dialog.button.cancel.label", null, getLocale()));
        cancel.addActionListener(new ActionListener()
        {
            @Override
            public void actionPerformed(ActionEvent e)
            {
                logger.debug("Canceling configuration changes");
                PreferencesDialog.this.setVisible(false);
            }
        });
        JPanel buttons = new JPanel();
        buttons.add(save);
        buttons.add(cancel);
        content.add(buttons, BorderLayout.SOUTH);
        this.add(content);
    }

    private JPanel getGeneralTab()
    {
        return new JPanel();
    }

    private Point getDefaultLocation()
    {
        if (this.configuration.hasOption(CONFIG_DIALOG_XPOS)
            && this.configuration.hasOption(CONFIG_DIALOG_YPOS)) return new Point(Integer.valueOf(this.configuration.getOption(CONFIG_DIALOG_XPOS)),
                                                                                  Integer.valueOf(this.configuration.getOption(CONFIG_DIALOG_YPOS)));

        // TODO get a better location
        return new Point(100, 100);
    }

    private Dimension getDefaultSize()
    {
        if (this.configuration.hasOption(CONFIG_DIALOG_WIDTH)
            && this.configuration.hasOption(CONFIG_DIALOG_HEIGHT)) return new Dimension(Integer.valueOf(this.configuration.getOption(CONFIG_DIALOG_WIDTH)),
                                                                                        Integer.valueOf(this.configuration.getOption(CONFIG_DIALOG_HEIGHT)));
        // TODO get a better size
        return new Dimension(640, 480);
    }
}
