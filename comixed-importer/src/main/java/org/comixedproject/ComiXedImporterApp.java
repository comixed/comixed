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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject;

import static java.lang.System.exit;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.importer.ImportFileProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
@Log4j2
public class ComiXedImporterApp implements ApplicationRunner {
  public static final String SOURCE_CMDLINE_ARG = "source";
  public static final String REPLACEMENTS_CMDLINE_ARG = "replacements";
  public static final String USER_CMDLINE_ARG = "user";

  @Autowired private ImportFileProcessor importFileProcessor;

  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(ComiXedImporterApp.class);
    app.run(args);
  }

  private void missingArgument(String name) {
    log.info("Missing required argument: {}", name);
    exit(1);
  }

  @Override
  public void run(ApplicationArguments args) throws Exception {
    if (args.getSourceArgs().length == 0) {
      log.error("No commandline options provided. Exiting...");
      exit(1);
    }

    if (!args.containsOption(SOURCE_CMDLINE_ARG)) {
      this.missingArgument(SOURCE_CMDLINE_ARG);
    }

    String source = args.getOptionValues(SOURCE_CMDLINE_ARG).get(0);

    if (args.containsOption(REPLACEMENTS_CMDLINE_ARG)) {
      this.importFileProcessor.setReplacements(args.getOptionValues(REPLACEMENTS_CMDLINE_ARG));
    }

    if (args.containsOption(USER_CMDLINE_ARG)) {
      this.importFileProcessor.setImportUser(args.getOptionValues(USER_CMDLINE_ARG).get(0));
    }

    log.info("Source file: {}", source);

    this.importFileProcessor.process(source);

    exit(0);
  }
}
