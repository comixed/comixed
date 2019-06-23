/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import org.comixed.importer.ImportFileProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import static java.lang.System.exit;

@SpringBootApplication
@EnableConfigurationProperties
public class ComiXedImporterApp implements ApplicationRunner {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ImportFileProcessor importFileProcessor;

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ComiXedImporterApp.class);
        app.run(args);
    }

    private void missingArgument(String name) {
        this.logger.info("Missing required argument: {}", name);
        exit(1);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (args.getSourceArgs().length == 0) {
            this.logger.error("No commandline options provided. Exiting...");
            exit(1);
        }

        if (!args.containsOption("source")) {
            this.missingArgument("source");
        }

        String source = args.getOptionValues("source")
                .get(0);

        if (args.containsOption("replacements")) {
            this.importFileProcessor.setReplacements(args.getOptionValues("replacements"));
        }

        this.logger.info("Source file: {}", source);

        this.importFileProcessor.process(source);
    }
}
