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

import java.awt.GridLayout;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;

import org.comixed.AppConfiguration;
import org.comixed.web.ComicVineWebRequest;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;

/**
 * <code>ComicVineConfiguration</code> captures the configuration settings used
 * for scraping data from the ComicVine APIs.
 * 
 * @author Darryl L. Pierce
 *
 */
public class ComicVineConfiguration extends JPanel implements
                                    InitializingBean
{
    private static final long serialVersionUID = -7530077572679269086L;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private AppConfiguration configuration;

    private JTextField apiKey = new JTextField();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        setLayout(new GridLayout(0, 2));
        apiKey.setText(configuration.getOption(ComicVineWebRequest.COMICVINE_API_KEY));
        add(new JLabel(messageSource.getMessage("dialog.config.tab.comicvine.apikey.label", null, getLocale())));
        add(apiKey);
    }

    public void saveConfiguration()
    {
        configuration.setOption(ComicVineWebRequest.COMICVINE_API_KEY, apiKey.getText());
    }
}
