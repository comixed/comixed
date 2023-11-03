/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import jakarta.annotation.PreDestroy;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeansException;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * <code>ComiXedApp</code> is the main entry point for the ComiXed application.
 *
 * @author Darryl L. Pierce
 */
@SpringBootApplication
@Log4j2
public class ComiXedApp implements CommandLineRunner, ApplicationContextAware {
  private ApplicationContext applicationContext;

  public static void main(String[] args) {
    new SpringApplication(ComiXedApp.class).run(args);
  }

  @Override
  public void run(String... args) throws Exception {
    // process any command line arguments here
  }

  @PreDestroy
  public void onDestroy() {
    log.info("Closing application context");
    ((ConfigurableApplicationContext) this.applicationContext).close();
    log.info("Shutting down");
  }

  @Override
  public void setApplicationContext(final ApplicationContext applicationContext)
      throws BeansException {
    this.applicationContext = applicationContext;
  }
}
