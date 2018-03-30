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

import org.springframework.boot.Banner;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ComixEdApp implements
                        CommandLineRunner
{
    private static final int VERSION_MAJOR = 0;
    private static final int VERSION_MINOR = 1;
    private static final int VERSION_RELEASE = 1;
    public static final String VERSION = VERSION_MAJOR + "." + VERSION_MINOR + "." + VERSION_RELEASE;
    private static final String FULL_NAME = "ComixEd";
    public static final String FULL_NAME_AND_VERSION = FULL_NAME + " " + VERSION;

    public static void main(String[] args)
    {
        SpringApplication app = new SpringApplication(ComixEdApp.class);

        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }

    @Override
    public void run(String... args) throws Exception
    {}
}
