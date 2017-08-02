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

package org.comixed;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.Locale;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.stereotype.Component;

/**
 * <code>AppConfiguration</code> holds the configuration values persisted
 * between runs of the application.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class AppConfiguration implements
                              InitializingBean
{
    public static final String RENAME_COMIC_PAGES_ON_EXPORT = "library.export.rename-pages";

    public static final String LIBRARY_ROOT = "library.directory-root";

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    @Value("${configuration.filename}")
    private String filename;

    private boolean loaded = false;
    private Properties properties = new Properties();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        File file = new File(this.filename);

        if (file.exists())
        {
            this.logger.debug("Loading configuration: " + this.filename);

            this.properties.load(new FileInputStream(this.filename));
        }
        else
        {
            this.logger.debug("No configuration file found: " + this.filename);
        }
        this.loaded = true;
    }

    public String getOption(String name)
    {
        return this.properties.getProperty(name);
    }

    public boolean hasOption(String name)
    {
        return this.properties.containsKey(name);
    }

    public void save()
    {
        if (this.loaded)
        {
            this.logger.debug("Saving configuration: " + this.filename);
            try
            {
                this.properties.store(new FileOutputStream(this.filename),
                                      this.messageSource.getMessage("configuration.save-header", new Object[]
                                      {new Date()}, Locale.getDefault()));
            }
            catch (NoSuchMessageException
                   | IOException cause)
            {
                this.logger.error("Failed to save configuration", cause);
            }
        }
    }

    public void setOption(String name, String value)
    {
        this.properties.setProperty(name, value);
    }
}
