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

import javax.swing.BoxLayout;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>ComicDetailsView</code> provides a detailed view of the comics in the
 * library.
 *
 * The view is divided into a details table on top, and a cover flow display
 * below.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
@PropertySource("classpath:menus.properties")
@ConfigurationProperties("app.comic-details-view.popup")
public class ComicDetailsView extends JPanel implements
                              InitializingBean
{
    private static final long serialVersionUID = -6175224786713877654L;

    @Autowired
    private ComicDetailsTable comicDetailsTable;
    @Autowired
    private ComicCoverFlowPanel comicCoverFlowPanel;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.setLayout(new BoxLayout(this, BoxLayout.PAGE_AXIS));

        // setup the view, restoring the divider position
        JSplitPane dividedView = new JSplitPane(JSplitPane.VERTICAL_SPLIT);

        dividedView.setTopComponent(new JScrollPane(this.comicDetailsTable));
        dividedView.setBottomComponent(new JScrollPane(this.comicCoverFlowPanel, JScrollPane.VERTICAL_SCROLLBAR_NEVER,
                                                       JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED));
        this.add(dividedView, BorderLayout.CENTER);
    }

}