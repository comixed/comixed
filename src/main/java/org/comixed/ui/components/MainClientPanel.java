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

import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;

import org.comixed.AppConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MainClientPanel</code> manages the main portion of the application's
 * window.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class MainClientPanel extends JPanel implements
                             InitializingBean
{
    private static final long serialVersionUID = -6194561704845594236L;
    private static final String MAIN_CLIENT_DIVIDER_LOCATION = "window.main.client.divider.location";

    private static final String MAIN_CLIENT_LAST_DIVIDER_LOCATION = "window.main.client.divider.last.location";
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private SystemStatusPanel systemStatusPanel;

    @Autowired
    private ComicDetailsView detailsView;

    @Autowired
    private AppConfiguration configuration;

    public MainClientPanel()
    {
        super(new BorderLayout(), true);
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.logger.debug("Setting up table view");
        this.createLayout();
    }

    private void createLayout()
    {
        JSplitPane splitpane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, new JScrollPane(this.systemStatusPanel),
                                              new JScrollPane(this.detailsView));
        this.add(splitpane, BorderLayout.CENTER);

        // restore layout
        if (this.configuration.hasOption(MAIN_CLIENT_DIVIDER_LOCATION))
        {
            splitpane.setDividerLocation(Integer.parseInt(this.configuration.getOption(MAIN_CLIENT_DIVIDER_LOCATION)));
        }
        if (this.configuration.hasOption(MAIN_CLIENT_LAST_DIVIDER_LOCATION))
        {
            splitpane.setLastDividerLocation(Integer.parseInt(this.configuration.getOption(MAIN_CLIENT_LAST_DIVIDER_LOCATION)));
        }

        // add listener
        splitpane.addPropertyChangeListener(evt ->
        {
            MainClientPanel.this.configuration.setOption(MAIN_CLIENT_DIVIDER_LOCATION,
                                                         String.valueOf(splitpane.getDividerLocation()));
            MainClientPanel.this.configuration.setOption(MAIN_CLIENT_LAST_DIVIDER_LOCATION,
                                                         String.valueOf(splitpane.getLastDividerLocation()));
            MainClientPanel.this.configuration.save();
        });
    }
}
